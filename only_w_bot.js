import * as Whatsapp from 'whatsapp-web.js';
import fs from 'fs';
import qrcode from 'qrcode-terminal';
import { Chat } from './libs/Chat.js';

/*
(async ()=>{
    let w_client = new Whatsapp.Client({
        auth: await new Whatsapp.default.LocalAuth()
    });
    w_client.on('qr', (qr) => {
        console.log('Whatsapp QR RECEIVED', qr);
        qrcode.generate(qr, { small: true });
    });
    w_client.on('ready', () => {
        console.log('Whatsapp client is ready!');
        console.debug(w_client);
        console.debug(w_client.auth);
    });
    w_client.on("authenticated", () => {
        console.log("AUTHENTICATED");
    });
    w_client.on('message_create', async message => {
        console.log(await message.getChat());
    });
    w_client.initialize();
})();
*/

//**** Saving Session **** //
//Now have the session file path reference
const SESSION_FILE_PATH = "/.wwebjs_auth";
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = SESSION_FILE_PATH;
}
//new client method
const client = new Whatsapp.Client({
    authStrategy: new Whatsapp.default.LocalAuth({ clientId: "client-one", qrTimeoutMs: 0, userDataDir: sessionData })
});
client.on('qr', (qr) => {
    console.log('Whatsapp QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});
client.on("authenticated", () => {
    if(sessionData){
        console.log('Connection has been established')
    }
});
client.initialize();