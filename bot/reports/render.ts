import {DB} from '../app';
import {DateUtils} from '../date-utils';

const SKIP = '--'

export async function createInfo() : Promise<object> {
    const categories = await DB.getCategories();
    const outcomeCat = await DB.getCategoryBy('outcomes');
    const incomesCat = await DB.getCategoryBy('incomes');

    const outcomes = categories.filter(c => c.parentId == outcomeCat!.id );
    const outcomesData = outcomes.map(outcome => ({
        name: outcome.name,
        children: categories.filter(c => c.parentId == outcome!.id).map(c => ({name: c.name, aliases: c.aliases!.join(', ')})),
        aliases: outcome.aliases!.join(', ')
    }));

    const incomes = categories.filter(c => c.parentId == incomesCat!.id );
    const incomesData = incomes.map(income => ({
        name: income.name,
        children: categories.filter(c => c.parentId == income!.id).map(c => ({name: c.name, aliases: c.aliases!.join(', ')})),
        aliases: income.aliases!.join(', ')
    }));

    return {outcomesData, incomesData};
}

function printCurrency(value: number|null): string {
    if(value === null){
        return SKIP;
    }
    return value.toFixed(2);
}

function printCategory(name: string): string {
    if(!name) {
        return SKIP;
    }
    return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
}

export async function createMonthlyReport(month: string) : Promise<object> {
    const categories = await DB.getCategories();
    const outcomeCats = await DB.getOutcomesCategories();
    const incomeCats = await DB.getIncomesCategories();

    const allRecords = await DB.getRecords();
    const allUsers = await DB.getUsers();
    const records = allRecords.filter(r => DateUtils.isInMonth(r.timestamp, month));
    const [incomesData, outcomesData] = [incomeCats, outcomeCats].map( cats => records
        .filter(r => cats.map(c => c.id).includes(r.categoryId) )
        .sort( (r1, r2) => (+r1.timestamp) - (+r2.timestamp))
        .map( r => ({
            timestamp: DateUtils.formatDate(r.timestamp, true),
            category: printCategory(categories.find(c => r.categoryId === c.id)?.name ?? ''),
            value: printCurrency(r.value),
            user: allUsers.find(u => u.id === r.userId)?.nickname ?? SKIP,
            comment: r.comment ?? ''
        })) )


    console.log([incomesData, outcomesData]);
    return {outcomesData, incomesData};
}
