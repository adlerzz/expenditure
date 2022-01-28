import * as parsers from '../parsers';
import {Command, CommandResult, ID, RecordCreate, RecordUpdate} from '../types';
import * as cpu from '../command-processor';
import {DB, steps, descs, assignDescs} from '../app';
import {CODE_FAIL, CRByCode, executeCommand} from '../command-processor';

export async function textMessageHandler(context){
    const msgText = context.message.text;
    const messageId = context.message.message_id;
    const user = await DB.getUserBy("associatedId", context.message.from.id ?? -1);

    if(steps.has(user.id)){
        const stepData = steps.get(user.id);
        const parsed = await parsers.createRecordStepByStep(msgText, stepData!['categoryId'] as ID, user.id);
        const result = parsed ? await DB.addRecord(parsed) : false;

        if(result){
            steps.delete(user.id);
        }

        console.log({parsed, result});
        return;
    }

    const [parsed, result] = parsers.willBeCommand(msgText)
        ? await handleCommand(msgText)
        : await handleRecord(msgText, user.id, messageId);


    switch(result.type){

        case 'code': {
            context.reply(JSON.stringify({parsed, result}));
            console.log({parsed, result});
        } break;

        case 'url': {
            const url = result.url;
            await context.reply(url, {entities: [{type: 'url', length: url.length, offset: 0}]});

        } break;

        case 'keys': {
            const keys = result.keys;
            await context.reply('keys', {reply_markup: {inline_keyboard: keys } } );
        } break;

    }

}

export async function editMessageHandler(context){
    const msgText = context.update.edited_message['text'] as string;
    const messageId = context.update.edited_message.message_id;

    const [updates, result] = await handleRecordUpdate(msgText, messageId);

    context.reply( JSON.stringify({updates, result}) );
    console.log({updates, result});
}

export async function interactiveHandler(context) {
    const cbQuery = context.callbackQuery;
    const cbData = JSON.parse(cbQuery['data']);
    console.log({cbData});

    switch (cbData['flowId']) {
        case 'out': {
            await interactiveOutcome(context);
        } break;
    }

    context.answerCbQuery();

}

async function interactiveOutcome(context){
    const cbQuery = context.callbackQuery;
    const cbData = JSON.parse(cbQuery['data']);
    const user = await DB.getUserBy("associatedId", cbQuery.from.id ?? -1);
    const res = await executeCommand({opcode: 'out', argument: cbData['step'], additional: cbData['id']});
    console.log(['interactiveOutcome', res]);

    switch (res.type){
        case 'keys': {
            const keys = res.keys;
            await context.reply('keys', {reply_markup: {inline_keyboard: keys}});
        } break;

        case 'request': {
            const request = res.request;
            steps.set(user.id, request);
            await context.reply('request ' + JSON.stringify(request) );
        } break;
    }
}

async function handleCommand(msg: string): Promise<[Command, CommandResult]>{
    const parsed = parsers.parseCommand(msg);
    const result = await cpu.executeCommand(parsed);
    const newDescs = await cpu.getCategoriesDescriptors();
    assignDescs(newDescs);
    return [parsed, result];
}

async function handleRecord(msg: string, userId: string, messageId: number): Promise<[RecordCreate|null, CommandResult]> {
    const parsed = await parsers.parseRecord(msg, descs, messageId, userId);
    const res = parsed ? await DB.addRecord(parsed) : false;
    return [parsed, CRByCode(res)];
}

async function handleRecordUpdate(msg: string, msgId: number): Promise<[RecordUpdate | null, CommandResult]>{
    const rec = await DB.getRecordByMessageId(msgId);
    const updates = await parsers.parseRecordUpdate(msg, descs);
    console.log({updates});
    if(!updates){
        return [null, CODE_FAIL];
    }
    const res = await DB.updateRecord(rec.id, updates);
    return [updates, CRByCode(res)];
}
