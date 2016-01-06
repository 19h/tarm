'use strict';

const net = require('net');
const fs = require('fs');

let payload = null;

let tarm_buf = new Buffer('');

const hostname = fs.readFileSync('/etc/hostname').toString().trim();

const _tb = function() {
	tarm_buf = new Buffer(JSON.stringify({
		[hostname]: {
			bw: payload
		}
	}));
};

const controlClient = net.connect({
	host: '127.0.0.1', port: 9051
}, function() {
	controlClient.on('data', data => {
		data = data.toString().split(' ').slice(1);

		const cmd = data.shift();

		if (cmd === 'BW') {
			payload = data.map(function(a) { return +a; });
		}

		_tb();
	});

	controlClient.write('AUTHENTICATE \'\'\r\n');
	controlClient.write('SETEVENTS BW\r\n');
});

net.createServer(sock => {
	let timer, lastbuf = new Buffer('yo');

	const _close = () => clearInterval(timer);

	timer = setInterval(function () {
		if (lastbuf.toString() !== tarm_buf.toString()) {
			lastbuf = tarm_buf;
			sock.write(tarm_buf);
		}
	}, 200);

	sock.on('close', _close);
	sock.on('error', _close);
}).listen(0xFACE);
