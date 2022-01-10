import * as fs from 'fs';
import * as path from 'path';
import {DB} from '../app';

export async function createHTML() : Promise<[string, string]> {
    const filename = "report.html";
    const dir = path.normalize('./web');

    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        console.log(`create directory "${dir}"`);
    }

    const filepath = path.join(dir, filename);
    const fullfilepath = path.resolve(filepath);
    console.log(`filepath: ${fullfilepath}`);
    const s = `
<!DOCTYPE html>
<html> 
<head>
    <title>Report</title>
    <meta charset="utf-8">
    <style>
        div{
            font-family: sans-serif;
        }
        table {
            border-collapse: collapse;
        }
        td:nth-child(1) {
            font-style: italic;
        }
        td:nth-child(2) {
            font-size: 12px;
            border-left: solid 1px lightgray;
            border-right: solid 1px lightgray;
        }
        td:nth-child(3) {
            font-size: 12px;
            font-family: monospace;
            color: navy;
        }
        tr.s>td{
            border-top: solid 1px gray;
            border-bottom: solid 1px lightgray;
        }
        td{
            padding: 3px 5px;
        }
        td.c {
            border-top: solid 1px lightgray;
        }
        
    </style>
</head>
<body> 
    <div>
        <table>
            <tr><th>Расходная категория</th><th>Расходная статья</th><th>Ключи</th></tr>
`;

    const categories = await DB.getCategories();
    const outcomeCat = await DB.getCategoryBy('outcomes');
    const outcomes = categories.filter(c => c.parentId == outcomeCat!.id );
    const b = outcomes.map( outcome => {
        const p = `
            <tr class="s"><td>${outcome.name}</td><td></td><td>${outcome.aliases}</td></tr>
`;
        const cs = categories.filter(c => c.parentId == outcome!.id ).map( c => `
            <tr><td></td><td class="c">${c.name}</td><td class="c">${c.aliases}</td></tr>
`);
        return p + cs.join('');
    }).join('');
    const f = `
        </table>
    </div>
</body>
</html>
`;

    fs.writeFileSync(filepath, s + b + f);
    return [filepath, filename];
    //return s + b + f;
}
