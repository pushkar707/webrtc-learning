import { useEffect, useState } from 'react'

const Sender = () => {
    const [socket, setSocket] = useState<WebSocket>()

    useEffect(() => {
        const socket = new WebSocket('http://localhost:8080');

        socket.onopen = () => {
            setSocket(socket)
            socket?.send(JSON.stringify({ type: 'sender' }))
        }

        socket.onmessage = message => {
            console.log(message);
        }
    }, [])

    const sendOffer = () => {
        if (!socket) {
            console.log("Socket not set");
            return
        }

        const pc = new RTCPeerConnection()
        pc.onnegotiationneeded = async () => { // offer is send when all connection parameters(media tracks, etc) are defined. Also, the offer and answer are constantly modified as per the trakcs, so they need to be constantly updated  
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer)
            socket.send(JSON.stringify({ type: 'createOffer', sdp: pc.localDescription }))
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            const { type } = message

            if (type === 'createAnswer') {
                pc.setRemoteDescription(message.sdp)
            } else if (type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate)
            }
        }

        pc.onicecandidate = (event) => {
            const { candidate } = event
            socket.send(JSON.stringify({ type: 'iceCandidate', candidate }))
        }                     

        sendTrack(pc)
    }

    const sendTrack = async (pc: RTCPeerConnection) => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => {
            pc.addTrack(track)
        })
    }
    return (
        <div>
            <p>Sender</p>
            <button onClick={sendOffer}>Send Offer</button>
        </div>
    )
}

export default Sender