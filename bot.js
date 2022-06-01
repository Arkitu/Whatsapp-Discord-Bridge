import * as Discord from 'discord.js';
import * as Whatsapp from 'whatsapp-web.js';
import { readdirSync } from 'fs';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js';

// Import config
const config = new JsonDB(new Config("config", true, true, '/'));

// Log with the current date
export async function log(msg) {
	var datetime = new Date().toLocaleString();
	console.log(`[${datetime}] ${msg}`);
};

export async function log_error(msg) {
	log(`ERROR: ${msg}`);
	await (await d_client.users.fetch(config.getData("/creator_id"))).send(`:warning: ERROR: ${msg}`);
}

// Create a new client instance for Whatsapp
let w_client = new Whatsapp.Client();
w_client.on('qr', (qr) => {
    console.log('Whatsapp QR RECEIVED', qr);
});
w_client.on('ready', () => {
    console.log('Whatsapp client is ready!');
});
w_client.initialize();

// Create a new client instance for Discord
const d_client = new Discord.Client({ intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
] });

// When the client is ready, run this code (only once)
d_client.once('ready', async () => {
	await log('Discord bot logged !');
});

// Set listeners
let cmd_listener = async interaction => {
	if (interaction.isCommand()) {
		const { commandName } = interaction;
		const command = d_client.commands.get(commandName);

		if (!command) return;

		log(`${interaction.user.username} execute ${commandName}`);

		await command.execute(interaction, config);
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