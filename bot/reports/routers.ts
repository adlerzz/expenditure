import path from 'path';
import express from "express";
import * as xpt from 'htmling';

import {createHTML} from './render';

const staticPath = './web';

export function setupRouters(app: any){

    app.set('views', staticPath);
    app.set('view engine', 'xpt');
    app.use(express.static(staticPath));

    console.log(path.resolve('./web') + path.sep );

    app.engine('xpt', xpt.express( path.resolve(staticPath) + path.sep));


    app.get('/web/info', async (req, res) => {
        console.log(req.query);

        const data = await createHTML();
        console.log(data);
        res.render('info/info', {
            outcomes: data['outcomesData'],
            incomes: data['incomesData']
        });

    });

    app.listen(process.env.PORT, () => {
        console.log(`port: ${process.env.PORT}`);
    });
}

