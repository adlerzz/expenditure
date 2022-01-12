import {DB} from '../app';

export async function createHTML() : Promise<object> {
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
