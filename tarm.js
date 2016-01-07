'use strict';

const net = require('net');
const fs = require('fs');

const http = require('http');

/*
	Constants
*/

const hostname = fs.readFileSync('/etc/hostname').toString().trim();

/*
	Realtime
*/

const io = require('socket.io')(new http.Server, {
	serveClient: false
});

io.on('connection', socket => {
	socket.emit('an event', { some: 'data' });
});

io.listen(0xFACE);

/*
	Tarm
*/

const controlClient = net.connect({
	host: '127.0.0.1', port: 9051
}, function() {
	controlClient.on('data', data => {
		data = data.toString().split(' ').slice(1);

		const cmd = data.shift();

		if (cmd === 'BW') {
			io.emit('bw', {
				[hostname]: {
					bw: data.map(function(a) { return +a; })
				}
			});
		}
	});

	controlClient.write('AUTHENTICATE \'\'\r\n');
	controlClient.write('SETEVENTS BW\r\n');
});