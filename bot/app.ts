import {Telegraf} from "telegraf";
import {BOT_TOKEN} from './token';
import * as uti from './uti';
import express from "express";
import {DBHelper} from './DBHelper';
import {Descriptor} from './types';

const app = express();

const bot = new Telegraf(BOT_TOKEN);

export let DB = new DBHelper();
let descs: Array<Descriptor> = uti.getCategoriesDescriptors();

bot.on('text', context => {
    const msg = context.message.text;
    if (uti.willBeCommand(msg)) {
        const cmd = uti.parseCommand(msg);
        const res = uti.executeCommand(cmd);
        descs = uti.getCategoriesDescriptors();
        context.reply( JSON.stringify({cmd, res}) );
    } else {
        const rec = uti.parseRecord(msg, descs);
        rec.userId = context.message.from.username;
        const res = DB.addRecord(rec);
        context.reply(JSON.stringify({rec, res}));
    }

})

bot.launch();

bot.telegram.sendMessage('286454480', 'Me on');
console.log("App started");

async function finalize(){
    await bot.telegram.sendMessage('286454480', 'Me off');
    bot.stop('Termination signal');
    DB.endSession();
    console.log('Termination signal');
}

const port = process.env.PORT ?? 8700;

process.once('SIGINT', finalize);
process.once('SIGTERM', finalize);
process.once('SIGHUP', finalize);

app.listen(port, () => {
    console.log(`port: ${port}`);
});

