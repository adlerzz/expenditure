import {Telegraf} from "telegraf";
import {BOT_TOKEN} from './token';
import {main} from './uti';

const bot = new Telegraf(BOT_TOKEN);

bot.start( context => {

})

bot.on('text', context => {

})

//bot.launch();

console.log("App started");

function finalize(){
    bot.stop('Termination signal');
    console.log('Termination signal');
}


console.log(BOT_TOKEN);

process.once('SIGINT', finalize);
process.once('SIGTERM', finalize);


main();
