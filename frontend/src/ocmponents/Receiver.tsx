import { useEffect, useRef, useState } from 'react'

const Sender = () => {
    const [socket, setSocket] = useState<WebSocket>()

    useEffect(() => {
        const socket = new WebSocket('http://localhost:8080');

        socket.onopen = () => {
            setSocket(socket)
            socket.send(JSON.stringify({ type: 'receiver' }))
        }

        const pc = new RTCPeerConnection();

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data)

            const { type } = message
            if (type === 'createOffer') {
                pc.setRemoteDescription(message.sdp)
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                socket.send(JSON.stringify({ type: 'createAnswer', sdp: pc.localDescription }))
            } else if (type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate)
            }
        }

        pc.onicecandidate = event => {
            const { candidate } = event
            socket.send(JSON.stringify({ type: 'iceCandidate', candidate }))
        }

        pc.ontrack = event => {
            console.log(event.track);
            if (videoRef.current) {
                // @ts-ignore
                videoRef.current.srcObject = new MediaStream([event.track]);
            }


        }
    }, [])

    const videoRef = useRef(null)
    return (
        <div>
            <p>Receiver</p>
            <video ref={videoRef} autoPlay controls></video>
        </div>
    )
}

export default Sender