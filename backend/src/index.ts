import { WebSocketServer, WebSocket } from 'ws'
import { isValidJSON } from './utils';

const wss = new WebSocketServer({ port: 8080 })

let senderSocket: WebSocket;
let receiverSocket: WebSocket;

wss.on('connection', (socket) => {

    socket.on('message', (message: string, binary: any) => {
        if (!isValidJSON(message)) {
            console.log(message);
            return
        }
        const msgObj = JSON.parse(message)
        console.log(msgObj);

        const { type } = msgObj;

        if (type === 'sender')
            senderSocket = socket;
        else if (type === 'receiver')
            receiverSocket = socket;
        else if (type === 'createOffer') {
            if (socket !== senderSocket)
                return
            receiverSocket.send(JSON.stringify({ type: 'createOffer', sdp: msgObj.sdp }))
        }
        else if (type === 'createAnswer') {
            if (socket !== receiverSocket)
                return
            senderSocket.send(JSON.stringify({ type: 'createAnswer', sdp: msgObj.sdp }))
        }
        else if (type === 'iceCandidate') {
            if (socket === senderSocket)
                receiverSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: msgObj.candidate }))
            else if (socket === receiverSocket)
                senderSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: msgObj.candidate }))
        }
    })

    // socket.send('Connected to webRTC signalling server');
})

console.log('WebRTC signalling server running on port 8080');

