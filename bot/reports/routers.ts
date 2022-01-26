import path from 'path';
import express from "express";
import consolidate from "consolidate";
import * as xpt from 'swig-templates';

import * as render from './render';

const staticPath = './web';

export function setupRouters(app: any){

    app.set('views', staticPath);
    app.set('view engine', 'xpt');
    app.use(express.static(staticPath));

    console.log(path.resolve('./web') + path.sep );

    app.engine('xpt', consolidate.swig);


    app.get('/web/info', async (req, res) => {
        console.log(req.query);

        const data = await render.createInfo();
        console.log(data);
        res.render('info/info', {
            outcomes: data['outcomesData'],
            incomes: data['incomesData']
        });

    });

    app.get('/web/reports/monthly', async (req, res) => {
        console.log(req.query);
        const month = req.query['mon']
        const data = await render.createMonthlyReport(month);
        console.log(data);
        res.render('reports/monthly/monthly', {
            tabs: [
                {data: data['outcomesData'], class: 'outcomes'},
                {data: data['incomesData'], class: 'incomes'}
            ]
        });
    })

    app.listen(process.env.PORT, () => {
        console.log(`port: ${process.env.PORT}`);
    });
}

