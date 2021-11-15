type ID = string;

interface Category {
    id: ID;
    parentId: ID;
    name: string;
    aliases?: string[];
}

interface Record {
    id: ID;
    categoryId: ID;
    userId: ID;
    value: number;
    timestamp: Date;
    comment: String;
}

interface Command {
    opcode: string;
    param?: string;
    value?: string;
}


class CategoriesHolder {
    private __categories: Array<Category> = [];
    private __seq = 0;

    constructor() {
    }

    public addCategory(categoryName: string, parentCategory?: string, aliases?: Array<string>): boolean {

        let parentCategoryId = null;
        if (parentCategory){
            if(this.hasCategory(parentCategory)){
                parentCategoryId = this.getCategoryByName(parentCategory).id;
            }
        }

        if (this.hasCategory(categoryName)){
            return false;
        }

        this.__seq++;
        const newCategory = {
            id: this.__seq.toString(),
            parentId: parentCategoryId,
            name: categoryName,
            aliases: aliases ?? []
        }
        this.__categories.push(newCategory);
        return true;

    }

    public hasCategory(name: string): boolean {
        return this.__categories.filter(c => c.name === name).length > 0
    }

    public getCategoryByName(name: string): Category {
        return this.__categories.filter(c => c.name === name)?.pop();
    }

    public getCategory(text: string): Category | null {
        return this.__categories.filter(c=> c.name === text || c.aliases.includes(text))?.pop() ?? null;
    }


}

function parseCurrency(text: string): number | null {
    if(text.search(/^\d+([,.]\d+)?$/) === -1){
        return null;
    }
    return +text.replace(',', '.');
}

function parseDate(text: string): Date | null {
    switch (text){
        case 'today': return new Date();
        case 'yesterday': return (() => {const d = new Date(); d.setDate( d.getDate() - 1); return d;})();

    }

    return null;
}

function parseCommand(inputString: string): Command {
    const cb = inputString.indexOf(' ');

    const opcode = inputString.slice(0, cb).toLowerCase();

    const rest = inputString.slice(cb+1);
    const ab = rest.indexOf(':');


    const param = ab !== -1 ? rest.slice(0, ab).toLowerCase() : '';
    const value = rest.slice(ab+1).trim();

    return {opcode, param, value};
}

function parseRecord(inputString: string): Record {
    const comment = (inputString.match(/\((.*)\)/) ?? []).pop();

    const part = (comment ? inputString.slice(0,inputString.indexOf('(')): inputString)
        .split(' ')
        .filter(s => s.length > 0);
    console.log({part, comment});
    return null;
}

function parse(inputString: string): Record | Command {
    const trimmed = inputString.trim();
    return trimmed.startsWith('/') ?
        parseCommand(trimmed.slice(1)) :
        parseRecord(trimmed);

}

function prepare(): CategoriesHolder {
    const ch = new CategoriesHolder();
    ch.addCategory("Food");
    ch.addCategory("Fresh bread", "Food", ['bread']);
    return ch;
}

export function main(){
    const ch = prepare();
    const inp = [
        "/do peep: Hi my name is Y",
        "/do no",
        "/do :no",
        "meat  4.80   ( to wine )   ",
        "mobile 11,80 november",
        "bread 5.13 02-11",
    ];
    inp.map(s => parse(s))
       .forEach(e => console.log(e));

}
