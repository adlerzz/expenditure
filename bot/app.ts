import {Telegraf} from 'telegraf';
import * as cpu from './command-processor';
import * as parsers from './parsers';
import express from "express";
import {Command, Descriptor, ID, RecordCreate, RecordUpdate} from './types';
import {DBAdapter} from './db/DBAdapter';
import {executeCommand} from './command-processor';
import {setupRouters} from './reports/routers';
import {DateUtils} from './date-utils';

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
let descs: Array<Descriptor>;
let steps = new Map<string, object>();

async function handleCommand(msg: string): Promise<[Command, boolean|object]>{
    const parsed = parsers.parseCommand(msg);
    const result = await cpu.executeCommand(parsed);
    descs = await cpu.getCategoriesDescriptors();
    return [parsed, result];
}

async function handleRecord(msg: string, userId: string, messageId: number): Promise<[RecordCreate|null, boolean]> {
    const parsed = await parsers.parseRecord(msg, descs, messageId, userId);
    const result = parsed ? await DB.addRecord(parsed) : false;
    return [parsed, result];
}

async function handleRecordUpdate(msg: string, msgId: number): Promise<[RecordUpdate | null, boolean]>{
    const rec = await DB.getRecordByMessageId(msgId);
    const updates = await parsers.parseRecordUpdate(msg, descs);
    console.log({updates});
    if(!updates){
        return [null, false];
    }
    const result = await DB.updateRecord(rec.id, updates);
    return [updates, result];
}

bot.on('text', async context => {
    const msgText = context.message.text;
    const messageId = context.message.message_id;
    const user = await DB.getUserBy("associatedId", context.message.from.id ?? -1);

    if(steps.has(user.id)){
        const stepData = steps.get(user.id);
        const parsed = await parsers.createRecordStepByStep(msgText, stepData!['categoryId'] as ID, user.id);
        const result = parsed ? await DB.addRecord(parsed) : false;
        console.log({parsed, result});
        return;
    }

    const [parsed, result] = parsers.willBeCommand(msgText)
        ? await handleCommand(msgText)
        : await handleRecord(msgText, user.id, messageId);

    if(typeof result !== 'boolean') {
        switch(result['type']){
            case 'url': {
                // await context.reply(result['html']);
                const url = result['url'];
                await context.reply(url, {entities: [{type: 'url', length: url.length, offset: 0}]});

            } break;

            case 'keys': {
                const keys = result['keys'];
                await context.reply('keys', {reply_markup: {inline_keyboard: keys } } );
            } break;

            // case 'request': {
            //     const request = result['request'];
            //     steps.set(user.id, request['step']);
            //     await context.reply('request ' + JSON.stringify(request) );
            // }
        }

    } else {
        context.reply(JSON.stringify({parsed, result}));
    }
    console.log({parsed, result});
});

bot.on('edited_message', async context => {
    const msgText = context.update.edited_message['text'] as string;
    const messageId = context.update.edited_message.message_id;

    const [updates, result] = await handleRecordUpdate(msgText, messageId);

    context.reply( JSON.stringify({updates, result}) );
    console.log({updates, result});
});

bot.on('callback_query', async context => {
    const cbQuery = context.callbackQuery;
    const cbData = JSON.parse(cbQuery['data']);
    const user = await DB.getUserBy("associatedId", cbQuery.from.id ?? -1);
    console.log({cbData});

    switch (cbData['flowId']) {
        case 'out': {
            const res = await executeCommand({opcode: 'out', argument: cbData['step'], additional: cbData['id']});
            console.log({res});
            if(res['type'] === 'keys') {
                await context.reply('keys', {reply_markup: {inline_keyboard: res['keys']}});
            } else if(res['type'] === 'request'){
                const request = res['request'];
                steps.set(user.id, request);
                await context.reply('request ' + JSON.stringify(res['request']) );
            }
        } break;
    }



    context.answerCbQuery();
});

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
