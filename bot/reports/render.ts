import {DB} from '../app';
import {DateUtils} from '../date-utils';

const NO_DATA = '--';

function printCurrency(value: number|null): string {
    if(value === null){
        return NO_DATA;
    }
    return value.toFixed(2);
}

function printCategory(name: string): string {
    if(!name) {
        return NO_DATA;
    }
    return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
}

export async function createInfo() : Promise<object> {
    const allCategories = await DB.getCategories();

    const volumes = await Promise.all( ['outcomes', 'incomes'].map(desc => DB.getCategoryBy(desc) ))

    const [outcomesData, incomesData] = volumes
        .map(volume => allCategories
            .filter(category => category.parentId == volume!.id )
        )
        .map(categories => categories
            .map(category => ({
                name: category.name,
                children: allCategories
                    .filter(article => article.parentId == category!.id)
                    .map(article => ({
                        name: article.name,
                        aliases: article.aliases!.join(', ')
                    })),
                aliases: category.aliases!.join(', ')
            }))
        );

    return {outcomesData, incomesData};
}

export async function createMonthlyDetails(month: string) : Promise<object> {
    const allCategories = await DB.getCategories();
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
            category: printCategory(allCategories.find(c => r.categoryId === c.id)?.name ?? ''),
            value: printCurrency(r.value),
            user: allUsers.find(u => u.id === r.userId)?.nickname ?? NO_DATA,
            comment: r.comment ?? ''
        })) )


    console.log([incomesData, outcomesData]);
    return {outcomesData, incomesData};
}

export async function createMonthlyReport(month: string): Promise<object> {

    const allCategories = await DB.getCategories();
    const volumes = await Promise.all( ['outcomes', 'incomes'].map(desc => DB.getCategoryBy(desc) ))

    const allRecords = await DB.getRecords();

    const records = allRecords.filter(r => DateUtils.isInMonth(r.timestamp, month));

    const [outcomesData, incomesData] = volumes
        .map(volume => allCategories
            .filter(category => category.parentId == volume!.id )
        )
        .map(categories => categories.map(category => {

                const artictles = allCategories
                    .filter(article => article.parentId === category!.id)
                    .map(article => {
                        const sum = records
                            .filter(r => r.categoryId === article.id)
                            .reduce((sum, val) => sum + val.value, 0)

                        return {
                            id: article.id,
                            name: article.name,
                            sum: sum,
                            value: printCurrency(sum)
                        }
                    });
                const outOfArtId = allCategories.find(c => c.id === category!.id)!.id;
                const outOfArtSum = records
                    .filter(r => r.categoryId === outOfArtId)
                    .reduce((sum, val) => sum + val.value, 0);
                artictles.push({
                    id: outOfArtId,
                    name: 'без уточнения',
                    sum: outOfArtSum,
                    value: printCurrency(outOfArtSum)
                });
                const value = artictles.reduce((sum, article) => sum + article.sum, 0);
                return({name: category.name, children: artictles, value: printCurrency(value)});
            }));

    return {outcomesData, incomesData};
}
