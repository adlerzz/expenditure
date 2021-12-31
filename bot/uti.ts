import {ID, Command, Record, Category, Descriptor} from './types';
import {DB} from './app';
import {DateUtils} from './date-utils';
import {DBAdapter} from './db/DBAdapter';

const USER_ID = '1';

function parseCurrency(text: string): number | null {
    if(text.search(/^\d+([,.]\d+)?$/) === -1){
        return null;
    }
    return +text.replace(',', '.');
}

function parseDescriptor(text: string, descriptors: Array<Descriptor>): ID {
    const descriptor = descriptors.filter( d => text.toUpperCase() === d.value ).pop();
    return descriptor?.id ?? null;
}

export function parseCommand(inputString: string): Command {
    /* /opcode param argument: value*/
    let rest = inputString;
    let result: Command = {} as Command;

    const opcodeEnd = rest.indexOf(' ');
    if(opcodeEnd === -1){
        result.opcode = rest.slice(1).toLowerCase();
        return result;
    }
    result.opcode = rest.slice(1, opcodeEnd).toLowerCase();
    rest = rest.slice(opcodeEnd + 1);

    const paramEnd = rest.indexOf(' ');
    if (paramEnd === -1) {
        result.param = rest;
        return result;
    }

    result.param = rest.slice(0, paramEnd).toLowerCase();
    rest = rest.slice(paramEnd + 1);

    const argEnd = rest.indexOf(':');

    if(argEnd === -1){
        result.argument = rest.trim();
        return result;
    }

    result.argument = rest.slice(0, argEnd).trim();
    result.additional = rest.slice(argEnd + 1).trim();

    return result;
}

export async function parseRecord(inputString: string, descriptors: Array<Descriptor>, messageId: number): Promise<Record> {
    const comment = (inputString.match(/\((.*)\)/) ?? []).pop()?.trim();

    const parts = (comment ? inputString.slice(0,inputString.indexOf('(')): inputString)
        .split(' ')
        .filter(s => s.length > 0);

    console.log(parts);
    const categoryId = parts.map( part => parseDescriptor(part, descriptors)).find(it => it);
    const timestamp = parts.map( part => DateUtils.parseDate(part)).find(it => it) ?? DateUtils.todayDate();
    const value = parts.map(part => parseCurrency(part)).find(it => it);


    return {
        id: await DB.nextRecordSequence(),
        categoryId,
        comment,
        timestamp,
        userId: USER_ID,
        value,
        messageId
    } as Record;
}


export function willBeCommand(text: string): boolean {
    const trimmed = text.trimStart();
    return trimmed.startsWith('/')
}

export async function executeCommand(command: Command): Promise<boolean> {
    let c: number;
    let result = false;
    switch (command.opcode) {
        case 'add':    c = 100; break;
        case 'edit':   c = 200; break;
        case 'show':   c = 300; break;
        case 'del':    c = 400; break;
        case 'reset':  c = 500; break
        default:       c = 0;
    }

    switch (command.param) {
        case 'cat':     c += 1; break;
        case 'subcat':  c += 2; break;
        case 'aliases': c += 3; break;
        case 'rec':     c += 4; break;
    }

    switch (c) {
        case 101: result = await createCategory(command.argument); break;
        case 102: result = await createSubcategory(command.argument, command.additional); break;
        case 103: result = await addAliases(command.argument, command.additional); break;
        case 301: result = await showCategories(); break;
        case 303: result = await showRecords(); break;
        case 500: result = await resetDB(); break;

    }
    console.log({command, result});
    return result;
}

async function createCategory(name: string): Promise<boolean> {
    if(await DB.getCategoryBy(name)){
        return false;
    }
    const category = {
        id: await DB.nextCategorySequence(),
        parentId: '0',
        name: name.toUpperCase(),
        aliases: []
    }
    return await DB.addCategory(category);
}

