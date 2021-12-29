export type ID = string;

export interface Category {
    id: ID;
    parentId: ID;
    name: string;
    aliases?: string[];
}

export type CategoryUpdate = Partial<Omit<Category, 'id'>>;

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

export interface Command {
    opcode: string;
    param?: string;
    argument?: string;
    additional?: string;
}

export interface User {
    id: ID;
    nickname: string;
    role: string;
    associatedId: string;
}

export type UserUpdate = Partial<Omit<User, 'id' | 'associatedId'>>;

export interface Descriptor {
    id: ID;
    value: string;
}
