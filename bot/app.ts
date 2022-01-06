import {Telegraf} from 'telegraf';
import * as cpu from './CommandProcessor';
import express from "express";
import {Command, Descriptor, RecordCreate} from './types';
import {DBAdapter} from './db/DBAdapter';

const app = express();

const bot = new Telegraf(process.env.TOKEN ?? '');
let botStarted = false;

const CHAT_ID = '286454480';

const dbOptions = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
} : undefined;


export const DB = new DBAdapter(dbOptions);
let descs: Array<Descriptor>;

async function handleCommand(msg: string): Promise<[Command, boolean]>{
    const parsed = cpu.parseCommand(msg);
    const result = await cpu.executeCommand(parsed);
    descs = await cpu.getCategoriesDescriptors();
    return [parsed, result];
}

async function handleRecord(msg: string, userId: string, messageId: number): Promise<[RecordCreate|null, boolean]> {
    const parsed = await cpu.parseRecord(msg, descs, messageId, userId);
    const result = parsed ? await DB.addRecord(parsed) : false;
    return [parsed, result];
}

bot.on('text', async context => {
    const msg = context.message.text;
    const messageId = context.message.message_id;
    const user = await DB.getUserBy("associatedId", context.message.from.id ?? -1);

    const [parsed, result] = cpu.willBeCommand(msg)
        ? await handleCommand(msg)
        : await handleRecord(msg, user.id, messageId);

    context.reply( JSON.stringify({parsed, result}) );
    console.log(messageId);
});

bot.on('edited_message', context => {
    const msg = context.update.edited_message['text'];
    const msgId = context.update.edited_message.message_id;
    console.log({msg, msgId, context});
});

(async () => {
    botStarted = await start();
})();

//main();

async function start(): Promise<boolean>{

    descs = await cpu.getCategoriesDescriptors();

    await bot.launch();

    await bot.telegram.sendMessage(CHAT_ID, 'Me on');
    console.log("App started");
    return true;
}

async function finalize(s){
    if (botStarted) {
        await bot.telegram.sendMessage(CHAT_ID, 'Me off');
        bot.stop('Termination signal ' + s);
        botStarted = false;
    }
    console.log('Termination signal ' + s);
}

process.once('SIGINT', finalize);
process.once('SIGTERM', finalize);
process.once('SIGHUP', finalize);

app.listen(process.env.PORT, () => {
    console.log(`port: ${process.env.PORT}`);
});
