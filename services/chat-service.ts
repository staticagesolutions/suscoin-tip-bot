import { Update } from "node-telegram-bot-api";

import db from '@db'

export class ChatService {

    async registerChatId(update: Update) {
        const { chat: { id, username } } = update.message!;
        if(!username) {
            throw new Error('No username found.')
        }
        return db.chat.upsert({
            create: {
                chatId: id,
                username
            },
            update: {
                chatId: id
            },
            where: {
                username
            }
        })
    }

}