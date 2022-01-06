import {DB} from './app';
import * as cpu from './CommandProcessor';

const USER_ID = '1';

export async function main(){
    await cpu.resetDB();
    const inputStream = [
        "/add cat Расходы",
        "/add aliases Расходы: outcomes",

        "/add cat Доходы",
        "/add aliases Доходы: incomes",

        "/add cat Расходы: Крупные регулярные траты",
        "/add aliases Крупные регулярные траты: big",

        "/add cat Расходы: Продукты",
        "/add aliases Продукты: goods",

        "/add cat Расходы: Хобби и образование",
        "/add aliases Хобби и образование: hobby education хобби образование",

        "/add cat Расходы: Здоровье",
        "/add aliases Здоровье: health",

        "/add cat Расходы: Дом",
        "/add aliases Дом: house",

        "/add cat Расходы: Домашние животные",
        "/add aliases Домашние животные: звери зверье животные коты pets cats",

        "/add cat Расходы: Программные продукты",
        "/add aliases Программные продукты: программы сайты soft software sites",

        "/add cat Расходы: Транспорт",
        "/add aliases Транспорт: transport",

        "/add cat Расходы: Услуги ЖКХ, банков и госуслуги",
        "/add aliases Услуги ЖКХ, банков и госуслуги: жкх госуслуги",

        "/add cat Расходы: Прочие расходы",
        "/add aliases Прочие расходы: разное",



        "/add cat big: Кредит",
        "/add aliases Кредит: credit",

        "/add cat big: Аренда квартиры",
        "/add aliases Аренда квартиры: rent rents",

        "/add cat big: Техобслуживание машины и техосмотр",
        "/add aliases Техобслуживание машины и техосмотр: ТО техобслуживание техосмотр maintenance service inspection",

        "/add cat big: Страховка машины",
        "/add aliases Страховка машины: страховка insurance",

        "/add cat big: Сбережения",
        "/add aliases Сбережения: копилка saving savings",

        "/add cat big: Психологи",
        "/add aliases Психологи: пси психолог psy psycho psychologist psychologists",


        "/add cat goods: Обычные продукты",
        "/add aliases Обычные продукты: еда food",

        "/add cat goods: Сладости",
        "/add aliases Сладости: candies sweets",

        "/add cat goods: Обеды",
        "/add aliases Обеды: обед dinner",

        "/add cat goods: Деликатесы",
        "/add aliases Деликатесы: delicacy delice",


        "/add cat Здоровье: Медцентры",
        "/add aliases Медцентры: медцентр medcenter medcenters",

        "/add cat Здоровье: Лекарства, витамины и БАДы",
        "/add aliases Лекарства, витамины и БАДы: лекарства витамины бады drugs meds vitamines supplements",

        "/add cat Здоровье: Линзы и растворы",
        "/add aliases Линзы и растворы: линзы растворы раствор lenses solutions solution",


        "/add cat Дом: Средства для стирки и уборки, клининг",
        "/add aliases Средства для стирки и уборки, клининг: порошок капсулы клининг мойка cleaning",

        "/add cat Дом: Средства гигиены и ухода",
        "/add aliases Средства гигиены и ухода: мыло мыльное уходовое кремушки шампунь гель soap",

        "/add cat Дом: Электрика и электроника",
        "/add aliases Электрика и электроника: электрика электроника лампочки батарейки electronics",


        "/add cat pets: Корм",
        "/add aliases Корм: feed",

        "/add cat pets: Туалет",
        "/add aliases Туалет: наполнитель litter",

        "/add cat pets: Ветеринар",
        "/add aliases Ветеринар: вет ветка ветеринарка vet vets",


        "/add cat soft: Подписки",
        "/add aliases Подписки: subscriptions",

        "/add cat soft: Приложения",
        "/add aliases Приложения: apps applications",


        "/add cat Транспорт: Топливо",
        "/add aliases Топливо: бензин бензо fuel",

        "/add cat Транспорт: Мойка и шиномонтаж",
        "/add aliases Мойка и шиномонтаж: мойка шины шиномонтаж переобувка",

        "/add cat Транспорт: Общественный транспорт",
        "/add aliases Общественный транспорт: автобус метро талон талончик жетон жетончик",


        "/add cat жкх: Мобильные",
        "/add aliases Мобильные: абонплата абонентка mobile fee",

        "/add cat жкх: Интернет",
        "/add aliases Интернет: internet wifi",

        "/add cat жкх: Комуналка",
        "/add aliases Комуналка: платежи payments",

        "/add cat жкх: Электричество",
        "/add aliases Электричество: свет electricity",

        "/add cat жкх: Банковские комиссии",
        "/add aliases Банковские комиссии: комиссия комиссии банк",


        "/add cat разное: Одежда и обувь",
        "/add aliases Одежда и обувь: одежда обувь",

        "/add cat разное: Родители",
        "/add aliases Родители: мампап",

        "/add cat разное: Кофейни, кафе, рестораны",
        "/add aliases Кофейни, кафе, рестораны: кофе кафе ресторан",

        "/add cat разное: Личное",
        "/add aliases Личное: private",

        "/add cat Доходы: Заработная плата",
        "/add aliases Заработная плата: зп аванс",

        "/add cat Доходы: Премии и бонусы",
        "/add aliases Премии и бонусы: премия премии бонус бонусы",

        "/add cat Доходы: Подработки",
        "/add aliases Подработки: подработка халтура фриланс",

        "/add cat Доходы: Скидки и прочее",
        "/add aliases Скидки и прочее: скидки скидка кэшбэк",

        "/add cat Доходы: Рефинансирование",
        "/add aliases Рефинансирование: возврат обмен валюта",


        "/show cat",
        "еда  24.80 ( к винишку ) ",
        "то 1150 ноябрь",
        "обед 5,10 02-nov",
        "кредит 1200 dec"
    ];

    const parsedCommands = inputStream
        .filter(s => cpu.willBeCommand(s))
        .map(s => cpu.parseCommand(s));

    // console.log(parsedCommands);

    for(const command of parsedCommands) {
        await cpu.executeCommand(command);
    }

    const descs = await cpu.getCategoriesDescriptors();

    console.log(['descs', descs]);

    const parsedRecords = await Promise.all(inputStream
        .filter(s => !cpu.willBeCommand(s))
        .map(async s => await cpu.parseRecord(s, descs, -12, USER_ID))
        .filter(it => it));

    parsedRecords.forEach( record => DB.addRecord(record!));

    console.log(parsedRecords);

}
