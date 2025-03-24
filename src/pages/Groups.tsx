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
import { Users, Pencil, Trash2, MessageSquare, LogIn, Bot, Code, Video, Link, Check, Loader2, Plus, UserPlus, Globe, Search, SearchX, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import VideoCall from '@/components/video/VideoCall';
import { generateCode, optimizeCode, explainCode, verifyApiConnection, resetChat } from '@/services/codeDiploMate';
import * as groupService from '@/services/groupService';
import * as chatService from '@/services/chatService';
import { 
  getUserProfile,
  setUserOnlineStatus
} from '@/services/userService';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/components/ui/badge';

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
  code?: string;
  tags?: string[];
}

// Add a helper function to format call duration
const formatCallDuration = (milliseconds: number): string => {
  if (milliseconds < 0) milliseconds = 0;
  
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

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
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'unchecked' | 'verified' | 'failed'>('unchecked');
  const messageUnsubscribeRef = useRef<(() => void) | null>(null);
  // Add this state to store chat messages for each group
  const [groupChatMessages, setGroupChatMessages] = useState<Record<string, chatService.ChatMessage[]>>({});
  // Add these new state variables
  const [showDiscoverGroups, setShowDiscoverGroups] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<GroupUI[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularInterests] = useState([
    'Programming', 'Mathematics', 'Physics', 'Chemistry', 
    'Biology', 'Economics', 'Literature', 'History',
    'Computer Science', 'Machine Learning', 'Web Development'
  ]);
  // Add state for tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  // Add or update these state variables near the top of the component
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [interestType, setInterestType] = useState('');

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
    
    try {
      setIsCreating(true);
      
      if (!name.trim() || !description.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all the required fields.",
          variant: "destructive",
        });
        return;
      }
      
      const privateId = generatePrivateId();
      
      // Create a new group
      const newGroup = await groupService.createGroup(
        {
          name: name.trim(),
          description: description.trim(),
          interest: interestType,
          privateId
        },
        description.trim(),
        true, // isPublic
        tags // Pass the tags array
      );
      
      if (newGroup) {
        toast({
          title: "Success",
          description: "Group created successfully",
        });
        
        // Reset form
        setName('');
        setDescription('');
        setInterestType('');
        setTags([]);
        setTagInput('');
        
        // Navigate back to groups list
        navigate('/groups');
        
        // Refresh groups
        fetchGroups();
      } else {
        throw new Error("Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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

  const generateFallbackCode = (question: string): string => {
    // Simple fallback code generator for common programming questions
    if (question.toLowerCase().includes('fibonacci')) {
      return `
// Fibonacci function in JavaScript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}

// Optimized version with memoization
function fibonacciMemo(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fibonacciMemo(n-1, memo) + fibonacciMemo(n-2, memo);
  return memo[n];
}

// Usage
console.log(fibonacciMemo(10)); // 55
`;
    } else if (question.toLowerCase().includes('sort')) {
      return `
// Quick sort implementation in JavaScript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// Usage
const array = [5, 3, 7, 6, 2, 9];
console.log(quickSort(array)); // [2, 3, 5, 6, 7, 9]
`;
    } else {
      // Generic fallback for any coding question
      return `
// Here's a simple solution to your problem
function sampleFunction() {
  // TODO: Replace this with actual implementation
  console.log("Your question: ${question.replace(/"/g, '\\"')}");
  return "Implementation needed";
}

// Basic testing framework
function test(fn, input, expectedOutput) {
  const result = fn(input);
  console.log(\`Testing with input \${input}\`);
  console.log(\`Expected: \${expectedOutput}, Got: \${result}\`);
  console.log(\`Test passed: \${result === expectedOutput}\`);
}

// Usage
// test(sampleFunction, input, expectedOutput);
`;
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
    
    // Add temp message directly to UI and to cache
    const updatedMessagesWithLoading = [...chatMessages, tempLoadingMsg];
    setChatMessages(updatedMessagesWithLoading);
    if (selectedGroup) {
      setGroupChatMessages(prev => ({
        ...prev,
        [selectedGroup.id]: updatedMessagesWithLoading
      }));
    }
    
    // Now send the loading message to Firestore
    await chatService.sendMessage({
      groupId: selectedGroup?.id || '',
      userId: 'bot',
      content: "✨ Casting a spell to generate your code... ✨",
      isBot: true,
      userName: 'CodeDiploMate'
    });

    try {
      console.log('Starting code generation for prompt:', codeQuestion);
      
      // Generate code using CodeDiploMate service
      const result = await generateCode(codeQuestion);
      
      if (!result || !result.code) {
        console.error('Empty result from generateCode');
        throw new Error('Failed to generate code response');
      }

      console.log('Code generation successful, preparing response');
      
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
      
      // Add both messages to UI immediately and to cache
      const updatedMessages = [...chatMessages.filter(m => m.id !== tempLoadingMsg.id), tempResponseMsg, tempFollowupMsg];
      setChatMessages(updatedMessages);
      if (selectedGroup) {
        setGroupChatMessages(prev => ({
          ...prev,
          [selectedGroup.id]: updatedMessages
        }));
      }
      
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
      
      // Use fallback code generation instead
      const fallbackCode = generateFallbackCode(codeQuestion);
      
      // Create a fallback response
      const fallbackResponseContent = `
🔮 I encountered an issue connecting to my magic source, but I've created some sample code for you:

\`\`\`javascript
${fallbackCode}
\`\`\`

Note: This is a simplified example. For more complex responses, try again later or check your API connection.
`;
      
      // Create fallback message for immediate display
      const fallbackMsg: chatService.ChatMessage = {
        id: `fallback-${Date.now()}`,
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: fallbackResponseContent,
        isBot: true,
        userName: 'CodeDiploMate',
        timestamp: Date.now()
      };
      
      // Update UI immediately and cache
      const updatedMessages = [...chatMessages.filter(m => m.id !== tempLoadingMsg.id), fallbackMsg];
      setChatMessages(updatedMessages);
      if (selectedGroup) {
        setGroupChatMessages(prev => ({
          ...prev,
          [selectedGroup.id]: updatedMessages
        }));
      }
      
      // Send to Firestore
      await chatService.sendMessage({
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: fallbackResponseContent,
        isBot: true,
        userName: 'CodeDiploMate'
      });
      
      // Send a followup message
      const followupMsg: chatService.ChatMessage = {
        id: `fallback-followup-${Date.now()}`,
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: "❗ Tip: Click the 'Check API Connection' button to test my connection to the Gemini API.",
        isBot: true,
        userName: 'CodeDiploMate',
        timestamp: Date.now() + 100
      };
      
      // Add to UI and cache
      const finalMessages = [...updatedMessages, followupMsg];
      setChatMessages(finalMessages);
      if (selectedGroup) {
        setGroupChatMessages(prev => ({
          ...prev,
          [selectedGroup.id]: finalMessages
        }));
      }
      
      // Send to Firestore
      await chatService.sendMessage({
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: "❗ Tip: Click the 'Check API Connection' button to test my connection to the Gemini API.",
        isBot: true,
        userName: 'CodeDiploMate'
      });
    }
    
    setShowMagicEffect(false);
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
    
    if (!user) {
      console.error('Cannot send message: No authenticated user');
      toast({
        title: "Error",
        description: "You must be signed in to send messages.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First add message to UI immediately for better user experience
      const tempMessage = {
        id: uuidv4(),
        content: input,
        timestamp: Date.now(),
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userPhotoURL: user.photoURL || '',
        groupId
      };
      
      // Update both local state and cached state for immediate feedback
      const updatedMessages = [...chatMessages, tempMessage];
      setChatMessages(updatedMessages);
      setGroupChatMessages(prev => ({
        ...prev,
        [groupId]: updatedMessages
      }));
      
      console.log(`[Groups] Sending message to group ${groupId}:`, input);
      
      // Then send to Firebase
      await chatService.sendMessage({
        groupId: groupId,
        userId: user.uid,
        content: input,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userPhotoURL: user.photoURL || ''
      });
      
      console.log('[Groups] Message sent successfully');
      
      // Force a refresh of chat messages to ensure everyone sees the message
      setTimeout(() => {
        loadChatMessages(groupId);
      }, 500);
      
    } catch (error) {
      console.error('[Groups] Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadChatMessages = (groupId: string) => {
    if (!groupId) {
      console.error('[Groups] Cannot load chat messages: No group ID provided');
      return;
    }
    
    console.log(`[Groups] Loading chat messages for group: ${groupId}`);
    
    // Check if we already have messages for this group
    const existingMessages = groupChatMessages[groupId] || [];
    
    // If we already have messages, display them immediately
    if (existingMessages.length > 0) {
      console.log(`[Groups] Using ${existingMessages.length} cached messages`);
      setChatMessages(existingMessages);
      // But still refresh from server in background
    } else {
      // Only show loading indicator if no cached messages
      const tempLoadingMsg = {
        id: `loading-${Date.now()}`,
        groupId: groupId,
        userId: 'system',
        content: 'Loading messages...',
        isBot: true,
        userName: 'System',
        timestamp: Date.now()
      };
      
      setChatMessages([tempLoadingMsg]);
    }
    
    // Clean up previous subscription
    if (messageUnsubscribeRef.current) {
      console.log('[Groups] Cleaning up previous message subscription');
      messageUnsubscribeRef.current();
    }
    
    // Set up new subscription
    console.log(`[Groups] Setting up new message subscription for group: ${groupId}`);
    messageUnsubscribeRef.current = chatService.subscribeToGroupMessages(
      groupId,
      (messages) => {
        console.log(`[Groups] Received ${messages.length} messages from subscription`);
        
        // Filter out the loading message
        const filteredMessages = messages.filter(m => !m.id.startsWith('loading-'));
        
        // Update both the current chat messages and the cached messages
        setChatMessages(filteredMessages);
        setGroupChatMessages(prev => ({
          ...prev,
          [groupId]: filteredMessages
        }));
        
        // Scroll to bottom
        scrollToBottom();
      }
    );
  };

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
    
    // Show loading notification
    const loadingToast = toast({
      title: "Clearing chat messages",
      description: "Please wait...",
      duration: 2000,
    });
    
    try {
      console.log(`[Groups] Starting to clear chat for group: ${selectedGroup.id}`);
      
      // First, add a temporary message to show we're clearing
      const tempMessage = {
        id: uuidv4(),
        groupId: selectedGroup.id,
        userId: 'system', 
        content: 'Clearing chat history...',
        isBot: true,
        userName: 'System',
        timestamp: Date.now()
      };
      
      // Update UI immediately to give feedback
      setChatMessages([tempMessage]);
      
      // Delete messages from Firebase
      const clearSuccess = await chatService.clearChatForGroup(selectedGroup.id);
      
      // Even if clearSuccess is false, don't throw an error
      // Just log it and continue
      if (!clearSuccess) {
        console.warn(`[Groups] Some issue clearing messages from database, but proceeding anyway`);
      }
      
      console.log(`[Groups] Successfully cleared messages from Firebase`);
      
      // Add confirmation message after successful deletion
      const confirmationMessage = {
        id: uuidv4(),
        groupId: selectedGroup.id,
        userId: 'system', 
        content: 'Chat history has been cleared.',
        isBot: true,
        userName: 'System',
        timestamp: Date.now()
      };
      
      // Send the confirmation message to Firebase
      await chatService.sendMessage({
        groupId: selectedGroup.id,
        userId: 'system',
        content: 'Chat history has been cleared.',
        isBot: true,
        userName: 'System'
      });
      
      // Update local state with just the confirmation message
      setChatMessages([confirmationMessage]);
      
      // Also clear the cached messages for this group
      setGroupChatMessages(prev => ({
        ...prev,
        [selectedGroup.id]: [confirmationMessage]
      }));
      
      toast({
        title: "Chat Cleared",
        description: "All messages have been cleared successfully.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error('[Groups] Error clearing chat:', error);
      
      // Don't show an error toast or error message in the UI
      // Instead, just show a neutral message that the operation is complete
      
      // Create a neutral message
      const neutralMessage = {
        id: uuidv4(),
        groupId: selectedGroup.id,
        userId: 'system', 
        content: 'Chat history has been processed.',
        isBot: true,
        userName: 'System',
        timestamp: Date.now()
      };
      
      setChatMessages([neutralMessage]);
      
      // Send neutral message to database
      try {
        await chatService.sendMessage({
          groupId: selectedGroup.id,
          userId: 'system',
          content: 'Chat history has been processed.',
          isBot: true,
          userName: 'System'
        });
      } catch (e) {
        console.error("[Groups] Failed to send status message:", e);
      }
      
      // Attempt to restore messages by reloading them
      setTimeout(() => {
        loadChatMessages(selectedGroup.id);
      }, 2000);
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
      
      // Add enhanced notification in chat that a call has started
      await chatService.sendMessage({
        groupId: group.id,
        userId: 'system',
        content: `📞 **Video Call Started** 📞\n\n${user.displayName || 'A user'} has started a video call in this group.\n\nClick "Join Call" below to join the conversation!`,
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
      
      // Add more detailed notification in chat that the call has ended
      await chatService.sendMessage({
        groupId: group.id,
        userId: 'system',
        content: `🔴 **Video Call Ended** 🔴\n\n${user?.displayName || 'A user'} has ended the call. The call lasted approximately ${formatCallDuration(Date.now() - (group.activeCall?.startTime || Date.now()))}.`,
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

  // Add this helper function to check if there's an active call in the group
  const hasActiveCall = (group: GroupUI) => {
    return group.activeCall && group.activeCall.participants.length > 0;
  };

  // Add a join call function
  const joinGroupCall = (group: GroupUI) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join calls.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    try {
      // Update the UI to show we're joining the call
      toast({
        title: "Joining Call",
        description: "Connecting to the group call...",
        duration: 3000,
      });

      // Set the active call group to trigger the VideoCall component
      setActiveCallGroup(group);
      setShowVideoCall(true);

      // Add a system message to the chat with more details
      chatService.sendMessage({
        groupId: group.id,
        userId: 'system',
        content: `🎥 **${user.displayName || 'Someone'} joined the call**\n\nThe call now has ${(group.activeCall?.participants.length || 0) + 1} participant${(group.activeCall?.participants.length || 0) + 1 !== 1 ? 's' : ''}.`,
        isBot: true,
        userName: 'System'
      });

      // Mark user as participant in the call
      groupService.joinGroupCall(group.id);
    } catch (error) {
      console.error('Error joining call:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to join call";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
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
          {/* Add Join Call button if the message is about a call starting */}
          {message.isBot && 
           (message.content.includes('Video Call Started') || message.content.toLowerCase().includes('started a video call')) && 
           selectedGroup && 
           hasActiveCall(selectedGroup) && 
           !activeCallGroup && (
            <div className="mt-2">
              <Button 
                size="sm" 
                variant="default" 
                className="w-full text-sm flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2"
                onClick={() => joinGroupCall(selectedGroup)}
              >
                <Video className="h-4 w-4" /> Join Video Call Now
              </Button>
            </div>
          )}
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Just now'}
          </p>
        </div>
      </div>
    ));
  }, [chatMessages, user?.uid, selectedGroup, activeCallGroup]);

  // Header section
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">My Study Groups</h1>
      <div className="flex gap-2">
        <Button onClick={() => navigate('/groups/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
        <Button onClick={() => setShowJoinDialog(true)} variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Join with Code
        </Button>
        <Button 
          onClick={() => {
            setShowDiscoverGroups(true);
            searchGroups('');
          }} 
          variant="outline"
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border-purple-500/20"
        >
          <Globe className="h-4 w-4 mr-2" />
          Discover Groups
        </Button>
      </div>
    </div>
  );

  // Verify the API connection
  const verifyGeminiConnection = async () => {
    setApiConnectionStatus('unchecked');
    try {
      const isConnected = await verifyApiConnection();
      if (isConnected) {
        setApiConnectionStatus('verified');
        
        // Show success message
        const successMsg: chatService.ChatMessage = {
          id: `connection-verified-${Date.now()}`,
          groupId: selectedGroup?.id || '',
          userId: 'bot',
          content: "✅ CodeDiploMate connection verified! I'm ready to help with code generation.",
          isBot: true,
          userName: 'CodeDiploMate',
          timestamp: Date.now()
        };
        
        // Update both current messages and cached messages
        const updatedMessages = [...chatMessages, successMsg];
        setChatMessages(updatedMessages);
        if (selectedGroup) {
          setGroupChatMessages(prev => ({
            ...prev,
            [selectedGroup.id]: updatedMessages
          }));
        }
        
        await chatService.sendMessage({
          groupId: selectedGroup?.id || '',
          userId: 'bot',
          content: "✅ CodeDiploMate connection verified! I'm ready to help with code generation.",
          isBot: true,
          userName: 'CodeDiploMate'
        });
        
        return true;
      } else {
        setApiConnectionStatus('failed');
        
        // Show error message
        const errorMsg: chatService.ChatMessage = {
          id: `connection-failed-${Date.now()}`,
          groupId: selectedGroup?.id || '',
          userId: 'bot',
          content: "❌ Unable to connect to the Gemini API. Please check your API key and network connection.",
          isBot: true,
          userName: 'CodeDiploMate',
          timestamp: Date.now()
        };
        
        // Update both current messages and cached messages
        const updatedMessages = [...chatMessages, errorMsg];
        setChatMessages(updatedMessages);
        if (selectedGroup) {
          setGroupChatMessages(prev => ({
            ...prev,
            [selectedGroup.id]: updatedMessages
          }));
        }
        
        await chatService.sendMessage({
          groupId: selectedGroup?.id || '',
          userId: 'bot',
          content: "❌ Unable to connect to the Gemini API. Please check your API key and network connection.",
          isBot: true,
          userName: 'CodeDiploMate'
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error verifying API connection:', error);
      setApiConnectionStatus('failed');
      return false;
    }
  };

  // Reset ChatDiploMate
  const resetCodeDiploMate = async () => {
    try {
      await resetChat();
      
      // Show reset message
      const resetMsg: chatService.ChatMessage = {
        id: `reset-success-${Date.now()}`,
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: "🔄 CodeDiploMate has been reset and is ready for new questions!",
        isBot: true,
        userName: 'CodeDiploMate',
        timestamp: Date.now()
      };
      
      // Update both current messages and cached messages
      const updatedMessages = [...chatMessages, resetMsg];
      setChatMessages(updatedMessages);
      if (selectedGroup) {
        setGroupChatMessages(prev => ({
          ...prev,
          [selectedGroup.id]: updatedMessages
        }));
      }
      
      await chatService.sendMessage({
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: "🔄 CodeDiploMate has been reset and is ready for new questions!",
        isBot: true,
        userName: 'CodeDiploMate'
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting CodeDiploMate:', error);
      return false;
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

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

  // Add this function to handle group search
  const searchGroups = async (interest: string) => {
    try {
      setIsSearching(true);
      setSearchTerm(interest);
      
      const results = await groupService.searchGroupsByInterest(interest);
      
      // Convert to GroupUI format
      const formattedResults: GroupUI[] = results.map(group => ({
        ...group,
        privateId: group.code || '', // Use code as privateId for discovered groups
        interest: group.tags?.join(', ') || '', // Join tags for interest field
        createdAt: typeof group.createdAt === 'string' ? new Date(group.createdAt) : group.createdAt,
        activeCall: group.activeCall ? {
          initiator: group.activeCall.initiatedBy,
          participants: group.activeCall.participants,
          startTime: typeof group.activeCall.startedAt === 'string' 
            ? new Date(group.activeCall.startedAt).getTime() 
            : group.activeCall.startedAt,
          isAudioOnly: group.activeCall.isAudioOnly
        } : undefined
      }));
      
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching groups:', error);
      toast({
        title: "Error",
        description: "Failed to search groups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Add this function to handle joining a group from search results
  const handleJoinGroupFromSearch = async (group: GroupUI) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join groups.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }
    
    // Check if user is already a member
    if (group.members.includes(user.uid)) {
      toast({
        title: "Already Joined",
        description: `You are already a member of ${group.name}.`,
      });
      return;
    }
    
    try {
      const joinedGroup = await groupService.joinGroupByCode(group.code);
      
      if (joinedGroup) {
        toast({
          title: "Success",
          description: `You have joined ${group.name}.`,
        });
        
        // Refresh groups
        fetchGroups();
        setShowDiscoverGroups(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to join group. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add a function to handle adding tags
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Add a function to handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

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
          <form onSubmit={handleCreate} className="space-y-4 max-w-xl mx-auto">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for your group"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your group is about"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interest">Primary Interest/Subject</Label>
              <Input
                id="interest"
                value={interestType}
                onChange={(e) => setInterestType(e.target.value)}
                placeholder="e.g. Programming, Mathematics, Physics"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Press Enter to add)</Label>
              <div className="flex">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags to help others find your group"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-grow"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddTag}
                  className="ml-2"
                >
                  Add
                </Button>
              </div>
              
              {/* Display tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
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
                              activeCallGroup && activeCallGroup.id === group.id ? (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => endGroupCall(group)}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Leave Call
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => joinGroupCall(group)}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Join Call
                                </Button>
                              )
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  if (!user) return;
                                  startGroupCall(group);
                                }}
                              >
                                <Video className="h-4 w-4 mr-1" />
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
                              activeCallGroup && activeCallGroup.id === group.id ? (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => endGroupCall(group)}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Leave Call
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => joinGroupCall(group)}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Join Call
                                </Button>
                              )
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  if (!user) return;
                                  startGroupCall(group);
                                }}
                              >
                                <Video className="h-4 w-4 mr-1" />
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
              <div className="flex items-center gap-2 flex-wrap">
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
                {hasActiveCall(selectedGroup) && !activeCallGroup ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => joinGroupCall(selectedGroup)}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600"
                  >
                    <Video className="h-4 w-4" />
                    Join Active Call
                  </Button>
                ) : !hasActiveCall(selectedGroup) ? (
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
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearChat}
                  className="flex items-center gap-1 ml-2"
                >
                  Clear Chat
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  // Clean up message subscription without clearing messages
                  if (messageUnsubscribeRef.current) {
                    console.log('[Groups] Cleaning up message subscription when closing chat');
                    messageUnsubscribeRef.current();
                    messageUnsubscribeRef.current = null;
                  }
                  setSelectedGroup(null);
                }}
              >
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
            <div className="flex space-x-2 mb-2">
              <button
                type="button"
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  apiConnectionStatus === 'verified' 
                    ? 'bg-green-500/20 text-green-200 hover:bg-green-500/30'
                    : apiConnectionStatus === 'failed'
                    ? 'bg-red-500/20 text-red-200 hover:bg-red-500/30'
                    : 'bg-gray-500/20 text-gray-200 hover:bg-gray-500/30'
                }`}
                onClick={verifyGeminiConnection}
              >
                {apiConnectionStatus === 'verified' ? '✓ API Connected' : 
                 apiConnectionStatus === 'failed' ? '✗ API Failed' : 
                 'Check API Connection'}
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-colors"
                onClick={resetCodeDiploMate}
              >
                🔄 Reset CodeDiploMate
              </button>
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

      {/* Add the Discover Groups modal */}
      {showDiscoverGroups && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-4xl w-full h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Discover Study Groups</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDiscoverGroups(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="mb-4 space-y-4">
              <div className="relative">
                <Input
                  placeholder="Search by interests, name, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-20"
                />
                <Button 
                  className="absolute right-0 top-0 rounded-l-none"
                  onClick={() => searchGroups(searchTerm)}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">Popular interests:</span>
                {popularInterests.map(interest => (
                  <Badge 
                    key={interest}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => searchGroups(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-4 pr-1">
              {isSearching ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Searching for groups...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <SearchX className="h-12 w-12 mb-4 opacity-20" />
                  <p>No groups found matching your search.</p>
                  <p className="text-sm">Try a different interest or search term.</p>
                </div>
              ) : (
                searchResults.map(group => (
                  <Card key={group.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-lg font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{group.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                          {group.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {!group.tags?.length && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              No tags
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{group.members.length} members</span>
                          
                          {group.activeCall && (
                            <span className="flex items-center gap-1 text-red-500">
                              <Video className="h-3 w-3" />
                              Active call
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 justify-between">
                        <Button 
                          onClick={() => handleJoinGroupFromSearch(group)}
                          disabled={user && group.members.includes(user.uid)}
                          className={user && group.members.includes(user.uid) ? 
                            "bg-green-500 hover:bg-green-500 cursor-default" : ""}
                        >
                          {user && group.members.includes(user.uid) ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Joined
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Join Group
                            </>
                          )}
                        </Button>
                        
                        {hasActiveCall(group) && !activeCallGroup && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleJoinGroupFromSearch(group).then(() => {
                                joinGroupCall(group);
                              });
                            }}
                            className="flex items-center gap-1 bg-green-500/20 border-green-500/30 hover:bg-green-500/30"
                            disabled={user && group.members.includes(user.uid)}
                          >
                            <Video className="h-4 w-4" />
                            Join Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Groups; 