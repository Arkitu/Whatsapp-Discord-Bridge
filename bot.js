import * as Discord from 'discord.js';
import * as Whatsapp from 'whatsapp-web.js';
import { readdirSync } from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';
import qrcode from 'qrcode-terminal';
import { Chat } from './libs/Chat.js';
import fs from 'fs';

// Import config
const config = new JsonDB(new Config("config", true, true, '/'));
const db = new JsonDB(new Config("db", true, true, '/'));

// Log with the current date
export async function log(msg) {
	var datetime = new Date().toLocaleString();
	console.log(`[${datetime}] ${msg}`);
};

export async function log_error(msg) {
	log(`ERROR: ${msg}`);
	await (await d_client.users.fetch(config.getData("/creator_id"))).send(`:warning: ERROR: ${msg}`);
}

//**** Saving Session **** //
//Now have the session file path reference
const SESSION_FILE_PATH = "/.wwebjs_auth";
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = SESSION_FILE_PATH;
}
//new client method
const w_client = new Whatsapp.Client({
    authStrategy: new Whatsapp.default.LocalAuth({ clientId: "694235386658160760", qrTimeoutMs: 0, userDataDir: sessionData })
});
w_client.on('qr', (qr) => {
    log('Whatsapp QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});
w_client.on("authenticated", () => {
    if(sessionData){
        log('Connection has been established')
    }
});

/*
// Create a new client instance for Whatsapp
let w_client = new Whatsapp.Client({
    auth: new Whatsapp.default.LocalAuth({ clientId: '694235386658160760' })
});
w_client.on('qr', (qr) => {
    console.log('Whatsapp QR RECEIVED', qr);
    qrcode.generate(qr, {small: true});
});
*/

// Create a new client instance for Discord
const d_client = new Discord.Client({ intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
] });

// When the client is ready, run this code (only once)
d_client.once('ready', async () => {
	await log('Discord bot logged !');
});
let test_chat;
w_client.once('ready', () => {
    log('Whatsapp client is ready!');
	console.debug(w_client);
	test_chat = new Chat(d_client, w_client, config, db, "981531692240076810", "120363022823626173@g.us");
});
w_client.on('message', message => {
	console.log(message);
});
w_client.initialize();



// Set listeners
let cmd_listener = async interaction => {
	if (interaction.isCommand()) {
		const { commandName } = interaction;
		const command = d_client.commands.get(commandName);

		if (!command) return;

		log(`${interaction.user.username} execute ${commandName}`);

		await command.execute(interaction, config, db);
	}
}

d_client.setMaxListeners(0);
d_client.on('interactionCreate', cmd_listener);

// Import all the commands from the commands files
d_client.commands = new Discord.Collection();
const admin_path = "./commands/admin";
const everyone_path = "./commands/everyone";
const commandFiles = {
	admin: readdirSync(admin_path).filter(file => file.endsWith(".js")),
	everyone: readdirSync(everyone_path).filter(file => file.endsWith(".js"))
};
for (const file of commandFiles.admin) {
	import(`./commands/admin/${file}`)
  		.then((command) => {
    		d_client.commands.set(command.data.name, command);
  		});
}
for (const file of commandFiles.everyone) {
	import(`./commands/everyone/${file}`)
  		.then((command) => {
    		d_client.commands.set(command.data.name, command);
  		});
}

// Login to Discord
d_client.login(config.getData("/d_token"));