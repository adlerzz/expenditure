import JSONdb from 'simple-json-db';
import {Category, ID, Record} from './types';

interface Sequences {
    recordSequence: number;
    categorySequence: number;
}

interface DBRoot {
    sequences: Sequences,
    categories: Array<Category>,
    records: Array<Record>
}

export class DBHelper {

    private instance: JSONdb;
    private data: DBRoot

    constructor() {
        this.instance = new JSONdb('DB.json');
        this.data = this.instance.JSON() as DBRoot;
        console.log(['db', this.data])

    }

    public nextCategorySequence(): ID {
        const sequences = this.instance.get('sequences') as Sequences;
        sequences.categorySequence++;
        const result = sequences.categorySequence.toString();
        this.instance.set('sequences', sequences);
        return result;
    }

    public nextRecordSequence(): ID {
        const sequences = this.instance.get('sequences') as Sequences;
        sequences.recordSequence++;
        const result = sequences.recordSequence.toString();
        this.instance.set('sequences', sequences);
        return result;
    }

    public addCategory(category: Category): boolean {
        const categories = this.getCategories();
        if(categories.map(c => c.name).indexOf(category.name) >= 0 ){
            return false;
        } else {
            category.id = this.nextCategorySequence();
            categories.push(category);
            this.instance.set('categories', categories);
            return true;
        }
    }

    public getCategory(descriptor: string): Category | null {
        const D = descriptor.toUpperCase();
        return this.getCategories().find( c => c.name === D || c.aliases.includes(D)) ?? null;
    }

    public getCategoryByID(id: ID): Category | null {
        return this.getCategories().find( c => c.id === id) ?? null;
    }


    public getCategories(): Array<Category> {
        return this.instance.get('categories') as Array<Category>;
    }

    public updateCategories(categories: Array<Category>): boolean {
        this.instance.set('categories', categories);
        return true;
    }

    public updateCategory(category: Category) {
        const categories = this.getCategories();
        const c = categories.findIndex( it => it.id === category.id);
        return this.updateCategories(categories);
    }

    public reset(){
        this.instance.JSON({
            sequences: {
                recordSequence: -1,
                categorySequence: -1
            },
            categories: [],
            records: []
        })
    }


    public endSession(){
        this.instance.sync()
    }



}
