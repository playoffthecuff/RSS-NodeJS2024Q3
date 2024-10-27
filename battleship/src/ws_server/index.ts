import { WebSocketServer } from 'ws';

const w = new WebSocketServer({port: 3000});

w.on('connection', () => console.log('WS handshake is complete'));