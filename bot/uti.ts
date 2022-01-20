import {DB} from './app';
import * as cpu from './CommandProcessor';
import * as parsers from './parsers';

const USER_ID = '1';

export async function main(){
    await cpu.resetDB();
    const inputStream = [
        "/addCategories Расходы",
        "/addAliases Расходы: outcomes",

        "/addCategories Доходы",
        "/addAliases Доходы: incomes",

        "/addCategories Расходы: Крупные регулярные траты",
        "/addAliases Крупные регулярные траты: big",

        "/addCategories Расходы: Продукты",
        "/addAliases Продукты: goods",

        "/addCategories Расходы: Хобби и образование",
        "/addAliases Хобби и образование: hobby education хобби образование",

        "/addCategories Расходы: Здоровье",
        "/addAliases Здоровье: health",

        "/addCategories Расходы: Дом",
        "/addAliases Дом: house",

        "/addCategories Расходы: Домашние животные",
        "/addAliases Домашние животные: звери зверье животные коты pets cats",

        "/addCategories Расходы: Программные продукты",
        "/addAliases Программные продукты: программы сайты soft software sites",

        "/addCategories Расходы: Транспорт",
        "/addAliases Транспорт: transport",

        "/addCategories Расходы: Услуги ЖКХ, банков и госуслуги",
        "/addAliases Услуги ЖКХ, банков и госуслуги: жкх госуслуги",

        "/addCategories Расходы: Прочие расходы",
        "/addAliases Прочие расходы: разное",



        "/addCategories big: Кредит",
        "/addAliases Кредит: credit",

        "/addCategories big: Аренда квартиры",
        "/addAliases Аренда квартиры: rent rents",

        "/addCategories big: Техобслуживание машины и техосмотр",
        "/addAliases Техобслуживание машины и техосмотр: ТО техобслуживание техосмотр maintenance service inspection",

        "/addCategories big: Страховка машины",
        "/addAliases Страховка машины: страховка insurance",

        "/addCategories big: Сбережения",
        "/addAliases Сбережения: копилка saving savings",

        "/addCategories big: Психологи",
        "/addAliases Психологи: пси психолог psy psycho psychologist psychologists",


        "/addCategories goods: Обычные продукты",
        "/addAliases Обычные продукты: еда food",

        "/addCategories goods: Сладости",
        "/addAliases Сладости: candies sweets",

        "/addCategories goods: Обеды",
        "/addAliases Обеды: обед dinner",

        "/addCategories goods: Деликатесы",
        "/addAliases Деликатесы: delicacy delice",


        "/addCategories Здоровье: Медцентры",
        "/addAliases Медцентры: медцентр medcenter medcenters",

        "/addCategories Здоровье: Лекарства, витамины и БАДы",
        "/addAliases Лекарства, витамины и БАДы: лекарства витамины бады drugs meds vitamines supplements",

        "/addCategories Здоровье: Линзы и растворы",
        "/addAliases Линзы и растворы: линзы растворы раствор lenses solutions solution",


        "/addCategories Дом: Средства для стирки и уборки, клининг",
        "/addAliases Средства для стирки и уборки, клининг: порошок капсулы клининг мойка cleaning",

        "/addCategories Дом: Средства гигиены и ухода",
        "/addAliases Средства гигиены и ухода: мыло мыльное уходовое кремушки шампунь гель soap",

        "/addCategories Дом: Электрика и электроника",
        "/addAliases Электрика и электроника: электрика электроника лампочки батарейки electronics",


        "/addCategories pets: Корм",
        "/addAliases Корм: feed",

        "/addCategories pets: Туалет",
        "/addAliases Туалет: наполнитель litter",

        "/addCategories pets: Ветеринар",
        "/addAliases Ветеринар: вет ветка ветеринарка vet vets",


        "/addCategories soft: Подписки",
        "/addAliases Подписки: subscriptions",

        "/addCategories soft: Приложения",
        "/addAliases Приложения: apps applications",


        "/addCategories Транспорт: Топливо",
        "/addAliases Топливо: бензин бензо fuel",

        "/addCategories Транспорт: Мойка и шиномонтаж",
        "/addAliases Мойка и шиномонтаж: мойка шины шиномонтаж переобувка",

        "/addCategories Транспорт: Общественный транспорт",
        "/addAliases Общественный транспорт: автобус метро талон талончик жетон жетончик",


        "/addCategories жкх: Мобильные",
        "/addAliases Мобильные: абонплата абонентка mobile fee",

        "/addCategories жкх: Интернет",
        "/addAliases Интернет: internet wifi",

        "/addCategories жкх: Комуналка",
        "/addAliases Комуналка: платежи payments",

        "/addCategories жкх: Электричество",
        "/addAliases Электричество: свет electricity",

        "/addCategories жкх: Банковские комиссии",
        "/addAliases Банковские комиссии: комиссия комиссии банк",


        "/addCategories разное: Одежда и обувь",
        "/addAliases Одежда и обувь: одежда обувь",

        "/addCategories разное: Родители",
        "/addAliases Родители: мампап",

        "/addCategories разное: Кофейни, кафе, рестораны",
        "/addAliases Кофейни, кафе, рестораны: кофе кафе ресторан",

        "/addCategories разное: Личное",
        "/addAliases Личное: private",

        "/addCategories Доходы: Заработная плата",
        "/addAliases Заработная плата: зп аванс",

        "/addCategories Доходы: Премии и бонусы",
        "/addAliases Премии и бонусы: премия премии бонус бонусы",

        "/addCategories Доходы: Подработки",
        "/addAliases Подработки: подработка халтура фриланс",

        "/addCategories Доходы: Скидки и прочее",
        "/addAliases Скидки и прочее: скидки скидка кэшбэк",

        "/addCategories Доходы: Рефинансирование",
        "/addAliases Рефинансирование: возврат обмен валюта",


        "/showCategories",
        "еда  24.80 ( к винишку ) ",
        "то 1150 ноябрь",
        "обед 5,10 02-nov",
        "кредит 1200 dec"
    ];

    const parsedCommands = inputStream
        .filter(s => parsers.willBeCommand(s))
        .map(s => parsers.parseCommand(s));

    // console.log(parsedCommands);

    for(const command of parsedCommands) {
        await cpu.executeCommand(command);
    }

    const descs = await cpu.getCategoriesDescriptors();

    console.log(['descs', descs]);

    const parsedRecords = await Promise.all(inputStream
        .filter(s => !parsers.willBeCommand(s))
        .map(async s => await parsers.parseRecord(s, descs, -12, USER_ID))
        .filter(it => it));

    parsedRecords.forEach( record => DB.addRecord(record!));

    console.log(parsedRecords);

}
