const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');

let localStream;
let peerConnection;

// STUN server configuration
const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

startButton.addEventListener('click', async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  peerConnection = new RTCPeerConnection(config);

  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      const response = await fetch('/.netlify/functions/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate: event.candidate }),
      });
      console.log(await response.json());
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const response = await fetch('/.netlify/functions/signal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer }),
  });

  const { answer } = await response.json();
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});
