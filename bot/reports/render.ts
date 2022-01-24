import {DB} from '../app';
import {DateUtils} from '../date-utils';

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

export async function createMonthlyReport(month: string) : Promise<object> {
    const categories = await DB.getCategories();
    const outcomeCats = await DB.getOutcomesCategories();
    const incomeCats = await DB.getIncomesCategories();

    const allRecords = await DB.getRecords();
    const allUsers = await DB.getUsers();
    const records = allRecords.filter(r => DateUtils.isInMonth(r.timestamp, month));
    const [incomesData, outcomesData] = [incomeCats, outcomeCats].map( cats => records
        .filter(r => cats.map(c => c.id).includes(r.categoryId) )
        .map( r => ({
            timestamp: DateUtils.formatDate(r.timestamp),
            category: categories.find(c => r.categoryId === c.id)?.name ?? 'N/A',
            value: r.value,
            user: allUsers.find(u => u.id === r.userId)?.nickname ?? 'N/A',
            comment: r.comment ?? ''
        })) )

    console.log([incomesData, outcomesData]);
    return {outcomesData, incomesData};
}
