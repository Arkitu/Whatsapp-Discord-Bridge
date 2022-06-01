import * as Whatsapp from 'whatsapp-web.js';
const { LocalAuth } = Whatsapp.default;
import qrcode from 'qrcode-terminal';

let w_client = new Whatsapp.Client({
    auth: new LocalAuth({ clientId: '694235386658160760' })
});
w_client.on('qr', (qr) => {
    console.log('Whatsapp QR RECEIVED', qr);
    qrcode.generate(qr, {small: true});
});
w_client.on('ready', () => {
    console.log('Whatsapp client is ready!');
});
w_client.on('message', message => {
	console.log(message);
});
w_client.initialize();