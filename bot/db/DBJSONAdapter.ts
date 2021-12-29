import JSONdb from 'simple-json-db';
import {Category, CategoryUpdate, ID, Record, RecordUpdate, User, UserUpdate} from '../types';
import {DBInterface} from './DBInterface';

const ROOT_ID: ID = "0";
const SEQUENCE_ID: ID = "1";
const CATEGORY_INDEX_ID: ID = "2";
const RECORD_INDEX_ID: ID = "3";
const USER_INDEX_ID: ID = "4";

const ROOT_TYPE = "ROOT";
const SEQUENCE_TYPE = "SEQUENCE";
const CATEGORY_TYPE = "CATEGORY";
const RECORD_TYPE = "RECORD";
const INDEX_TYPE = "INDEX";
const USER_TYPE = "USER";

interface Sequence {
    value: number
}

interface DBEntry {
    id: ID;
    type: string;
    payload?: object;
}

export class DBJSONAdapter extends DBInterface {

    private instance: JSONdb;

    constructor() {
        super();
        this.instance = new JSONdb('DB/DB.json');
        if(!this.instance.has('0')){
            this.reset();
        }
        console.log(['db', this.instance.JSON()]);
    }

    private getEntryById(id: ID): DBEntry {
        return this.instance.get(id) as DBEntry;
    }

    private updatePayload(id: ID, payload: object){
        const entry = this.getEntryById(id);
        entry.payload = payload;
        this.instance.set(id, entry);
    }

    public async nextCategorySequence(): Promise<ID> {
        return this.nextSequence();
    }

    public async nextRecordSequence(): Promise<ID> {
        return this.nextSequence();
    }

    public async nextUserSequence(): Promise<ID> {
        return this.nextSequence();
    }

    private async nextSequence(): Promise<ID> {
        const sequence = this.getEntryById(SEQUENCE_ID);
        const result = (sequence.payload as Sequence).value++;
        this.instance.set(SEQUENCE_ID, sequence);
        return result.toString() as ID;
    }

    private getCategoriesWithIndex(): [Array<Category>, Array<ID>] {
        const index = this.getEntryById(CATEGORY_INDEX_ID).payload as Array<string>;
        return [index.map(i => this.getEntryById(i).payload as Category), index];
    }

    public async getCategories(): Promise<Array<Category>> {
        return this.getCategoriesWithIndex()[0];
    }

    public async getCategoryBy(descriptor: string): Promise<Category> {
        const D = descriptor.toUpperCase();
        const categories = await this.getCategories();
        return categories.find( c => c.name === D || c.aliases.includes(D)) ?? null;
    }

    public async addCategory(category: Category): Promise<boolean> {
        const [categories, index] = this.getCategoriesWithIndex();
        if(categories.map(c => c.name).indexOf(category.name) >= 0 ){
            return false;
        }

        const newCategory = {id: category.id, parentId: category.parentId, name: category.name, aliases: category.aliases} as Category;
        this.instance.set(category.id, {id: category.id, type: CATEGORY_TYPE, payload: newCategory} as DBEntry);

        this.pushIndex(category.id, CATEGORY_INDEX_ID);
        return true;

    }

    public async getCategoryById(id: ID): Promise<Category> {
        return this.getEntryById(id).payload as Category ?? null;
    }

    public async updateCategory(id: ID, category: CategoryUpdate): Promise<boolean> {
        const c = this.getCategoryById(id);
        if(!c) {
            return false;
        }
        return this.updatePayloadBy(c, category);
    }

    public async addRecord(record: Record): Promise<boolean> {
        this.instance.set(record.id, {id: record.id, type: RECORD_TYPE, payload: record} as DBEntry);
        this.pushIndex(record.id, RECORD_INDEX_ID);
        return true;
    }

    public async getRecords(): Promise<Array<Record>> {
        const index = (this.instance.get(RECORD_INDEX_ID) as DBEntry).payload as Array<ID>;
        return index.map(i => this.getEntryById(i).payload as Record);
    }

    public async getRecordById(id: ID): Promise<Record> {
        return this.getEntryById(id).payload as Record ?? null;
    }

    public async updateRecord(id: ID, record: RecordUpdate): Promise<boolean> {
        const r = this.getRecordById(id);
        if(!r){
            return false;
        }

        return this.updatePayloadBy(r, record);
    }


    public async addUser(user: User): Promise<boolean> {
        this.instance.set(user.id, {id: user.id, type: USER_TYPE, payload: user} as DBEntry);
        this.pushIndex(user.id, USER_INDEX_ID);
        return true;
    }

    public async getUsers(): Promise<Array<User>> {
        const index = (this.instance.get(USER_INDEX_ID) as DBEntry).payload as Array<ID>;
        return index.map(i => this.getEntryById(i).payload as User);
    }

    public async getUserById(id: ID): Promise<User> {
        return this.getEntryById(id).payload as User ?? null;
    }

    public async getUserBy(field: 'associatedId'| 'nickname', value: string): Promise<User> {
        let predicate = null;
        switch (field){
            case 'associatedId': predicate = (u: User) => u.associatedId; break;
            case 'nickname': predicate = (u: User) => u.nickname; break;
        }
        const users = await this.getUsers();
        return users.find(predicate) ?? null;
    }

    public async updateUser(id: ID, user: UserUpdate): Promise<boolean> {
        const u = this.getUserById(id);
        if(!u){
            return false;
        }

        return this.updatePayloadBy(u, user);
    }

    public async reset(): Promise<boolean> {
        let i = {};
        i[ROOT_ID] = {
            id: ROOT_ID,
            type: ROOT_TYPE,
        };
        i[SEQUENCE_ID] = {
            id: SEQUENCE_ID,
            type: SEQUENCE_TYPE,
            payload: {"value": 10}
        };
        i[CATEGORY_INDEX_ID] = {
            id: CATEGORY_INDEX_ID,
            type: INDEX_TYPE,
            payload: []
        };
        i[RECORD_INDEX_ID] = {
            id: RECORD_INDEX_ID,
            type: INDEX_TYPE,
            payload: []
        };
        i[USER_INDEX_ID] = {
            id: USER_INDEX_ID,
            type: USER_TYPE,
            payload: []
        }
        this.instance.JSON(i);
        this.instance.sync();
        return true;
    }

    public endSession(){
        this.instance.sync()
    }

    private updatePayloadBy<T extends object, U>(object: T, update: U): boolean {
        const result = Object.entries(update).map(([property, value]) => ({property, value}))
            .filter( entry => entry.value !== undefined)
            .map(entry => {object[entry.property] = entry.value})
            .length !== 0;
        this.updatePayload(object['id'], object);
        return result;
    }

    private pushIndex(newId: ID, indexId: ID): boolean {
        const index = (this.instance.get(indexId) as DBEntry).payload as Array<ID>;
        index.push(newId);
        this.updatePayload(indexId, index);
        return true;
    }


}