async function createSubcategory(parent: string, name: string): Promise<boolean>{
    const p = await DB.getCategoryBy(parent);
    if(!p) {
        console.log('no ' + parent);
        return false;
    }
    if(await DB.getCategoryBy(name)){
        console.log('already ' + name);
        return false;
    }
    const category = {
        id: await DB.nextCategorySequence(),
        parentId: p.id,
        name: name.toUpperCase(),
        aliases: []
    }
    return await DB.addCategory(category);
}

async function addAliases(name: string, aliasesStr: string): Promise<boolean>{
    const c = await DB.getCategoryBy(name);
    if(!c) {
        console.log('no ' + name);
        return false;
    }
    const id = c.id;
    const aliases = aliasesStr
        .split(' ')
        .filter(s => s.length > 1)
        .map(s => s.toUpperCase());
    return await DB.updateCategory(id,{aliases});
}

export async function getCategoriesDescriptors(): Promise<Array<Descriptor>> {
    const categories = await DB.getCategories();
    return categories
        .map(cat => ( {id: cat.id, descs: [cat.name, ...cat.aliases]}))
        .flatMap( ({id, descs}) => descs.map(desc => ( {id, value: desc} as Descriptor)));
}

async function showCategories(): Promise<boolean> {
    console.log(await DB.getCategories());
    return true;
}

async function showRecords(): Promise<boolean> {
    console.log(await DB.getRecords());
    return true;
}

async function resetDB(): Promise<boolean> {
    return await DB.reset();
}

