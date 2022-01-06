import {Command, Descriptor, ID, RecordCreate} from './types';
import {DB} from './app';
import {DateUtils} from './date-utils';

function parseCurrency(text: string): number | null {
    if(text.search(/^\d+([,.]\d+)?$/) === -1){
        return null;
    }
    return +text.replace(',', '.');
}

function parseDescriptor(text: string, descriptors: Array<Descriptor>): ID | null {
    const descriptor = descriptors.filter( d => text.toUpperCase() === d.value ).pop();
    return descriptor?.id ?? null;
}

export async function parseRecord(inputString: string, descriptors: Array<Descriptor>, messageId: number, userId: ID): Promise<RecordCreate|null> {
    const comment = (inputString.match(/\((.*)\)/) ?? []).pop()?.trim();

    const parts = (comment ? inputString.slice(0,inputString.indexOf('(')): inputString)
        .split(' ')
        .filter(s => s.length > 0);

    const categoryId = parts.map( part => parseDescriptor(part, descriptors)).find(it => it);
    if(!categoryId){
        return null;
    }
    const timestamp = parts.map( part => DateUtils.parseDate(part)).find(it => it) ?? DateUtils.todayDate();
    const value = parts.map(part => parseCurrency(part)).find(it => it);

    return { categoryId, comment, timestamp,
        userId, value, messageId } as RecordCreate;
}


export function willBeCommand(text: string): boolean {
    const trimmed = text.trimStart();
    return trimmed.startsWith('/')
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

export async function executeCommand(command: Command): Promise<boolean> {

    const fullcommand = command.opcode + (command.param ? ' ' + command.param : '' );

    const transitions = {
        'add cat' :     async () => await createCategory(command.argument!, command.additional),
        'add aliases' : async () => await addAliases(command.argument!, command.additional!),
        'show cat' :    async () => await showCategories(),
        'show rec' :    async () => await showRecords(),
        'reset' :       async () => await resetDB()
    };

    const result = await transitions[fullcommand]();

    console.log({command, result});
    return result;
}

async function createCategory(name: string, parent?: string): Promise<boolean> {
    return parent
        ? createSubcategory(parent, name)
        : createSupercategory(name);
}

async function createSupercategory(name: string): Promise<boolean> {
    if(await DB.getCategoryBy(name)){
        return false;
    }
    const category = {
        parentId: '0',
        name: name.toUpperCase(),
        aliases: []
    }
    return await DB.addCategory(category);
}

async function createSubcategory(name: string, parent: string): Promise<boolean>{
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
        .map(cat => ( {id: cat.id, descs: [cat.name, ...cat.aliases!]}))
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

export async function resetDB(): Promise<boolean> {
    return await DB.reset();
}
