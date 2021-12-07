import {Telegraf} from "telegraf";
import {BOT_TOKEN} from './token';
import {main} from './uti';
import {DBHelper} from './DBHelper';

const bot = new Telegraf(BOT_TOKEN);

export let DB = new DBHelper();

bot.start( context => {

})

bot.on('text', context => {

})

//bot.launch();

console.log("App started");

function finalize(){
    bot.stop('Termination signal');
    DB.endSession();
    console.log('Termination signal');
}


console.log(BOT_TOKEN);

process.once('SIGINT', finalize);
process.once('SIGTERM', finalize);


main();
