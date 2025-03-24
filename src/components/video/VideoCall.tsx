import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Users, Link, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { db, auth, rtdb } from '@/config/firebase';
import { ref, onValue, set, remove, onDisconnect, push, child, get } from 'firebase/database';

interface VideoCallProps {
  groupId: string;
  onClose: () => void;
  userName: string;
  isAudioOnly?: boolean;
}

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  videoEnabled?: boolean;
}

const VideoCall: React.FC<VideoCallProps> = ({ groupId, onClose, userName, isAudioOnly = false }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(!isAudioOnly);
  const [isCopied, setIsCopied] = useState(false);
  const [debugMessage, setDebugMessage] = useState<string>('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const currentUserId = auth.currentUser?.uid || 'anonymous';
  const callSignalingRef = useRef<any>(null);
  
  // ICE servers configuration for WebRTC
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
  };

  const addDebugMessage = (message: string) => {
    console.log(`[VideoCall Debug] ${message}`);
    setDebugMessage(prev => `${message}\n${prev}`.slice(0, 1000));
  };

  // Initialize Firebase connection for signaling
  useEffect(() => {
    if (!rtdb) {
      addDebugMessage('Realtime Database not initialized');
      toast({
        title: "Connection Error",
        description: "Firebase Realtime Database is not initialized. Video calls may not work.",
        variant: "destructive"
      });
      return;
    }

    addDebugMessage(`Initializing call for group: ${groupId}`);
    // Create a reference to this call in the database
    const callRef = ref(rtdb, `calls/${groupId}`);
    callSignalingRef.current = callRef;
    
    // Add current user to participants
    const myConnectionRef = child(callRef, `participants/${currentUserId}`);
    set(myConnectionRef, {
      userName,
      joinedAt: new Date().toISOString(),
      isAudioOnly
    }).then(() => {
      addDebugMessage(`Added user ${userName} (${currentUserId.slice(0, 5)}...) to participants`);
    }).catch(error => {
      addDebugMessage(`Error adding user to participants: ${error.message}`);
    });
    
    // Clean up when component unmounts
    return () => {
      // Remove self from participants
      if (callSignalingRef.current) {
        const myRef = child(callSignalingRef.current, `participants/${currentUserId}`);
        remove(myRef).catch(error => {
          console.error('Error removing participant:', error);
        });
      }
      stopLocalStream();
    };
  }, [groupId, userName, currentUserId, isAudioOnly, toast]);

  // Listen for other participants
  useEffect(() => {
    if (!callSignalingRef.current) return;
    
    const participantsRef = child(callSignalingRef.current, 'participants');
    addDebugMessage('Setting up participant listener');
    
    // Listen for participant changes
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const participantsData = snapshot.val() || {};
      
      addDebugMessage(`Participants updated: ${Object.keys(participantsData).length} participant(s)`);
      
      // Handle new participants and create peer connections
      Object.keys(participantsData).forEach(participantId => {
        if (participantId !== currentUserId && !peerConnections.current[participantId]) {
          addDebugMessage(`New participant detected: ${participantId.slice(0, 5)}...`);
          // Create a new peer connection for this participant
          createPeerConnection(participantId);
          
          // If we have a local stream, send an offer
          if (localStreamRef.current) {
            createAndSendOffer(participantId);
          }
        }
      });
    }, (error) => {
      addDebugMessage(`Error listening to participants: ${error.message}`);
      console.error('Error listening to participants:', error);
    });
    
    return () => unsubscribe();
  }, [currentUserId]);

  // Listen for WebRTC signaling messages
  useEffect(() => {
    if (!callSignalingRef.current) return;
    
    const signalingRef = child(callSignalingRef.current, 'signaling');
    
    // Listen for offers meant for current user
    const offersRef = child(signalingRef, `offers/${currentUserId}`);
    addDebugMessage('Setting up offers listener');
    
    const offersUnsubscribe = onValue(offersRef, (snapshot) => {
      const offers = snapshot.val() || {};
      
      Object.entries(offers).forEach(([offerKey, offerData]: [string, any]) => {
        if (offerData && offerData.from && offerData.sdp) {
          addDebugMessage(`Received offer from: ${offerData.from.slice(0, 5)}...`);
          handleOffer(offerData.from, offerData.sdp);
          // Remove the processed offer
          remove(child(offersRef, offerKey)).catch(error => {
            console.error('Error removing processed offer:', error);
          });
        }
      });
    }, (error) => {
      addDebugMessage(`Error listening to offers: ${error.message}`);
      console.error('Error listening to offers:', error);
    });
    
    // Listen for answers meant for current user
    const answersRef = child(signalingRef, `answers/${currentUserId}`);
    addDebugMessage('Setting up answers listener');
    
    const answersUnsubscribe = onValue(answersRef, (snapshot) => {
      const answers = snapshot.val() || {};
      
      Object.entries(answers).forEach(([answerKey, answerData]: [string, any]) => {
        if (answerData && answerData.from && answerData.sdp) {
          addDebugMessage(`Received answer from: ${answerData.from.slice(0, 5)}...`);
          handleAnswer(answerData.from, answerData.sdp);
          // Remove the processed answer
          remove(child(answersRef, answerKey)).catch(error => {
            console.error('Error removing processed answer:', error);
          });
        }
      });
    }, (error) => {
      addDebugMessage(`Error listening to answers: ${error.message}`);
      console.error('Error listening to answers:', error);
    });
    
    // Listen for ICE candidates meant for current user
    const candidatesRef = child(signalingRef, `candidates/${currentUserId}`);
    addDebugMessage('Setting up ICE candidates listener');
    
    const candidatesUnsubscribe = onValue(candidatesRef, (snapshot) => {
      const candidates = snapshot.val() || {};
      
      Object.entries(candidates).forEach(([candidateKey, candidateData]: [string, any]) => {
        if (candidateData && candidateData.from && candidateData.candidate) {
          addDebugMessage(`Received ICE candidate from: ${candidateData.from.slice(0, 5)}...`);
          handleIceCandidate(candidateData.from, candidateData.candidate);
          // Remove the processed candidate
          remove(child(candidatesRef, candidateKey)).catch(error => {
            console.error('Error removing processed candidate:', error);
          });
        }
      });
    }, (error) => {
      addDebugMessage(`Error listening to ICE candidates: ${error.message}`);
      console.error('Error listening to ICE candidates:', error);
    });
    
    return () => {
      offersUnsubscribe();
      answersUnsubscribe();
      candidatesUnsubscribe();
    };
  }, [currentUserId]);

  // Initialize local media stream
  useEffect(() => {
    initializeLocalStream();
    return () => stopLocalStream();
  }, [isAudioOnly]);

  const initializeLocalStream = async () => {
    try {
      addDebugMessage('Requesting media devices...');
      const constraints = {
        video: isAudioOnly ? false : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      };

      addDebugMessage(`Media constraints: ${JSON.stringify(constraints)}`);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      addDebugMessage(`Got media stream with ${stream.getTracks().length} tracks`);
      if (localVideoRef.current) {
        addDebugMessage('Setting local video source');
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(err => {
          addDebugMessage(`Error playing local video: ${err.message}`);
          console.error('Error playing local video:', err);
        });
      }
      
      localStreamRef.current = stream;
      setParticipants(prev => [...prev, { id: 'local', name: userName, videoEnabled: !isAudioOnly }]);
      
      // Update track states based on initial settings
      stream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled;
        addDebugMessage(`Audio track enabled: ${track.enabled}`);
      });
      
      if (!isAudioOnly) {
        stream.getVideoTracks().forEach(track => {
          track.enabled = isVideoEnabled;
          addDebugMessage(`Video track enabled: ${track.enabled}`);
        });
      }

      // Notify other participants by creating peer connections
      Object.keys(peerConnections.current).forEach(participantId => {
        addDebugMessage(`Sending offer to existing participant: ${participantId.slice(0, 5)}...`);
        createAndSendOffer(participantId);
      });

      toast({
        title: isAudioOnly ? "Audio Ready" : "Camera Ready",
        description: isAudioOnly 
          ? "Your microphone is now active (audio-only mode)." 
          : "Your camera and microphone are now active.",
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      addDebugMessage(`Media access error: ${error.message}`);
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
      addDebugMessage('Stopped local media stream');
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    addDebugMessage('Closed all peer connections');
  };

  const createPeerConnection = (participantId: string) => {
    if (peerConnections.current[participantId]) {
      return peerConnections.current[participantId];
    }
    
    try {
      addDebugMessage(`Creating peer connection for ${participantId.slice(0, 5)}...`);
      const pc = new RTCPeerConnection(iceServers);
      
      // Add local stream tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          addDebugMessage(`Adding track to peer connection: ${track.kind}`);
          pc.addTrack(track, localStreamRef.current!);
        });
      } else {
        addDebugMessage('Warning: No local stream available to add tracks to peer connection');
      }
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addDebugMessage(`Generated ICE candidate for ${participantId.slice(0, 5)}...`);
          sendIceCandidate(participantId, event.candidate);
        }
      };

      pc.oniceconnectionstatechange = () => {
        addDebugMessage(`ICE connection state changed to: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          // Handle disconnected participant
          addDebugMessage(`Participant ${participantId.slice(0, 5)}... disconnected (${pc.iceConnectionState})`);
          setParticipants(prev => prev.filter(p => p.id !== participantId));
          pc.close();
          delete peerConnections.current[participantId];
        }
      };
      
      // Handle incoming streams
      pc.ontrack = (event) => {
        addDebugMessage(`Received track from ${participantId.slice(0, 5)}...: ${event.track.kind}`);
        
        // Get the participant's name from the database
        const participantRef = child(callSignalingRef.current, `participants/${participantId}`);
        get(participantRef).then(snapshot => {
          const participantData = snapshot.val() || {};
          const participantName = participantData.userName || 'Unknown';
          
          addDebugMessage(`Adding participant ${participantName} to video call`);
          
          setParticipants(prev => {
            const exists = prev.some(p => p.id === participantId);
            if (exists) {
              return prev.map(p => p.id === participantId 
                ? { ...p, stream: event.streams[0] } 
                : p
              );
            } else {
              return [...prev, { 
                id: participantId,
                name: participantName,
                stream: event.streams[0],
                videoEnabled: !isAudioOnly
              }];
            }
          });
        }).catch(error => {
          addDebugMessage(`Error getting participant data: ${error.message}`);
          console.error('Error getting participant data:', error);
        });
      };
      
      peerConnections.current[participantId] = pc;
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      addDebugMessage(`Error creating peer connection: ${error.message}`);
      toast({
        title: "Connection Error",
        description: "Failed to establish call connection. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const createAndSendOffer = async (participantId: string) => {
    const pc = peerConnections.current[participantId];
    if (!pc) {
      addDebugMessage(`Cannot create offer: No peer connection for ${participantId.slice(0, 5)}...`);
      return;
    }
    
    try {
      addDebugMessage(`Creating offer for ${participantId.slice(0, 5)}...`);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      if (offer.sdp) {
        addDebugMessage(`Sending offer to ${participantId.slice(0, 5)}...`);
        // Send the offer to the participant
        const offersRef = child(callSignalingRef.current, `signaling/offers/${participantId}`);
        push(offersRef, {
          from: currentUserId,
          sdp: offer.sdp
        }).catch(error => {
          addDebugMessage(`Error sending offer: ${error.message}`);
          console.error('Error sending offer:', error);
        });
      } else {
        addDebugMessage('Created offer has no SDP');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      addDebugMessage(`Error creating offer: ${error.message}`);
    }
  };

  const handleOffer = async (fromParticipantId: string, sdp: string) => {
    addDebugMessage(`Processing offer from ${fromParticipantId.slice(0, 5)}...`);
    const pc = createPeerConnection(fromParticipantId);
    if (!pc) {
      addDebugMessage(`Cannot handle offer: Failed to create peer connection for ${fromParticipantId.slice(0, 5)}...`);
      return;
    }
    
    try {
      addDebugMessage('Setting remote description from offer');
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
      
      addDebugMessage('Creating answer');
      const answer = await pc.createAnswer();
      
      addDebugMessage('Setting local description from answer');
      await pc.setLocalDescription(answer);
      
      if (answer.sdp) {
        addDebugMessage(`Sending answer to ${fromParticipantId.slice(0, 5)}...`);
        // Send the answer back to the participant
        const answersRef = child(callSignalingRef.current, `signaling/answers/${fromParticipantId}`);
        push(answersRef, {
          from: currentUserId,
          sdp: answer.sdp
        }).catch(error => {
          addDebugMessage(`Error sending answer: ${error.message}`);
          console.error('Error sending answer:', error);
        });
      } else {
        addDebugMessage('Created answer has no SDP');
      }
    } catch (error) {
      console.error('Error handling offer:', error);
      addDebugMessage(`Error handling offer: ${error.message}`);
    }
  };

  const handleAnswer = async (fromParticipantId: string, sdp: string) => {
    addDebugMessage(`Processing answer from ${fromParticipantId.slice(0, 5)}...`);
    const pc = peerConnections.current[fromParticipantId];
    if (!pc) {
      addDebugMessage(`Cannot handle answer: No peer connection for ${fromParticipantId.slice(0, 5)}...`);
      return;
    }
    
    try {
      addDebugMessage('Setting remote description from answer');
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
      addDebugMessage('Successfully set remote description from answer');
    } catch (error) {
      console.error('Error handling answer:', error);
      addDebugMessage(`Error handling answer: ${error.message}`);
    }
  };

  const sendIceCandidate = (toParticipantId: string, candidate: RTCIceCandidate) => {
    if (!callSignalingRef.current) {
      addDebugMessage('Cannot send ICE candidate: No call signaling reference');
      return;
    }
    
    addDebugMessage(`Sending ICE candidate to ${toParticipantId.slice(0, 5)}...`);
    const candidatesRef = child(callSignalingRef.current, `signaling/candidates/${toParticipantId}`);
    push(candidatesRef, {
      from: currentUserId,
      candidate: JSON.stringify(candidate)
    }).catch(error => {
      addDebugMessage(`Error sending ICE candidate: ${error.message}`);
      console.error('Error sending ICE candidate:', error);
    });
  };

  const handleIceCandidate = async (fromParticipantId: string, candidateJson: string) => {
    addDebugMessage(`Processing ICE candidate from ${fromParticipantId.slice(0, 5)}...`);
    const pc = peerConnections.current[fromParticipantId];
    if (!pc) {
      addDebugMessage(`Cannot handle ICE candidate: No peer connection for ${fromParticipantId.slice(0, 5)}...`);
      return;
    }
    
    try {
      const candidate = JSON.parse(candidateJson);
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      addDebugMessage('Successfully added ICE candidate');
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      addDebugMessage(`Error handling ICE candidate: ${error.message}`);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsAudioEnabled(track.enabled);
        addDebugMessage(`Audio ${track.enabled ? 'unmuted' : 'muted'}`);
      });
      
      toast({
        title: isAudioEnabled ? "Microphone Muted" : "Microphone Unmuted",
        description: isAudioEnabled 
          ? "Your microphone has been muted." 
          : "Your microphone has been unmuted.",
      });
    }
  };

  const toggleVideo = () => {
    if (isAudioOnly) return;
    
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoEnabled(track.enabled);
        addDebugMessage(`Video ${track.enabled ? 'enabled' : 'disabled'}`);
      });
      
      toast({
        title: isVideoEnabled ? "Camera Off" : "Camera On",
        description: isVideoEnabled 
          ? "Your camera has been turned off." 
          : "Your camera has been turned on.",
      });
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/groups/join/${groupId}`;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    addDebugMessage(`Copied invite link: ${inviteLink}`);
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
          <span>Group ID: {groupId} | Participants: {participants.length}</span>
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
          {!isAudioOnly && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {isAudioOnly && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-10 w-10 text-primary" />
                <span className="absolute bottom-2">Audio Only</span>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-sm">
            You (Host)
          </div>
        </div>

        {/* Remote participants */}
        {participants
          .filter(p => p.id !== 'local')
          .map(participant => (
            <div key={participant.id} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {participant.stream && !isAudioOnly && (
                <video
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  ref={el => {
                    if (el) el.srcObject = participant.stream;
                  }}
                />
              )}
              {(!participant.stream || isAudioOnly) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-10 w-10 text-primary" />
                    {isAudioOnly && (
                      <span className="absolute bottom-2">Audio Only</span>
                    )}
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-sm">
                {participant.name}
              </div>
            </div>
          ))}
      </div>

      {/* Debug info panel */}
      <div className="p-2 border-t border-b text-xs bg-secondary/10 max-h-32 overflow-auto">
        <details>
          <summary className="cursor-pointer">Debug Info (Click to expand)</summary>
          <pre className="whitespace-pre-wrap">{debugMessage}</pre>
        </details>
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
        
        {!isAudioOnly && (
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
        )}

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