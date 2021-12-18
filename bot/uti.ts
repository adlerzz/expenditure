import {ID, Command, Record, Category, Descriptor} from './types';
import {DB} from './app';
import {DateUtils} from './date-utils';

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

export function parseRecord(inputString: string, descriptors: Array<Descriptor>): Record {
    const comment = (inputString.match(/\((.*)\)/) ?? []).pop()?.trim();

    const parts = (comment ? inputString.slice(0,inputString.indexOf('(')): inputString)
        .split(' ')
        .filter(s => s.length > 0);

    console.log(parts);
    const categoryId = parts.map( part => parseDescriptor(part, descriptors)).find(it => it);
    const timestamp = parts.map( part => DateUtils.parseDate(part)).find(it => it) ?? DateUtils.todayDate();
    const value = parts.map(part => parseCurrency(part)).find(it => it);


    return {id: DB.nextSequence(), categoryId, comment, timestamp, userId: USER_ID, value} as Record;
}


export function willBeCommand(text: string): boolean {
    const trimmed = text.trimStart();
    return trimmed.startsWith('/')
}

export function executeCommand(command: Command): boolean {
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
        case 101: result = createCategory(command.argument); break;
        case 102: result = createSubcategory(command.argument, command.additional); break;
        case 103: result = addAliases(command.argument, command.additional); break;
        case 301: result = showCategories(); break;
        case 500: result = resetDB(); break;

    }
    console.log({command, result});
    return result;
}

function createCategory(name: string): boolean {
    if(DB.getCategory(name)){
        return false;
    }
    return DB.addCategory(name.toUpperCase(), "0");
}

function createSubcategory(parent: string, name: string): boolean{
    const p = DB.getCategory(parent);
    if(!p) {
        console.log('no ' + parent);
        return false;
    }
    if(DB.getCategory(name)){
        console.log('already ' + name);
        return false;
    }
    return DB.addCategory(name.toUpperCase(),  p.id);
}

function addAliases(name: string, aliasesStr: string): boolean{
    const c = DB.getCategory(name);
    if(!c) {
        console.log('no ' + name);
        return false;
    }
    const id = c.id;
    const aliases = aliasesStr.split(' ').filter(s => s.length > 1).map(s => s.toUpperCase());
    return DB.updateCategory(id,{aliases});
}

export function getCategoriesDescriptors(): Array<Descriptor> {
    return DB.getCategories()
        .map(cat => ( {id: cat.id, descs: [cat.name, ...cat.aliases]}))
        .flatMap( ({id, descs}) => descs.map(desc => ( {id, value: desc} as Descriptor)));
}

function showCategories(): boolean {
    console.log(DB.getCategories());
    return true;
}

function resetDB(): boolean {
    DB.reset();
    return true;
}

export function main(){
    resetDB();
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
    ];

    const parsedCommands = inputStream
        .filter(s => willBeCommand(s))
        .map(s => parseCommand(s));

    console.log(parsedCommands);

    parsedCommands.forEach( c => executeCommand(c));

    const descs = getCategoriesDescriptors();

    console.log(['descs', descs]);

    const parsedRecords = inputStream
        .filter(s => !willBeCommand(s))
        .map(s => parseRecord(s, descs));

    parsedRecords.forEach( record => DB.addRecord(record));


    console.log(parsedRecords);

}
