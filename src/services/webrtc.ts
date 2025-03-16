interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  from: string;
  to?: string;
  data: any;
}

class WebRTCService {
  private ws: WebSocket | null = null;
  private peerConnections: { [key: string]: RTCPeerConnection } = {};
  private localStream: MediaStream | null = null;

  constructor(private groupId: string) {}

  async initialize(userId: string) {
    // Connect to signaling server
    this.ws = new WebSocket(`ws://localhost:3001?groupId=${this.groupId}&userId=${userId}`);
    
    this.ws.onmessage = async (event) => {
      const message: SignalingMessage = JSON.parse(event.data);
      await this.handleSignalingMessage(message);
    };

    // Get local media stream
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }

  private async handleSignalingMessage(message: SignalingMessage) {
    switch (message.type) {
      case 'join':
        await this.handleUserJoined(message.from);
        break;
      case 'offer':
        await this.handleOffer(message.from, message.data);
        break;
      case 'answer':
        await this.handleAnswer(message.from, message.data);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(message.from, message.data);
        break;
      case 'leave':
        this.handleUserLeft(message.from);
        break;
    }
  }

  private async handleUserJoined(userId: string) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          from: this.groupId,
          to: userId,
          data: event.candidate
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      // Emit event for new remote stream
      const remoteStreamEvent = new CustomEvent('remoteStream', {
        detail: { userId, stream: event.streams[0] }
      });
      window.dispatchEvent(remoteStreamEvent);
    };

    this.peerConnections[userId] = peerConnection;

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    this.sendSignalingMessage({
      type: 'offer',
      from: this.groupId,
      to: userId,
      data: offer
    });
  }

  private async handleOffer(userId: string, offer: RTCSessionDescriptionInit) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          from: this.groupId,
          to: userId,
          data: event.candidate
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      // Emit event for new remote stream
      const remoteStreamEvent = new CustomEvent('remoteStream', {
        detail: { userId, stream: event.streams[0] }
      });
      window.dispatchEvent(remoteStreamEvent);
    };

    this.peerConnections[userId] = peerConnection;

    // Set remote description and create answer
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.sendSignalingMessage({
      type: 'answer',
      from: this.groupId,
      to: userId,
      data: answer
    });
  }

  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections[userId];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  }

  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit) {
    const peerConnection = this.peerConnections[userId];
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  }

  private handleUserLeft(userId: string) {
    const peerConnection = this.peerConnections[userId];
    if (peerConnection) {
      peerConnection.close();
      delete this.peerConnections[userId];
    }
  }

  private sendSignalingMessage(message: SignalingMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  cleanup() {
    // Close all peer connections
    Object.values(this.peerConnections).forEach(connection => {
      connection.close();
    });
    this.peerConnections = {};

    // Stop all tracks in local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default WebRTCService; 