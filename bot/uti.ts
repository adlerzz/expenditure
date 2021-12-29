import {ID, Command, Record, Category, Descriptor} from './types';
import {DB} from './app';
import {DateUtils} from './date-utils';
import {DBAdapter} from './db/DBAdapter';

const USER_ID = '362211767'

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
    return DB.addCategory(category);
}

async function addAliases(name: string, aliasesStr: string): Promise<boolean>{
    const c = await DB.getCategoryBy(name);
    if(!c) {
        console.log('no ' + name);
        return false;
    }
    const id = c.id;
    const aliases = aliasesStr.split(' ').filter(s => s.length > 1).map(s => s.toUpperCase());
    return DB.updateCategory(id,{aliases});
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
    return DB.reset();
}

export async function main(){
    await resetDB();
    const inputStream = [
        "/add cat Goods ",
        "/add subcat goods: meat and fish",
        "/add aliases meat and fish: meat fish",
        "/add subcat goods: dairy",
        "/add subcat goods: eggs",
        "/add subcat goods: oil",
        "/add subcat goods: vegetables",
        "/add subcat goods: fruits",
        "/add subcat goods: drinks",
        "/add subcat goods: breads",
        "/add aliases breads: bread",
        "/add subcat goods: cereals and flakes",
        "/add aliases cereals and flakes: cereals flakes",
        "/add subcat goods: candies",
        "/add subcat goods: delicacy",
        "/add subcat goods: meals",
        "/add cat Big regular spends",
        "/add aliases Big regular spends: big",
        "/add subcat big: credit",
        "/add subcat big: rent",
        "/add subcat big: car service",
        "/add aliases car service: service TO",
        "/add subcat big: car insurance",
        "/add aliases car insurance: insurance",
        "/add subcat big: psychologists",
        "/add aliases psychologists: psy",
        "/show cat",
        "meat  4.80 ( to wine ) ",
        "meals 11,80 november",
        "bread 5.13 02-nov",
        "service 1100 dec"
    ];

    const parsedCommands = inputStream
        .filter(s => willBeCommand(s))
        .map(s => parseCommand(s));

    console.log(parsedCommands);

    parsedCommands.forEach( c => executeCommand(c));

    const descs = await getCategoriesDescriptors();

    console.log(['descs', descs]);

    const parsedRecords = await Promise.all(inputStream
        .filter(s => !willBeCommand(s))
        .map(async s => await parseRecord(s, descs, null)));

    parsedRecords.forEach( record => DB.addRecord(record));

    console.log(parsedRecords);


    const aDB = new DBAdapter();
    const cats = await aDB.getCategories();
    console.log()
}
