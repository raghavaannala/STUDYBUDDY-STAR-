import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Users, Pencil, Trash2, MessageSquare, LogIn, Bot, Code, Video, Link, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import VideoCall from '@/components/video/VideoCall';
import { generateCode, optimizeCode, explainCode } from '@/services/codeDiploMate';
import * as groupService from '@/services/groupService';
import * as chatService from '@/services/chatService';
import { 
  getUserProfile,
  setUserOnlineStatus
} from '@/services/userService';

interface CallState {
  initiator: string;
  participants: string[];
  startTime: number;
  isAudioOnly: boolean;
}

interface RawGroup {
  id: string;
  privateId: string;
  name: string;
  description: string;
  interest: string;
  members: string[];
  createdAt: string | number;
  createdBy: string;
  activeCall?: {
    initiator: string;
    participants: string[];
    startTime: string | number;
    isAudioOnly: boolean;
  };
}

interface Group {
  id: string;
  privateId: string;
  name: string;
  description: string;
  interest: string;
  members: string[];
  createdAt: Date | number;
  createdBy: string;
  activeCall?: CallState;
}

// Local interfaces that extend the Group interface
interface GroupUI extends Group {
  privateId: string;
  interest: string;
  activeCall?: {
    initiator: string;
    participants: string[];
    startTime: number;
    isAudioOnly: boolean;
  };
}

