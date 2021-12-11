export type ID = string;

export interface Category {
    id: ID;
    parentId: ID;
    name: string;
    aliases?: string[];
}

export interface Record {
    id: ID;
    categoryId: ID;
    userId: ID;
    value: number;
    timestamp: Date;
    comment: String;
}

export interface Command {
    opcode: string;
    param?: string;
    argument?: string;
    additional?: string;
}

export interface Descriptor {
    id: ID;
    value: string;
}
