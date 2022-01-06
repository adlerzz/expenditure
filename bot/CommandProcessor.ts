import {Command, Descriptor} from './types';
import {DB} from './app';

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
