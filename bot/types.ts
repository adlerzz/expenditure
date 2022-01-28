export type ID = string;

export interface Category {
    id: ID;
    parentId: ID;
    name: string;
    aliases?: string[];
}

export type CategoryUpdate = Partial<Omit<Category, 'id'>>;
export type CategoryCreate = Omit<Category, 'id'>;

export interface Record {
    id: ID;
    categoryId: ID;
    userId: ID;
    value: number;
    timestamp: Date;
    comment: String;
    messageId: number;
}

export type RecordUpdate = Partial<Omit<Record, 'id' | 'messageId' | 'userId'>>;
export type RecordCreate = Omit<Record, 'id'>;

export interface Command {
    opcode: string;
    argument?: string;
    additional?: string;
}

export type CommandResult = CommandResultCode | CommandResultRequest | CommandResultUrl | CommandResultKeys;

interface CommandResultCode {
    type: 'code',
    code: boolean;
}

interface CommandResultRequest {
    type: 'request',
    request: object
}

interface CommandResultUrl {
    type: 'url',
    url: string
}

interface CommandResultKeys {
    type: 'keys',
    keys: Array<Array<object>>
}

export interface User {
    id: ID;
    nickname: string;
    role: string;
    associatedId: string;
}

export type UserUpdate = Partial<Omit<User, 'id' | 'associatedId'>>;
export type UserCreate = Omit<User, 'id'>;

export interface Descriptor {
    id: ID;
    value: string;
}