const Groups = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [groups, setGroups] = useState<GroupUI[]>([]);
  const [newGroup, setNewGroup] = useState({ 
    name: '', 
    description: '', 
    interest: 'programming',
    members: [] as string[]
  });
  const [editingGroup, setEditingGroup] = useState<GroupUI | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupUI | null>(null);
  const [chatMessages, setChatMessages] = useState<chatService.ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreatePage = location.pathname === '/groups/create';
  const [showCodeDiploMate, setShowCodeDiploMate] = useState(false);
  const [codeQuestion, setCodeQuestion] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showMagicEffect, setShowMagicEffect] = useState(false);
  const [activeCallGroup, setActiveCallGroup] = useState<GroupUI | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access study groups.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }
    if (user) {
      fetchGroups();
    }
  }, [user, authLoading, navigate, toast]);

  const generatePrivateId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const fetchGroups = async () => {
    try {
      if (!user) return;
      const rtdbGroups = await groupService.getUserGroups(user.uid);
      
      // Convert RTDB groups to the format expected by the UI
      const convertedGroups = rtdbGroups.map(group => ({
        id: group.id,
        privateId: group.code, // Use code as privateId
        name: group.name,
        description: group.description,
        interest: group.tags?.[0] || 'programming',
        members: group.members,
        createdAt: group.createdAt, // Already a number from RTDB
        createdBy: group.createdBy,
        activeCall: group.activeCall ? {
          initiator: group.activeCall.initiatedBy,
          participants: group.activeCall.participants,
          startTime: group.activeCall.startedAt, // Already a number from RTDB
          isAudioOnly: group.activeCall.isAudioOnly
        } : undefined
      }));
      
      setGroups(convertedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch groups',
        variant: 'destructive',
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a group.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }
    
    console.log('Firebase user object:', user);
    console.log('Firebase user ID:', user.uid);
    
    if (!user.uid) {
      toast({
        title: "Authentication Error",
        description: "Your user ID is missing. Please sign out and sign in again.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate form fields
    if (!newGroup.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newGroup.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Group description is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Starting group creation with data:', {
        name: newGroup.name,
        description: newGroup.description,
        interest: newGroup.interest,
      });
      
      // Show loading toast
      toast({
        title: "Creating Group",
        description: "Please wait while your group is being created...",
      });
      
      // Create group using the RTDB service
      const group = await groupService.createGroup(
        newGroup.name,
        newGroup.description,
        true,
        [newGroup.interest]
      );
      
      console.log('Group created successfully:', group);

      toast({
        title: "Group Created!",
        description: `Your study group has been created successfully.`,
      });

      setNewGroup({ 
        name: '', 
        description: '', 
        interest: 'programming',
        members: []
      });
      
      // Store the join code from the RTDB group format
      setCreatedGroupId(group.code);
      setShowSuccessDialog(true);
      
      await fetchGroups();
    } catch (error) {
      console.error('Error in handleCreate:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create group";
      toast({
        title: "Error Creating Group",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!joinCode || joinCode.length < 4) {
      setJoinError('Please enter a valid code (at least 4 characters)');
      return;
    }
    
    setJoinLoading(true);
    setJoinError('');

    try {
      // Log the code being used
      console.log(`[Groups] Joining group with code: "${joinCode.trim()}"`);
      
      // Call the service with the trimmed code
      const result = await groupService.joinGroupByCode(joinCode.trim());
      
      // Check if we got a result back
      if (!result) {
        console.error('[Groups] No group found with code:', joinCode.trim());
        setJoinError('Group not found. Please verify the code and try again.');
        setJoinLoading(false);
        return;
      }
      
      // Extract the group ID from the returned group object
      const groupId = result.id;
      console.log('[Groups] Successfully joined group with ID:', groupId);
      
      // Handle successful join
      setJoinSuccess(true);
      
      // Reset and close dialog after 1.5 seconds
      setTimeout(() => {
        setShowJoinDialog(false);
        setJoinCode('');
        setJoinSuccess(false);
        setJoinLoading(false);
        
        // Instead of navigating to a non-existent URL, show the chat dialog
        const joinedGroup = result;
        // Convert to UI format for display
        const uiGroup: GroupUI = {
          id: joinedGroup.id,
          privateId: joinedGroup.code,
          name: joinedGroup.name,
          description: joinedGroup.description,
          interest: joinedGroup.tags?.[0] || 'programming',
          members: joinedGroup.members,
          createdAt: joinedGroup.createdAt,
          createdBy: joinedGroup.createdBy,
          activeCall: joinedGroup.activeCall ? {
            initiator: joinedGroup.activeCall.initiatedBy,
            participants: joinedGroup.activeCall.participants,
            startTime: joinedGroup.activeCall.startedAt,
            isAudioOnly: joinedGroup.activeCall.isAudioOnly
          } : undefined
        };
        
        // Set the selected group to show the chat dialog
        setSelectedGroup(uiGroup);
        
        // Load chat messages for this group
        loadChatMessages(joinedGroup.id);
        
        // Refresh groups list in the background
        fetchGroups();
      }, 1500);
    } catch (error) {
      console.error('[Groups] Error joining group:', error);
      
      // Provide more detailed error message
      let errorMessage = 'Failed to join group. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific Firebase error codes
        if (error.message.includes('permission-denied')) {
          errorMessage = 'You do not have permission to join this group.';
        } else if (error.message.includes('not-found')) {
          errorMessage = 'Group not found with this code.';
        }
      }
      
      setJoinError(errorMessage);
      setJoinLoading(false);
    }
  };

  const handleCodeDiploMateHelp = async () => {
    if (!codeQuestion.trim()) return;
    
    setShowMagicEffect(true);
    setShowCodeDiploMate(false); // Close the dialog immediately
    
    // Create a temporary loading message that shows up immediately
    const tempLoadingMsg: chatService.ChatMessage = {
      id: `temp-loading-${Date.now()}`,
      groupId: selectedGroup?.id || '',
      userId: 'bot',
      content: "✨ Casting a spell to generate your code... ✨",
      isBot: true,
      userName: 'CodeDiploMate',
      timestamp: Date.now()
    };
    
    // Add temp message directly to UI
    setChatMessages(prev => [...prev, tempLoadingMsg]);
    
    // Now send the loading message to Firestore
    const loadingMessage = await chatService.sendMessage({
      groupId: selectedGroup?.id || '',
      userId: 'bot',
      content: "✨ Casting a spell to generate your code... ✨",
      isBot: true,
      userName: 'CodeDiploMate'
    });

    try {
      // Generate code using CodeDiploMate service
      const result = await generateCode(codeQuestion);
      
      if (!result || !result.code) {
        throw new Error('Failed to generate code response');
      }

      // Format the code response
      let responseContent = `🎯 Here's what I conjured up for your question: "${codeQuestion}"\n\n`;
      responseContent += `\`\`\`javascript\n${result.code}\n\`\`\`\n\n`;
      
      if (result.complexity) {
        responseContent += `⚡ Time Complexity: ${result.complexity.timeComplexity}\n`;
        responseContent += `🔮 Space Complexity: ${result.complexity.spaceComplexity}\n\n`;
        responseContent += `This means the code's performance will scale as follows:\n`;
        result.complexity.operations.forEach(op => {
          responseContent += `- For input size ${op.n}: ~${op.time} operations\n`;
        });
      }

      // Create temp messages for immediate display
      const tempResponseMsg: chatService.ChatMessage = {
        id: `temp-response-${Date.now()}`,
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: responseContent,
        isBot: true,
        userName: 'CodeDiploMate',
        timestamp: Date.now()
      };
      
      const tempFollowupMsg: chatService.ChatMessage = {
        id: `temp-followup-${Date.now()}`,
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: "✨ Would you like me to optimize this code or explain it in more detail? Just type 'optimize' or 'explain' to get more help! ✨",
        isBot: true,
        userName: 'CodeDiploMate',
        timestamp: Date.now()
      };
      
      // Add both messages to UI immediately
      setChatMessages(prev => [...prev.filter(m => m.id !== tempLoadingMsg.id), tempResponseMsg, tempFollowupMsg]);
      
      // Send to Firestore in parallel
      await Promise.all([
        // Main response
        chatService.sendMessage({
          groupId: selectedGroup?.id || '',
          userId: 'bot',
          content: responseContent,
          isBot: true,
          userName: 'CodeDiploMate'
        }),
        
        // Optimization suggestion
        chatService.sendMessage({
          groupId: selectedGroup?.id || '',
          userId: 'bot',
          content: "✨ Would you like me to optimize this code or explain it in more detail? Just type 'optimize' or 'explain' to get more help! ✨",
          isBot: true,
          userName: 'CodeDiploMate'
        })
      ]);
      
      setShowMagicEffect(false);

    } catch (error) {
      console.error('Error generating code:', error);
      
      // Create temp error message for immediate display
      const tempErrorMsg: chatService.ChatMessage = {
        id: `temp-error-${Date.now()}`,
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: "🔮 My crystal ball seems a bit cloudy. Please try again later or rephrase your question.",
        isBot: true,
        userName: 'CodeDiploMate',
        timestamp: Date.now()
      };
      
      // Update UI immediately
      setChatMessages(prev => [...prev.filter(m => m.id !== tempLoadingMsg.id), tempErrorMsg]);
      
      // Send to Firestore
      await chatService.sendMessage({
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: "🔮 My crystal ball seems a bit cloudy. Please try again later or rephrase your question.",
        isBot: true,
        userName: 'CodeDiploMate'
      });
      
      setShowMagicEffect(false);
    }

    setCodeQuestion('');
  };

  const handleOptimizeCode = async (code: string) => {
    try {
      const optimizedCode = await optimizeCode(code);
      
      await chatService.sendMessage({
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: `Here's the optimized version:\n\n\`\`\`javascript\n${optimizedCode}\n\`\`\``,
        isBot: true,
        userName: 'CodeDiploMate'
      });
    } catch (error) {
      console.error('Error optimizing code:', error);
    }
  };

  const handleExplainCode = async (code: string) => {
    try {
      const explanation = await explainCode(code);
      
      await chatService.sendMessage({
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: `Here's a detailed explanation:\n\n${explanation}`,
        isBot: true,
        userName: 'CodeDiploMate'
      });
    } catch (error) {
      console.error('Error explaining code:', error);
    }
  };

  const handleSendMessage = async (groupId: string) => {
    if (!newMessage.trim() && !codeQuestion.trim()) return;
    
    if (codeQuestion.trim()) {
      await handleCodeDiploMateHelp();
      return;
    }
    
    const input = newMessage.trim();
    setNewMessage('');
    
    // Handle optimize command
    if (input.toLowerCase() === 'optimize') {
      const lastBotMessage = chatMessages
        .filter(m => m.isBot && m.content.includes('```javascript'))
        .pop();
        
      if (lastBotMessage) {
        const codeMatch = lastBotMessage.content.match(/```javascript\n([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          await handleOptimizeCode(codeMatch[1]);
        }
      }
      return;
    }
    
    // Handle explain command
    if (input.toLowerCase() === 'explain') {
      const lastBotMessage = chatMessages
        .filter(m => m.isBot && m.content.includes('```javascript'))
        .pop();
        
      if (lastBotMessage) {
        const codeMatch = lastBotMessage.content.match(/```javascript\n([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          await handleExplainCode(codeMatch[1]);
        }
      }
      return;
    }
    
    try {
      // Create a temporary message with a local ID to display immediately
      const tempMessage: chatService.ChatMessage = {
        id: `temp-${Date.now()}`,
        groupId,
        userId: user.uid,
        content: input,
        timestamp: Date.now(),
        userName: user.displayName || 'User'
      };
      
      // Add temporary message to the UI immediately
      setChatMessages(prev => [...prev, tempMessage]);
      
      // Scroll to bottom immediately
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
      
      // Actually send the message to Firebase
      await chatService.sendMessage({
        groupId,
        userId: user.uid,
        content: input,
        userName: user.displayName || 'User'
      });
      
      // The real message will be added via the subscription
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const loadChatMessages = async (groupId: string) => {
    try {
      const messages = await chatService.getRecentMessages(groupId);
      setChatMessages(messages);
      
      // Scroll to bottom
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  useEffect(() => {
    if (!selectedGroup) return;
    
    // Subscribe to chat messages
    const unsubscribe = chatService.subscribeToGroupMessages(
      selectedGroup.id,
      (messages) => {
        setChatMessages(messages);
        
        // Remove setTimeout to make messages appear instantly
        // Scroll to bottom immediately when new messages arrive
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }
    );
    
    // Cleanup subscription on unmount or when selected group changes
    return () => {
      unsubscribe();
    };
  }, [selectedGroup]);

  // Ensure chat scrolls when new messages arrive, especially for CodeDiploMate
  useEffect(() => {
    // Check if any of the last 3 messages are from CodeDiploMate
    const hasRecentBotMessage = chatMessages
      .slice(-3)
      .some(message => message.isBot);
      
    if (hasRecentBotMessage && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    
    try {
      // Show updating toast
      toast({
        title: "Updating Group",
        description: "Please wait while your group is being updated...",
      });
      
      // Update group in Firestore
      await groupService.deleteGroup(editingGroup.id);
      
      toast({
        title: "Group Updated",
        description: "Your study group has been updated successfully.",
      });
      
      setEditingGroup(null);
      await fetchGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update group";
      toast({
        title: "Error Updating Group",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Show confirmation toast
      toast({
        title: "Deleting Group",
        description: "Please wait while your group is being deleted...",
      });
      
      // Delete group from Firestore
      await groupService.deleteGroup(id);
      
      toast({
        title: "Group Deleted",
        description: "Your study group has been deleted successfully.",
      });
      
      // Refresh groups
      await fetchGroups();
      
      // If the deleted group was selected, clear the selection
      if (selectedGroup?.id === id) {
        setSelectedGroup(null);
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete group";
      toast({
        title: "Error Deleting Group",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleClearChat = async () => {
    if (!selectedGroup) return;
    
    try {
      await chatService.sendMessage({
        groupId: selectedGroup.id,
        userId: 'system',
        content: 'Clearing chat...',
        isBot: true,
        userName: 'System'
      });
      setChatMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const startGroupCall = async (group: GroupUI) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a call.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    try {
      // Start call using RTDB implementation - isAudioOnly is a boolean
      const isAudioOnly = false;
      const success = await groupService.startGroupCall(group.id, isAudioOnly);
      
      if (!success) {
        throw new Error("Failed to start call");
      }
      
      // Re-fetch the group to get the updated activeCall data
      const updatedGroup = await groupService.getGroupById(group.id);
      
      if (!updatedGroup) {
        throw new Error("Group not found after starting call");
      }
      
      // Convert to UI format
      const convertedGroup = {
        ...group,
        activeCall: updatedGroup.activeCall ? {
          initiator: updatedGroup.activeCall.initiatedBy,
          participants: updatedGroup.activeCall.participants,
          startTime: updatedGroup.activeCall.startedAt, // Already a number from RTDB
          isAudioOnly: updatedGroup.activeCall.isAudioOnly
        } : undefined
      };
      
      setActiveCallGroup(convertedGroup);
      setShowVideoCall(true);
      
      // Add notification in chat that a call has started
      await chatService.sendMessage({
        groupId: group.id,
        userId: 'system',
        content: `📞 ${user.displayName || 'A user'} started a video call`,
        isBot: true,
        userName: 'System'
      });
      
      toast({
        title: "Call Started",
        description: "Video call has been initiated.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start call";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const endGroupCall = async (group: GroupUI) => {
    try {
      // End call using RTDB implementation
      const success = await groupService.endGroupCall(group.id);
      
      if (!success) {
        throw new Error("Failed to end call");
      }
      
      setActiveCallGroup(null);
      setShowVideoCall(false);
      
      // Add notification in chat that the call has ended
      await chatService.sendMessage({
        groupId: group.id,
        userId: 'system',
        content: `🔴 ${user?.displayName || 'A user'} ended the call`,
        isBot: true,
        userName: 'System'
      });
      
      toast({
        title: "Call Ended",
        description: "Video call has been ended.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to end call";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const inviteToCall = async (group: GroupUI, memberId: string) => {
    if (!group.activeCall) return;
    
    try {
      // Check if member is already in the call
      if (group.activeCall.participants.includes(memberId)) {
        toast({
          title: "Member Already in Call",
          description: "This member is already participating in the call.",
        });
        return;
      }
      
      // Get the member's name from the list of group members (would need to fetch from your user service)
      const memberName = "Teammate"; // Placeholder - you'd need to get the actual name
      
      // Add invitation message in chat
      await chatService.sendMessage({
        groupId: group.id,
        userId: 'system',
        content: `🔔 ${user?.displayName || 'A user'} invited ${memberName} to join the call`,
        isBot: true,
        userName: 'System'
      });
      
      // Notification is sent, but we don't actually need to update the call in RTDB
      // The invited user will join themselves when they accept
      
      toast({
        title: "Invitation Sent",
        description: `Invited ${memberName} to the call.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to invite member";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const toggleAudioOnly = async (group: GroupUI) => {
    if (!group.activeCall) return;
    
    try {
      // Toggle audio-only mode using RTDB implementation
      // Get the current state and invert it
      const isAudioOnly = !group.activeCall.isAudioOnly;
      
      // Update the call with the new isAudioOnly value
      const success = await groupService.startGroupCall(group.id, isAudioOnly);
      
      if (!success) {
        throw new Error("Failed to change call mode");
      }
      
      // Add notification in chat about mode change
      await chatService.sendMessage({
        groupId: group.id,
        userId: 'system',
        content: `🎛️ ${user?.displayName || 'A user'} switched to ${isAudioOnly ? 'audio-only' : 'video'} mode`,
        isBot: true,
        userName: 'System'
      });
      
      toast({
        title: isAudioOnly ? "Audio Only Mode" : "Video Mode",
        description: `Switched to ${isAudioOnly ? 'audio-only' : 'video and audio'} mode.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change call mode";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const joinGroupFromUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      const groupId = params.get('join');
      
      if (groupId && user) {
        try {
          const savedGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]');
          const groupToJoin = savedGroups.find((g: RawGroup) => g.privateId === groupId);
          
          if (groupToJoin) {
            if (!groupToJoin.members.includes(user.uid)) {
              handleJoinGroup({ preventDefault: () => {} } as FormEvent);
            } else {
              // If already a member, just open the chat
              const group = {
                ...groupToJoin,
                createdAt: groupToJoin.createdAt,
                activeCall: groupToJoin.activeCall ? {
                  ...groupToJoin.activeCall,
                  startTime: groupToJoin.activeCall.startTime
                } : undefined
              };
              setSelectedGroup(group);
              loadChatMessages(group.id);
            }
            
            // Clean up the URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        } catch (error) {
          console.error('Error joining group from URL:', error);
          toast({
            title: "Error",
            description: "Failed to join group. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    joinGroupFromUrl();
  }, [user]);

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Join code copied to clipboard.",
    });
  };

  // Memoize the chat messages to prevent unnecessary re-renders
  const memoizedChatMessages = React.useMemo(() => {
    // Remove duplicate messages but keep bot messages even if they appear similar
    const uniqueMessages = chatMessages.filter((message, index, self) => 
      // Always keep messages from bots
      message.isBot ||
      // For user messages, filter duplicates
      index === self.findIndex(m => 
        m.content === message.content && 
        m.userId === message.userId &&
        Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000
      )
    );
    
    return uniqueMessages.map((message) => (
      <div
        key={message.id}
        className={`flex ${
          message.userId === user?.uid ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`max-w-[70%] rounded-lg p-3 ${
            message.isBot
              ? 'bg-purple-500/10 border border-purple-500/20'
              : message.userId === user?.uid
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {message.isBot && <Bot className="h-4 w-4 text-purple-500" />}
            <span className="text-xs font-medium">
              {message.userName || 'Anonymous'}
            </span>
          </div>
          <p className="text-sm">{message.content}</p>
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Just now'}
          </p>
        </div>
      </div>
    ));
  }, [chatMessages, user?.uid]);

  // Header section
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full mb-6 gap-4">
      <div className="mb-4 md:mb-0">
        <h1 className="text-2xl font-bold">Study Groups</h1>
        <p className="text-muted-foreground">
          Join or create study groups to collaborate with others
        </p>
      </div>
      
      {!isCreatePage && (
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowJoinDialog(true)}
            className="flex items-center gap-1 flex-1 md:flex-auto"
          >
            <LogIn className="h-4 w-4 mr-1" />
            Join Group
          </Button>
          <Button 
            onClick={() => navigate('/groups/create')}
            className="flex items-center gap-1 flex-1 md:flex-auto"
          >
            <Users className="h-4 w-4 mr-1" />
            Create Group
          </Button>
        </div>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex flex-col items-center justify-center py-12">
          <Card className="p-8 text-center max-w-md w-full">
            <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-6">
              Please sign in to access study groups and collaborate with others.
            </p>
            <Button 
              onClick={() => navigate('/signin')}
              className="w-full"
            >
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-20 max-w-4xl">
      {renderHeader()}
      
      {isCreatePage ? (
        <Card className="p-6 mb-8">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  placeholder="Enter group name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interest">Interest Area</Label>
                <select
                  id="interest"
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={newGroup.interest}
                  onChange={(e) => setNewGroup({ ...newGroup, interest: e.target.value })}
                  required
                >
                  <option value="programming">Programming</option>
                  <option value="math">Mathematics</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Describe your study group"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Create Group
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/groups')}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Card className="p-8 text-center max-w-md w-full">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Study Groups Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first study group or join an existing one to start learning together.
                </p>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigate('/groups/create')}
                    className="w-full"
                  >
                    Create New Group
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowJoinDialog(true)}
                    className="w-full"
                  >
                    Join Existing Group
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {groups.slice(0, Math.ceil(groups.length / 2)).map((group) => (
                  <Card key={group.id} className="p-4">
                    {editingGroup?.id === group.id ? (
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <Input
                          value={editingGroup.name}
                          onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                          className="mb-2"
                        />
                        <Input
                          value={editingGroup.description}
                          onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" variant="default">Save</Button>
                          <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                        <p className="text-muted-foreground mb-4">{group.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1">
                              {group.members.length} members
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: {group.privateId}
                            </span>
                            {group.activeCall && (
                              <span className="text-xs bg-red-500/10 text-red-500 rounded-full px-2 py-1 flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Live Call
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedGroup(group);
                                loadChatMessages(group.id);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            {group.activeCall ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => endGroupCall(group)}
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Leave Call
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  if (!user) return;
                                  startGroupCall(group);
                                }}
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Start Call
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingGroup(group)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(group.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
                
                {/* Create Group Card */}
                <Card className="p-4 flex flex-col items-center justify-center border-dashed border-2 hover:border-primary/50 transition-colors">
                  <Users className="w-12 h-12 mb-4 text-primary/50" />
                  <h3 className="text-lg font-semibold mb-2">Create New Group</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Start a new study group to collaborate with others
                  </p>
                  <Button onClick={() => navigate('/groups/create')}>
                    <Users className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </Card>
                
                {groups.slice(Math.ceil(groups.length / 2)).map((group) => (
                  <Card key={group.id} className="p-4">
                    {editingGroup?.id === group.id ? (
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <Input
                          value={editingGroup.name}
                          onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                          className="mb-2"
                        />
                        <Input
                          value={editingGroup.description}
                          onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" variant="default">Save</Button>
                          <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                        <p className="text-muted-foreground mb-4">{group.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1">
                              {group.members.length} members
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: {group.privateId}
                            </span>
                            {group.activeCall && (
                              <span className="text-xs bg-red-500/10 text-red-500 rounded-full px-2 py-1 flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Live Call
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedGroup(group);
                                loadChatMessages(group.id);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                            {group.activeCall ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => endGroupCall(group)}
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Leave Call
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  if (!user) return;
                                  startGroupCall(group);
                                }}
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Start Call
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingGroup(group)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(group.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Join Group Dialog */}
      {showJoinDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Join Study Group</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowJoinDialog(false);
                  setJoinCode('');
                  setJoinError('');
                  setJoinSuccess(false);
                }}
                disabled={joinLoading}
              >
                ✕
              </Button>
            </div>
            
            {joinSuccess ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mb-4">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Successfully Joined!</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Redirecting to your new study group...
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the 6-character code your friend shared with you to join their study group.
                </p>
                
                {joinError && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Failed to join group</h3>
                        <div className="mt-1 text-sm text-red-700 dark:text-red-400">
                          <p>{joinError}</p>
                        </div>
                        <div className="mt-2 text-xs text-red-700/70 dark:text-red-400/70">
                          <p>Suggestions:</p>
                          <ul className="list-disc list-inside mt-1">
                            <li>Check that the code is exactly as it was shared with you</li>
                            <li>Make sure the group still exists</li>
                            <li>Try asking the group creator to share the code again</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinCode">Group Code</Label>
                    <div className="relative">
                      <Input
                        id="joinCode"
                        placeholder="Enter 6-character code (e.g., AB12CD)"
                        value={joinCode}
                        onChange={(e) => {
                          setJoinCode(e.target.value.toUpperCase());
                          setJoinError('');
                        }}
                        className="pr-10 tracking-widest font-mono text-center text-lg uppercase"
                        maxLength={6}
                        autoFocus
                        required
                        disabled={joinLoading}
                      />
                      {joinCode && !joinLoading && (
                        <button 
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setJoinCode('')}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowJoinDialog(false);
                        setJoinCode('');
                        setJoinError('');
                      }}
                      disabled={joinLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={joinCode.length < 4 || joinLoading}
                    >
                      {joinLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join Group'
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    Don't have a code? Ask your friend to share the group join code with you.
                  </div>
                </form>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Chat Dialog */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="p-6 max-w-2xl w-full h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{selectedGroup.name} Chat</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCodeDiploMate(true)}
                  className="flex items-center gap-1"
                >
                  <Bot className="h-4 w-4" />
                  CodeDiploMate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!user) return;
                    startGroupCall(selectedGroup);
                  }}
                  className="flex items-center gap-1"
                >
                  <Video className="h-4 w-4" />
                  Start Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearChat}
                  className="flex items-center gap-1 ml-2"
                >
                  Clear Chat
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedGroup(null)}>
                Close
              </Button>
            </div>
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto mb-4 space-y-4 relative"
            >
              {showMagicEffect && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-purple-900/10 backdrop-blur-[2px]"></div>
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="magic-particle"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                        }}
                      >
                        {['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)]}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {memoizedChatMessages}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(selectedGroup.id)}
              />
              <Button onClick={() => handleSendMessage(selectedGroup.id)}>
                Send
              </Button>
            </div>
          </Card>

          {/* CodeDiploMate Dialog */}
          {showCodeDiploMate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="p-6 max-w-md w-full">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="h-6 w-6 text-purple-500" />
                  <h3 className="text-lg font-semibold">CodeDiploMate Assistant</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Ask me anything about programming, and I'll help you and your group!
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="codeQuestion">Your Question</Label>
                    <Input
                      id="codeQuestion"
                      placeholder="What would you like to know about programming?"
                      value={codeQuestion}
                      onChange={(e) => setCodeQuestion(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCodeDiploMateHelp}
                      className="flex-1"
                      disabled={!codeQuestion.trim()}
                    >
                      Get Help
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCodeDiploMate(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Video Call Dialog */}
          {showVideoCall && selectedGroup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="absolute top-4 right-4 bg-background p-4 rounded-lg shadow-lg z-10 w-64">
                <h3 className="text-lg font-semibold mb-2">Call Controls</h3>
                
                {/* Audio-only toggle */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleAudioOnly(selectedGroup)}
                  className="w-full mb-2 justify-start"
                >
                  {selectedGroup.activeCall?.isAudioOnly ? 
                    <span className="flex items-center">
                      <Video className="h-4 w-4 mr-2 line-through" /> 
                      Enable Video
                    </span> : 
                    <span className="flex items-center">
                      <Video className="h-4 w-4 mr-2" /> 
                      Switch to Audio-only
                    </span>
                  }
                </Button>
                
                {/* Invite members section */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Invite Members</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedGroup.members
                      .filter(memberId => 
                        selectedGroup.activeCall && 
                        !selectedGroup.activeCall.participants.includes(memberId) &&
                        memberId !== user?.uid
                      )
                      .map(memberId => (
                        <Button
                          key={memberId}
                          variant="ghost"
                          size="sm"
                          onClick={() => inviteToCall(selectedGroup, memberId)}
                          className="w-full justify-between"
                        >
                          <span className="truncate">User {memberId.substring(0, 4)}...</span>
                          <Users className="h-4 w-4 ml-2" />
                        </Button>
                      ))}
                      
                    {selectedGroup.members.filter(id => 
                      id !== user?.uid && 
                      selectedGroup.activeCall && 
                      !selectedGroup.activeCall.participants.includes(id)
                    ).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center">
                        No other members to invite
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Participants section */}
                {selectedGroup.activeCall && selectedGroup.activeCall.participants.length > 1 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Participants</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedGroup.activeCall.participants
                        .filter(id => id !== user?.uid)
                        .map(pId => (
                          <div key={pId} className="text-xs flex items-center bg-muted p-2 rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span>User {pId.substring(0, 4)}...</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* End call button */}
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => endGroupCall(selectedGroup)}
                  className="w-full mt-4"
                >
                  End Call
                </Button>
              </div>
              
              <VideoCall
                groupId={selectedGroup.id}
                userName={user?.displayName || 'Anonymous'}
                onClose={() => endGroupCall(selectedGroup)}
                isAudioOnly={selectedGroup.activeCall?.isAudioOnly || false}
              />
            </div>
          )}
        </div>
      )}

      {activeCallGroup && user && (
        <VideoCall
          groupId={activeCallGroup.id}
          userName={user.displayName || 'Anonymous'}
          onClose={() => endGroupCall(activeCallGroup)}
          isAudioOnly={activeCallGroup.activeCall?.isAudioOnly || false}
        />
      )}

      {/* Success Dialog after creating a group */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Group Created Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                Share this code with friends to invite them to your group.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="bg-muted p-3 rounded-lg text-center font-mono text-lg tracking-widest">
                {createdGroupId || 'CODE MISSING'}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyJoinCode(createdGroupId)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-12a2 2 0 00-2-2h-2M8 5a2 2 0 012-2h4a2 2 0 012 2M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2h-4a2 2 0 01-2-2v0z" />
                </svg>
              </Button>
            </div>
            
            <div className="flex justify-between gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowSuccessDialog(false);
                  if (isCreatePage) {
                    navigate('/groups');
                  }
                }}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowSuccessDialog(false);
                  if (isCreatePage) {
                    navigate('/groups');
                  }
                  // Get the newly created group and open its chat
                  const newGroup = groups.find(g => g.privateId === createdGroupId);
                  if (newGroup) {
                    setSelectedGroup(newGroup);
                    loadChatMessages(newGroup.id);
                  }
                }}
              >
                Open Group Chat
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Groups; 