import {Telegraf} from 'telegraf';
import * as cpu from './command-processor';
import express from "express";
import {Descriptor} from './types';
import {DBAdapter} from './db/DBAdapter';
import {setupRouters} from './reports/routers';
import {DateUtils} from './date-utils';
import {editMessageHandler, interactiveHandler, textMessageHandler} from './handlers/handlers';

const app = express();

DateUtils.init();

const bot = new Telegraf(process.env.TOKEN ?? '');
let botStarted = false;

const SYSADM_CHAT_ID = '286454480';

const dbOptions = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
} : undefined;


export const DB = new DBAdapter(dbOptions);
export let descs: Array<Descriptor>;
export function assignDescs(newDescs: Array<Descriptor>) {
    descs = newDescs;
}
export let steps = new Map<string, object>();

bot.on('text', textMessageHandler);
bot.on('edited_message', editMessageHandler);
bot.on('callback_query', interactiveHandler);

(async () => {
    botStarted = await start();
})();

//main();

async function start(): Promise<boolean>{

    descs = await cpu.getCategoriesDescriptors();

    await bot.launch();

    await bot.telegram.sendMessage(SYSADM_CHAT_ID, 'Me on');
    console.log("App started");
    return true;
}

async function finalize(s){
    if (botStarted) {
        botStarted = false;
        await bot.telegram.sendMessage(SYSADM_CHAT_ID, 'Me off');
        bot.stop('Termination signal ' + s);
    }
    console.log('Termination signal ' + s);
}

process.once('SIGINT', finalize);
process.once('SIGTERM', finalize);
process.once('SIGHUP', finalize);

setupRouters(app);
