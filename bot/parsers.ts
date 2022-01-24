import {Command, Descriptor, ID, RecordCreate, RecordUpdate} from './types';
import {DateUtils} from './date-utils';

function parseCurrency(text: string): number | null {
    if(text.search(/^-?\d+([,.]\d+)?$/) === -1){
        return null;
    }
    return +text.replace(',', '.');
}

function parseDescriptor(text: string, descriptors: Array<Descriptor>): ID | null {
    const descriptor = descriptors.filter( d => text.toUpperCase() === d.value ).pop();
    return descriptor?.id ?? null;
}

function recordSplit(inputString: string): [string|null, Array<string>] {
    const comment = (inputString.match(/\((.*)\)/) ?? []).pop()?.trim() ?? null;

    const parts = (comment ? inputString.slice(0,inputString.indexOf('(')): inputString)
        .split(' ')
        .filter(s => s.length > 0);
    return [comment, parts];
}

function extractCategoryId(parts: Array<string>, descriptors: Array<Descriptor>): ID | null {
    return parts.map( part => parseDescriptor(part, descriptors)).find(it => it) ?? null;
}

function extractTimestamp(parts: Array<string>): Date | null {
    return parts.map( part => DateUtils.parseDate(part)).find(it => it) ?? DateUtils.todayDate();
}

function extractValue(parts: Array<string>): number | null {
    return parts.map(part => parseCurrency(part)).find(it => it) ?? null;
}

export async function createRecordStepByStep(inputString: string, categoryId: ID, userId: ID): Promise<RecordCreate|null> {
    const [comment, parts] = recordSplit(inputString);

    const timestamp = extractTimestamp(parts);
    const value = extractValue(parts);

    return { categoryId, comment, timestamp,
        userId, value, messageId: -1 } as RecordCreate;
}

export async function parseRecord(inputString: string, descriptors: Array<Descriptor>, messageId: number, userId: ID): Promise<RecordCreate|null> {
    const [comment, parts] = recordSplit(inputString);

    const categoryId = extractCategoryId(parts, descriptors);
    if(!categoryId){
        return null;
    }
    const timestamp = extractTimestamp(parts);
    const value = extractValue(parts);

    return { categoryId, comment, timestamp,
        userId, value, messageId } as RecordCreate;
}

export async function parseRecordUpdate(inputString: string, descriptors: Array<Descriptor>): Promise<RecordUpdate | null> {
    const comment = (inputString.match(/\((.*)\)/) ?? []).pop()?.trim();

    const parts = (comment ? inputString.slice(0,inputString.indexOf('(')): inputString)
        .split(' ')
        .filter(s => s.length > 0);

    const categoryId = extractCategoryId(parts, descriptors);
    if(!categoryId){
        return null;
    }
    const timestamp = parts.map( part => DateUtils.parseDate(part)).find(it => it) ?? DateUtils.todayDate();
    const value = parts.map(part => parseCurrency(part)).find(it => it);

    return { categoryId, comment, timestamp,
        value } as RecordUpdate;
}

export function willBeCommand(text: string): boolean {
    const trimmed = text.trimStart();
    return trimmed.startsWith('/')
}


export function parseCommand(inputString: string): Command {
    /* /opcode argument: value*/
    let rest = inputString;
    let result: Command = {} as Command;

    const opcodeEnd = rest.indexOf(' ');
    if(opcodeEnd === -1){
        result.opcode = rest.slice(1).toLowerCase();
        return result;
    }
    result.opcode = rest.slice(1, opcodeEnd).toLowerCase();

    rest = rest.slice(opcodeEnd + 1);
    const argEnd = rest.indexOf(':');

    if(argEnd === -1){
        result.argument = rest.trim();
        return result;
    }

    result.argument = rest.slice(0, argEnd).trim();
    result.additional = rest.slice(argEnd + 1).trim();

    return result;
}

