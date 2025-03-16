import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Users, Link, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VideoCallProps {
  groupId: string;
  onClose: () => void;
  userName: string;
}

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
}

interface WebSocketMessage {
  type: string;
  from?: string;
  to?: string;
  data?: any;
  candidate?: RTCIceCandidate;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
}

const VideoCall: React.FC<VideoCallProps> = ({ groupId, onClose, userName }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Using a free WebSocket server
    const ws = new WebSocket('wss://free.blr2.piesocket.com/v3/1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV');
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket Connected');
      sendWebSocketMessage({
        type: 'join',
        data: { groupId, userName }
      });
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      toast({
        title: "Connection Lost",
        description: "Lost connection to the call server. Trying to reconnect...",
        variant: "destructive"
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      toast({
        title: "Connection Error",
        description: "Error connecting to the call server. Please try again.",
        variant: "destructive"
      });
    };
    
    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        sendWebSocketMessage({
          type: 'leave',
          data: { groupId, userName }
        });
      }
      ws.close();
      stopLocalStream();
    };
  }, [groupId, userName]);

  // Initialize local media stream
  useEffect(() => {
    initializeLocalStream();
    return () => stopLocalStream();
  }, []);

  const initializeLocalStream = async () => {
    try {
      console.log('Requesting media devices...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      console.log('Got media stream:', stream);
      if (localVideoRef.current) {
        console.log('Setting local video source');
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(err => console.error('Error playing local video:', err));
      }
      
      localStreamRef.current = stream;
      setParticipants(prev => [...prev, { id: 'local', name: userName }]);
      
      // Update track states based on initial settings
      stream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled;
      });
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled;
      });

      // Notify other participants
      broadcastNewParticipant();

      toast({
        title: "Camera Ready",
        description: "Your camera and microphone are now active.",
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Media Access Error",
        description: "Unable to access camera or microphone. Please check permissions and ensure no other app is using them.",
        variant: "destructive"
      });
    }
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
  };

  const sendWebSocketMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const broadcastNewParticipant = () => {
    sendWebSocketMessage({
      type: 'new-participant',
      data: {
        groupId,
        userName
      }
    });
  };

  const handleNewParticipant = async (data: WebSocketMessage) => {
    if (data.from && data.from !== 'local') {
      const pc = createPeerConnection(data.from);
      
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        sendWebSocketMessage({
          type: 'offer',
          to: data.from,
          offer
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  };

  const handleOffer = async (data: WebSocketMessage) => {
    if (data.from && data.offer) {
      const pc = createPeerConnection(data.from);
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        sendWebSocketMessage({
          type: 'answer',
          to: data.from,
          answer
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    }
  };

  const handleAnswer = async (data: WebSocketMessage) => {
    if (data.from && data.answer) {
      const pc = peerConnections.current[data.from];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    }
  };

  const handleIceCandidate = async (data: WebSocketMessage) => {
    if (data.from && data.candidate) {
      const pc = peerConnections.current[data.from];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error('Error handling ICE candidate:', error);
        }
      }
    }
  };

  const handleParticipantLeft = (data: WebSocketMessage) => {
    if (data.from) {
      // Close and remove peer connection
      const pc = peerConnections.current[data.from];
      if (pc) {
        pc.close();
        delete peerConnections.current[data.from];
      }
      
      // Remove participant from the list
      setParticipants(prev => prev.filter(p => p.id !== data.from));
    }
  };

  const handleWebSocketMessage = async (data: any) => {
    switch (data.type) {
      case 'new-participant':
        handleNewParticipant(data);
        break;
      case 'offer':
        handleOffer(data);
        break;
      case 'answer':
        handleAnswer(data);
        break;
      case 'ice-candidate':
        handleIceCandidate(data);
        break;
      case 'participant-left':
        handleParticipantLeft(data);
        break;
    }
  };

  const createPeerConnection = (participantId: string) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebSocketMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: participantId
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setParticipants(prev => {
        const participant = prev.find(p => p.id === participantId);
        if (participant) {
          return prev.map(p => 
            p.id === participantId ? { ...p, stream } : p
          );
        }
        return [...prev, { id: participantId, name: 'New Participant', stream }];
      });
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    peerConnections.current[participantId] = pc;
    return pc;
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
      
      toast({
        title: isAudioEnabled ? "Microphone Muted" : "Microphone Active",
        description: isAudioEnabled ? "Your microphone has been muted" : "Your microphone is now active",
      });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
      
      toast({
        title: isVideoEnabled ? "Camera Off" : "Camera On",
        description: isVideoEnabled ? "Your camera has been turned off" : "Your camera has been turned on",
      });
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/groups/join/${groupId}`;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share this link with others to join the call.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Participants: {participants.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={isCopied ? "text-green-500" : ""}
            onClick={copyInviteLink}
          >
            {isCopied ? <Copy className="h-4 w-4" /> : <Link className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        {/* Local video */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-sm">
            You (Host)
          </div>
        </div>

        {/* Remote participants */}
        {participants
          .filter(p => p.id !== 'local')
          .map(participant => (
            <div key={participant.id} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {participant.stream && (
                <video
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  ref={el => {
                    if (el) el.srcObject = participant.stream;
                  }}
                />
              )}
              <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-sm">
                {participant.name}
              </div>
            </div>
          ))}
      </div>

      <div className="p-4 border-t flex items-center justify-center gap-4">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="icon"
          onClick={toggleAudio}
        >
          {isAudioEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="icon"
          onClick={toggleVideo}
        >
          {isVideoEnabled ? (
            <VideoIcon className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={onClose}
        >
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default VideoCall; 