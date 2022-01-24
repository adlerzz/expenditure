import {Command, Descriptor} from './types';
import {DB} from './app';
import {DateUtils} from './date-utils';

export async function executeCommand(command: Command): Promise<boolean|object> {

    const fullcommand = command.opcode;

    const transitions = {
        'addcategory' :    async () => await createCategory(command.argument!, command.additional),
        'addaliases' :     async () => await addAliases(command.argument!, command.additional!),
        'showcategories' : async () => await showCategories(),
        'showrecords' :    async () => await showRecords(),
        'dofile' :         async () => await doFile(),
        'out':             async () => await newOutcomeDialog(command.argument!, command.additional!),
        'monthlyreport':   async () => await getMonthlyReport(),
        'reset' :          async () => await resetDB()
    };

    const f = transitions[fullcommand];
    if(!f){
        console.log(`Bad command ${fullcommand}`);
        return false;
    }
    const result = await f();

    console.log({command, result});
    return result;
}

async function createCategory(argument: string, additional?: string): Promise<boolean> {
    if (!argument) {
        return false;
    }
    return additional
        ? createSubcategory(additional, argument) // name, parent
        : createSupercategory(argument);
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

async function doFile(): Promise<object> {
    return {
        type: 'url',
        url: process.env['DOMAIN'] + 'web/info'
    };
}

async function newOutcomeDialog(step?: string, arg?: string): Promise<object> {
    let showingCategories: Array<object> = [];
    const categories = await DB.getCategories();
    const flowId = "out";
    if(!step){
        const outcomes = await DB.getCategoryBy('outcomes');
        showingCategories = categories
            .filter(c => c.parentId === outcomes!.id)
            .map(c => ({
                text: c.name,
                callback_data: JSON.stringify({id: c.id, flowId, step: "1"})}
            ));
        return {type: 'keys', keys: showingCategories.map(c => [c]) };
    } else if(step === '1'){
        const parentCategory = await DB.getCategoryById(arg!);
        showingCategories = categories
            .filter(c => c.parentId === parentCategory!.id)
            .map(c => ({
                text: c.name,
                callback_data: JSON.stringify({id: c.id, flowId, step: "2"})}
            ))
        return {type: 'keys', keys: showingCategories.map(c => [c]) };
    } else if(step === '2'){
        return {type: 'request', request: {categoryId: arg, step: '3'} }
    }
    else {
        return {};
    }
}

async function getMonthlyReport(): Promise<object> {
    const domain = process.env['DOMAIN'];
    const month = DateUtils.currentMonthKey();
    return {
        type: 'url',
        url:  `${domain}web/reports/monthly?mon=${month}`
    };
}

export async function resetDB(): Promise<boolean> {
    return await DB.reset();
}
