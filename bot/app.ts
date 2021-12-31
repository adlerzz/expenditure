import {Telegraf} from "telegraf";
import * as uti from './uti';
import express from "express";
import {DBJSONAdapter} from './db/DBJSONAdapter';
import {Descriptor} from './types';
import {main} from './uti';
import {DBAdapter} from './db/DBAdapter';

const app = express();

const bot = new Telegraf(process.env.TOKEN);
const botStarted = false;

const CHAT_ID = '286454480';

//export let DB = new DBJSONAdapter();
export let DB = new DBAdapter();
let descs: Array<Descriptor>;

bot.on('text', async context => {
    const msg = context.message.text;
    const messageId = context.message.message_id;
    if (uti.willBeCommand(msg)) {
        const cmd = uti.parseCommand(msg);
        const res = uti.executeCommand(cmd);
        descs = await uti.getCategoriesDescriptors();
        context.reply( JSON.stringify({cmd, res}) );
    } else {
        const rec = await uti.parseRecord(msg, descs, messageId);
        rec.userId = context.message.from.username;
        const res = DB.addRecord(rec);
        context.reply(JSON.stringify({rec, res}));
    }
    const msgId = context.message.message_id;
    console.log(msgId);
});

bot.on('edited_message', context => {
    const msg = context.update.edited_message['text'];
    const msgId = context.update.edited_message.message_id;
    console.log({msg, msgId});
})

//botStarted = await start();

main();

async function start(): Promise<boolean>{

    descs = await uti.getCategoriesDescriptors();

    await bot.launch();

    await bot.telegram.sendMessage(CHAT_ID, 'Me on');
    console.log("App started");
    return true;
}

async function finalize(s){
    if (botStarted) {
        await bot.telegram.sendMessage(CHAT_ID, 'Me off');
        bot.stop('Termination signal ' + s);
    }
    //DB.endSession();
    console.log('Termination signal ' + s);
}

process.once('SIGINT', finalize);
process.once('SIGTERM', finalize);
process.once('SIGHUP', finalize);

app.listen(process.env.PORT, () => {
    console.log(`port: ${process.env.PORT}`);
});
