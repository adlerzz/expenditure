import JSONdb from 'simple-json-db';
import {Category, ID, Record} from './types';

const ROOT_ID: ID = "0";
const SEQUENCE_ID: ID = "1";
const CATEGORY_INDEX_ID: ID = "2"
const RECORD_INDEX_ID: ID = "3"

const ROOT_TYPE = "ROOT";
const SEQUENCE_TYPE = "SEQUENCE";
const CATEGORY_TYPE = "CATEGORY";
const RECORD_TYPE = "RECORD";
const INDEX_TYPE = "INDEX";

interface Sequence {
    value: number
}

interface DBEntry {
    id: ID;
    type: string;
    payload?: object;
}

export class DBHelper {

    private instance: JSONdb;
    /*private data: DBRoot*/

    constructor() {
        this.instance = new JSONdb('DB.json');
        //this.data = this.instance.JSON() as DBRoot;
        console.log(['db', this.instance.JSON()])

    }

    public nextSequence(): ID {
        const sequence = this.instance.get(SEQUENCE_ID) as DBEntry;
        const result = (sequence.payload as Sequence).value++;
        this.instance.set(SEQUENCE_ID, sequence);
        return result.toString() as ID;
    }


    private getCategoriesWithIndex(): [Array<Category>, Array<ID>] {
        const index = (this.instance.get(CATEGORY_INDEX_ID) as DBEntry).payload as Array<string>;
        return [index.map(i => (this.instance.get(i) as DBEntry).payload as Category), index];
    }

    public getCategories(): Array<Category> {
        return this.getCategoriesWithIndex()[0];
    }

    public getCategory(descriptor: string): Category | null {
        const D = descriptor.toUpperCase();
        return this.getCategories().find( c => c.name === D || c.aliases.includes(D)) ?? null;
    }

    public addCategory(name: string, parentId?: ID): boolean {
        const [categories, index] = this.getCategoriesWithIndex();
        if(categories.map(c => c.name).indexOf(name) >= 0 ){
            return false;
        } else {
            const id = this.nextSequence();
            const newCategory = {id, parentId, name, aliases: []} as Category;

            index.push(id);

            this.instance.set(id, {id, type: CATEGORY_TYPE, payload: newCategory} as DBEntry);
            this.updatePayload(CATEGORY_INDEX_ID, index);

            return true;
        }
    }



    public getCategoryByID(id: ID): Category | null {
        return (this.instance.get(id) as DBEntry).payload as Category ?? null;
    }

    public updateCategory(id: ID, category: Partial<Category>): boolean {
        const c = this.getCategoryByID(id);
        if(!c) {
            return false;
        }
        let result = false;
        if (category.name) {
            c.name = category.name;
            result = true;
        }
        if (category.parentId) {
            c.parentId = category.parentId;
            result = true;
        }
        if (category.aliases) {
            c.aliases = category.aliases;
            result = true;
        }
        if(result){
            this.updatePayload(id, c);
        }
        return result;
    }

    public reset(){
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
        this.instance.JSON(i);
        this.instance.sync();
    }

    public endSession(){
        this.instance.sync()
    }


    private updatePayload(id: ID, payload: object){
        const entry = this.instance.get(id) as DBEntry;
        entry.payload = payload;
        this.instance.set(id, entry);
    }

}
