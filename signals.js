exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  if (body.offer) {
    // Handle offer and respond with an answer
    const peerConnection = new RTCPeerConnection();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(body.offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    return {
      statusCode: 200,
      body: JSON.stringify({ answer }),
    };
  }

  if (body.candidate) {
    // Handle ICE candidate
    console.log('Received ICE candidate:', body.candidate);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Candidate received' }),
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Invalid request' }),
  };
};