export async function main(){
    await resetDB();
    const inputStream = [
        "/add cat Расходы",
        "/add aliases Расходы: outcomes",

        "/add cat Доходы",
        "/add aliases Доходы: incomes",

        "/add subcat Расходы: Крупные регулярные траты",
        "/add aliases Крупные регулярные траты: big",

        "/add subcat Расходы: Продукты",
        "/add aliases Продукты: goods",

        "/add subcat Расходы: Хобби и образование",
        "/add aliases Хобби и образование: hobby education хобби образование",

        "/add subcat Расходы: Здоровье",
        "/add aliases Здоровье: health",

        "/add subcat Расходы: Дом",
        "/add aliases Дом: house",

        "/add subcat Расходы: Домашние животные",
        "/add aliases Домашние животные: звери зверье животные коты pets cats",

        "/add subcat Расходы: Программные продукты",
        "/add aliases Программные продукты: программы сайты soft software sites",

        "/add subcat Расходы: Транспорт",
        "/add aliases Транспорт: transport",

        "/add subcat Расходы: Услуги ЖКХ, банков и госуслуги",
        "/add aliases Услуги ЖКХ, банков и госуслуги: жкх госуслуги",

        "/add subcat Расходы: Прочие расходы",
        "/add aliases Прочие расходы: разное",



        "/add subcat big: Кредит",
        "/add aliases Кредит: credit",

        "/add subcat big: Аренда квартиры",
        "/add aliases Аренда квартиры: rent rents",

        "/add subcat big: Техобслуживание машины и техосмотр",
        "/add aliases Техобслуживание машины и техосмотр: ТО техобслуживание техосмотр maintenance service inspection",

        "/add subcat big: Страховка машины",
        "/add aliases Страховка машины: страховка insurance",

        "/add subcat big: Сбережения",
        "/add aliases Сбережения: копилка saving savings",

        "/add subcat big: Психологи",
        "/add aliases Психологи: пси психолог psy psycho psychologist psychologists",


        "/add subcat goods: Обычные продукты",
        "/add aliases Обычные продукты: еда food",

        "/add subcat goods: Сладости",
        "/add aliases Сладости: candies sweets",

        "/add subcat goods: Обеды",
        "/add aliases Обеды: обед dinner",

        "/add subcat goods: Деликатесы",
        "/add aliases Деликатесы: delicacy delice",


        "/add subcat Здоровье: Медцентры",
        "/add aliases Медцентры: медцентр medcenter medcenters",

        "/add subcat Здоровье: Лекарства, витамины и БАДы",
        "/add aliases Лекарства, витамины и БАДы: лекарства витамины бады drugs meds vitamines supplements",

        "/add subcat Здоровье: Линзы и растворы",
        "/add aliases Линзы и растворы: линзы растворы раствор lenses solutions solution",


        "/add subcat Дом: Средства для стирки и уборки, клининг",
        "/add aliases Средства для стирки и уборки, клининг: порошок капсулы клининг мойка cleaning",

        "/add subcat Дом: Средства гигиены и ухода",
        "/add aliases Средства гигиены и ухода: мыло мыльное уходовое кремушки шампунь гель soap",

        "/add subcat Дом: Электрика и электроника",
        "/add aliases Электрика и электроника: электрика электроника лампочки батарейки electronics",


        "/add subcat pets: Корм",
        "/add aliases Корм: feed",

        "/add subcat pets: Туалет",
        "/add aliases Туалет: наполнитель litter",

        "/add subcat pets: Ветеринар",
        "/add aliases Ветеринар: вет ветка ветеринарка vet vets",


        "/add subcat soft: Подписки",
        "/add aliases Подписки: subscriptions",

        "/add subcat soft: Приложения",
        "/add aliases Приложения: apps applications",


        "/add subcat Транспорт: Топливо",
        "/add aliases Топливо: бензин бензо fuel",

        "/add subcat Транспорт: Мойка и шиномонтаж",
        "/add aliases Мойка и шиномонтаж: мойка шины шиномонтаж переобувка",

        "/add subcat Транспорт: Общественный транспорт",
        "/add aliases Общественный транспорт: автобус метро талон талончик жетон жетончик",


        "/add subcat жкх: Мобильные",
        "/add aliases Мобильные: абонплата абонентка mobile fee",

        "/add subcat жкх: Интернет",
        "/add aliases Интернет: internet wifi",

        "/add subcat жкх: Комуналка",
        "/add aliases Комуналка: платежи payments",

        "/add subcat жкх: Электричество",
        "/add aliases Электричество: свет electricity",

        "/add subcat жкх: Банковские комиссии",
        "/add aliases Банковские комиссии: комиссия комиссии банк",


        "/add subcat разное: Одежда и обувь",
        "/add aliases Одежда и обувь: одежда обувь",

        "/add subcat разное: Родители",
        "/add aliases Родители: мампап",

        "/add subcat разное: Кофейни, кафе, рестораны",
        "/add aliases Кофейни, кафе, рестораны: кофе кафе ресторан",

        "/add subcat разное: Личное",
        "/add aliases Личное: private",

        "/add subcat Доходы: Заработная плата",
        "/add aliases Заработная плата: зп аванс",

        "/add subcat Доходы: Премии и бонусы",
        "/add aliases Премии и бонусы: премия премии бонус бонусы",

        "/add subcat Доходы: Подработки",
        "/add aliases Подработки: подработка халтура фриланс",

        "/add subcat Доходы: Скидки и прочее",
        "/add aliases Скидки и прочее: скидки скидка кэшбэк",

        "/add subcat Доходы: Рефинансирование",
        "/add aliases Рефинансирование: возврат обмен валюта",


        "/show cat",
        "еда  24.80 ( к винишку ) ",
        "то 1150 ноябрь",
        "обед 5,10 02-nov",
        "кредит 1200 dec"
    ];

    const parsedCommands = inputStream
        .filter(s => willBeCommand(s))
        .map(s => parseCommand(s));

    // console.log(parsedCommands);

    for(const command of parsedCommands) {
        await executeCommand(command);
    }

    const descs = await getCategoriesDescriptors();

    console.log(['descs', descs]);

    const parsedRecords = await Promise.all(inputStream
        .filter(s => !willBeCommand(s))
        .map(async s => await parseRecord(s, descs, -12)));

    parsedRecords.forEach( record => DB.addRecord(record));

    console.log(parsedRecords);

}
