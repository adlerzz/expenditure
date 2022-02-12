import {Command, CommandResult, Descriptor} from './types';
import {DB} from './app';
import {DateUtils} from './date-utils';

export const CODE_FAIL: CommandResult = {type: 'code', code: false};
export const CODE_OK: CommandResult = {type: 'code', code: true};

export function CRByCode(code: boolean): CommandResult {
    return {type: 'code', code: code};
}

export async function executeCommand(command: Command): Promise<CommandResult> {

    const fullcommand = command.opcode;

    const transitions = {
        'addcategory' :    async () => await createCategory(command.argument!, command.additional),
        'addaliases' :     async () => await addAliases(command.argument!, command.additional!),
        'showcategories' : async () => await showCategories(),
        'showrecords' :    async () => await showRecords(),
        'dofile' :         async () => await doFile(),
        'out':             async () => await newOutcomeDialog(command.argument!, command.additional!),
        'monthlyreport':   async () => await getMonthlyReport(),
        'monthlydetails':  async () => await getMonthlyDetails(),
        'reset' :          async () => await resetDB()
    };

    const f = transitions[fullcommand];
    if(!f){
        console.log(`Bad command ${fullcommand}`);
        return CODE_FAIL;
    }
    const result = await f();

    console.log({command, result});
    return result;
}

async function createCategory(argument: string, additional?: string): Promise<CommandResult> {
    if (!argument) {
        return CODE_FAIL;
    }
    return additional
        ? createSubcategory(additional, argument) // name, parent
        : createSupercategory(argument);
}

async function createSupercategory(name: string): Promise<CommandResult> {
    if(await DB.getCategoryBy(name)){
        return CODE_FAIL;
    }
    const category = {
        parentId: '0',
        name: name.toUpperCase(),
        aliases: []
    }
    const res = await DB.addCategory(category);
    return CRByCode(res);
}

async function createSubcategory(name: string, parent: string): Promise<CommandResult>{
    const p = await DB.getCategoryBy(parent);
    if(!p) {
        console.log('no ' + parent);
        return CODE_FAIL;
    }
    if(await DB.getCategoryBy(name)){
        console.log('already ' + name);
        return CODE_FAIL;
    }
    const category = {
        parentId: p.id,
        name: name.toUpperCase(),
        aliases: []
    }
    const res = await DB.addCategory(category);
    return CRByCode(res);
}

async function addAliases(name: string, aliasesStr: string): Promise<CommandResult>{
    const c = await DB.getCategoryBy(name);
    if(!c) {
        console.log('no ' + name);
        return CODE_FAIL;
    }
    const id = c.id;
    const aliases = aliasesStr
        .split(' ')
        .filter(s => s.length > 1)
        .map(s => s.toUpperCase());
    const res = await DB.updateCategory(id,{aliases})
    return CRByCode(res);
}

export async function getCategoriesDescriptors(): Promise<Array<Descriptor>> {
    const categories = await DB.getCategories();
    return categories
        .map(cat => ( {id: cat.id, descs: [cat.name, ...cat.aliases!]}))
        .flatMap( ({id, descs}) => descs.map(desc => ( {id, value: desc} as Descriptor)));
}

async function showCategories(): Promise<CommandResult> {
    console.log(await DB.getCategories());
    return CODE_OK;
}

async function showRecords(): Promise<CommandResult> {
    console.log(await DB.getRecords());
    return CODE_OK;
}

async function doFile(): Promise<CommandResult> {
    return {
        type: 'url',
        url: process.env['DOMAIN'] + 'web/info'
    };
}

async function newOutcomeDialog(step?: string, arg?: string): Promise<CommandResult> {
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
        return CODE_FAIL;
    }
}

async function getMonthlyReport(): Promise<CommandResult> {
    const domain = process.env['DOMAIN'];
    const month = DateUtils.currentMonthKey();
    return {
        type: 'url',
        url:  `${domain}web/reports/report?mon=${month}`
    };
}

async function getMonthlyDetails(): Promise<CommandResult> {
    const domain = process.env['DOMAIN'];
    const month = DateUtils.currentMonthKey();
    return {
        type: 'url',
        url:  `${domain}web/reports/details?mon=${month}`
    };
}

export async function resetDB(): Promise<boolean> {
    return await DB.reset();
}
