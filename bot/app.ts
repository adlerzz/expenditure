import {Telegraf} from 'telegraf';
import * as cpu from './CommandProcessor';
import * as parsers from './parsers';
import express from "express";
import {Command, Descriptor, RecordCreate, RecordUpdate} from './types';
import {DBAdapter} from './db/DBAdapter';
import {InputFile} from 'telegraf/typings/core/types/typegram';
import * as fs from 'fs';

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

    const [parsed, result] = parsers.willBeCommand(msgText)
        ? await handleCommand(msgText)
        : await handleRecord(msgText, user.id, messageId);

    if(typeof result !== 'boolean') {
        switch(result['type']){
            case 'html': {
                // await context.reply(result['html']);
                const {filepath, filename} = result['html'];
                const rs = fs.createReadStream(filepath);
                await context.replyWithDocument({source: rs, filename} as InputFile)

            } break;
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
        botStarted = false;
        await bot.telegram.sendMessage(CHAT_ID, 'Me off');
        bot.stop('Termination signal ' + s);
    }
    console.log('Termination signal ' + s);
}

process.once('SIGINT', finalize);
process.once('SIGTERM', finalize);
process.once('SIGHUP', finalize);

app.listen(process.env.PORT, () => {
    console.log(`port: ${process.env.PORT}`);
});
