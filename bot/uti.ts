import {ID, Command, Record, Category} from "./types";
import {DB} from './app';

const USER_ID = '362211767'
const TODAY = ['today', 'td', 'сегодня', 'сег', 'сёння', 'сн'];
const YESTERDAY = ['yesterday', 'yd', 'вчера', 'вч', 'учора', 'уч'];

function parseCurrency(text: string): number | null {
    if(text.search(/^\d+([,.]\d+)?$/) === -1){
        return null;
    }
    return +text.replace(',', '.');
}

function parseDate(text: string): Date | null {


    return null;
}

function parseCommand(inputString: string): Command {
    /* /opcode param argument: value*/
    let rest = inputString;
    let result: Command = {} as Command;

    const opcodeEnd = rest.indexOf(' ');
    result.opcode = rest.slice(0, opcodeEnd).toLowerCase();
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
        result.argument = rest;
        return result;
    }

    result.argument = rest.slice(0, argEnd);
    result.additional = rest.slice(argEnd + 1).trim();

    return result;
}

function parseRecord(inputString: string): Record {
    const comment = (inputString.match(/\((.*)\)/) ?? []).pop();

    const part = (comment ? inputString.slice(0,inputString.indexOf('(')): inputString)
        .split(' ')
        .filter(s => s.length > 0);
    console.log({part, comment});
    return {id: "-1", categoryId: "-1", comment, timestamp: new Date(), userId: USER_ID, value: -1} as Record;
}

function parse(inputString: string): Record | Command {
    const trimmed = inputString.trim();
    return trimmed.startsWith('/') ?
        parseCommand(trimmed.slice(1)) :
        parseRecord(trimmed);
}
function isCommand(p: Record| Command): p is Command {
    return (p as Command).opcode !== undefined;
}

function executeCommand(command: Command): boolean {
    let c: number;
    let result = false;
    switch (command.opcode) {
        case 'add':    c = 100; break;
        case 'edit':   c = 200; break;
        case 'show':   c = 300; break;
        case 'del':    c = 400; break;
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

    }
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
        return false;
    }
    if(DB.getCategory(name)){
        return false;
    }
    return DB.addCategory(name.toUpperCase(),  p.id);
}

function addAliases(name: string, aliasesStr: string): boolean{
    const id = DB.getCategory(name).id;
    const aliases = aliasesStr.split(' ').filter(s => s.length > 1).map(s => s.toUpperCase());
    return DB.updateCategory(id,{aliases});
}

function showCategories(): boolean {
    console.log(DB.getCategories());
    return true;
}

function resetDB(){
    DB.reset();
}

export function main(){
    resetDB();
    const inputStream = [
        "/add cat Goods ",
        "/add subcat goods: meat and fish",
        "/add subcat goods: dairy",
        "/add subcat goods: eggs",
        "/add subcat goods: oil",
        "/add subcat goods: vegetables",
        "/add subcat goods: fruits",
        "/add aliases meat and fish: meat fish",
        "/add subcat goods: drinks",
        "/add subcat goods: breads",
        "/add subcat goods: candies",
        "/add subcat goods: delicacy",
        "/add subcat goods: meals",
        "/add cat Big regular spends",
        "/add aliases Big regular spends: big",
        "/show cat",
        "meat  4.80 ( to wine ) ",
        "mobile 11,80 november",
        "bread 5.13 02-11",
    ];
    inputStream
       .map(s => ( {s, p: parse(s)}) )
       .map( it => {
           console.log(it);
           return it.p
       })
       .forEach( it => {
           if(isCommand(it)){
               const res = executeCommand(it);
               console.log('executed, res = ' + res);
           } else {
               console.log('no execution');
           }
       });

}
