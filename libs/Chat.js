export class Chat {
    constructor(d_client, w_client, config, db, d_channel_id, w_chat_id) {
        this.d_client = d_client;
        this.w_client = w_client;
        this.config = config;
        this.db = db;
        this.d_channel_id = d_channel_id;
        this.w_chat_id = w_chat_id;
        this.d_channel = d_client.channels.fetch(d_channel_id);
        this.w_chat = w_client.getChatById(w_chat_id);
        this.d_client.on('messageCreate', async msg => {
            if (msg.channel.id != this.d_channel_id) return;
            if (msg.author.id == this.d_client.user.id) return;
            (await this.w_chat).sendMessage(`*${msg.author.username} :* ${msg.content}`);
        });
        this.w_client.on('message', async msg => {
            if (msg.from != this.w_chat_id) return;
            await (await this.d_channel).send(`**${msg._data.notifyName} :** ${msg.body}`);
        });
    }
}