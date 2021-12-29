import {DBInterface} from './DBInterface';
import {Client} from 'pg';
import {Category, CategoryUpdate, ID, Record, RecordUpdate, User, UserUpdate} from '../types';

export class DBAdapter extends DBInterface {

    private client;

    constructor() {
        super();
        this.client = new Client();
        this.client.connect();
    }

    addCategory(category: Category): Promise<boolean> {
        return Promise.resolve(false);
    }

    addRecord(record: Record): Promise<boolean> {
        return Promise.resolve(false);
    }

    addUser(user: User): Promise<boolean> {
        return Promise.resolve(false);
    }

    public async getCategories(): Promise<Array<Category>> {
        return this.client.query(`SELECT * FROM CATEGORIES`);
    }

    getCategoryBy(descriptor: string): Promise<Category> {
        return Promise.resolve(undefined);
    }

    getCategoryById(id: ID): Promise<Category> {
        return Promise.resolve(undefined);
    }

    getRecordById(id: ID): Promise<Record> {
        return Promise.resolve(undefined);
    }

    getRecords(): Promise<Array<Record>> {
        return Promise.resolve(undefined);
    }

    getUserBy(field: "associatedId" | "nickname", value: string): Promise<User> {
        return Promise.resolve(undefined);
    }

    getUserById(id: ID): Promise<User> {
        return Promise.resolve(undefined);
    }

    getUsers(): Promise<Array<User>> {
        return Promise.resolve(undefined);
    }

    nextCategorySequence(): Promise<ID> {
        return Promise.resolve(undefined);
    }

    nextRecordSequence(): Promise<ID> {
        return Promise.resolve(undefined);
    }

    nextUserSequence(): Promise<ID> {
        return Promise.resolve(undefined);
    }

    reset(): Promise<boolean> {
        return Promise.resolve(false);
    }

    updateCategory(id: ID, category: CategoryUpdate): Promise<boolean> {
        return Promise.resolve(false);
    }

    updateRecord(id: ID, record: RecordUpdate): Promise<boolean> {
        return Promise.resolve(false);
    }

    updateUser(id: ID, user: UserUpdate): Promise<boolean> {
        return Promise.resolve(false);
    }



}
