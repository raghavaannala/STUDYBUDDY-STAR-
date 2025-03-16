import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Users, Pencil, Trash2, MessageSquare, LogIn, Bot, Code, Video, Link } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/store/useAuth';
import VideoCall from '@/components/video/VideoCall';
import { generateCode, optimizeCode, explainCode } from '@/services/codeDiploMate';
import { groupApi } from '@/services/api';

interface CallState {
  initiator: string;
  participants: string[];
  startTime: Date;
}

interface RawGroup {
  id: string;
  privateId: string;
  name: string;
  description: string;
  interest: string;
  members: string[];
  createdAt: string;
  createdBy: string;
  activeCall?: {
    initiator: string;
    participants: string[];
    startTime: string;
  };
}

interface Group {
  id: string;
  privateId: string;
  name: string;
  description: string;
  interest: string;
  members: string[];
  createdAt: Date;
  createdBy: string;
  activeCall?: CallState;
}

interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  timestamp: Date;
  isBot?: boolean;
  userName?: string;
}

const Groups = () => {
  const { user, isLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState({ 
    name: '', 
    description: '', 
    interest: 'programming',
    members: [] as string[]
  });
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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
  const [activeCallGroup, setActiveCallGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, navigate, toast]);

  const generatePrivateId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const fetchGroups = async () => {
    try {
      if (!user) return;
      const groups = await groupApi.getUserGroups(user.id);
      setGroups(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive",
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
      const group = await groupApi.createGroup({
        name: newGroup.name,
        description: newGroup.description,
        interest: newGroup.interest,
        userId: user.id
      });

      toast({
        title: "Group Created!",
        description: `Share this code with others to join: ${group.privateId}`,
      });

      setNewGroup({ 
        name: '', 
        description: '', 
        interest: 'programming',
        members: []
      });
      
      if (isCreatePage) {
        navigate('/groups');
      }
      
      await fetchGroups();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create group";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join a group.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a join code",
        variant: "destructive",
      });
      return;
    }

    try {
      const group = await groupApi.joinGroup(joinCode.trim(), user.id);
      
      toast({
        title: "Success!",
        description: "You've joined the group successfully.",
      });
      
      setJoinCode('');
      setShowJoinDialog(false);
      await fetchGroups();
      
      // Automatically open chat for the joined group
      setSelectedGroup(group);
      loadChatMessages(group.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join group";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCodeDiploMateHelp = async () => {
    if (!codeQuestion.trim()) return;

    setShowMagicEffect(true);
    setShowCodeDiploMate(false);

    // Show loading message
    const loadingMessage: ChatMessage = {
      id: Date.now().toString(),
      groupId: selectedGroup?.id || '',
      userId: 'bot',
      content: "✨ Casting a spell to generate your code... ✨",
      timestamp: new Date(),
      isBot: true,
      userName: 'CodeDiploMate'
    };

    const savedMessages = JSON.parse(localStorage.getItem('groupChats') || '{}');
    const groupMessages = savedMessages[selectedGroup?.id || ''] || [];
    savedMessages[selectedGroup?.id || ''] = [...groupMessages, loadingMessage];
    localStorage.setItem('groupChats', JSON.stringify(savedMessages));
    setChatMessages(prev => [...prev, loadingMessage]);

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

      setTimeout(() => {
        // Create the response message
        const message: ChatMessage = {
          id: (Date.now() + 1).toString(),
          groupId: selectedGroup?.id || '',
          userId: 'bot',
          content: responseContent,
          timestamp: new Date(),
          isBot: true,
          userName: 'CodeDiploMate'
        };

        savedMessages[selectedGroup?.id || ''] = [...savedMessages[selectedGroup?.id || ''], message];
        localStorage.setItem('groupChats', JSON.stringify(savedMessages));
        setChatMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(message));
        
        // Add optimization suggestion
        const optimizationMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          groupId: selectedGroup?.id || '',
          userId: 'bot',
          content: "✨ Would you like me to optimize this code or explain it in more detail? Just type 'optimize' or 'explain' to get more help! ✨",
          timestamp: new Date(),
          isBot: true,
          userName: 'CodeDiploMate'
        };

        savedMessages[selectedGroup?.id || ''] = [...savedMessages[selectedGroup?.id || ''], optimizationMessage];
        localStorage.setItem('groupChats', JSON.stringify(savedMessages));
        setChatMessages(prev => [...prev, optimizationMessage]);
        
        setShowMagicEffect(false);
        
        // Scroll to bottom
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 1500);

    } catch (error) {
      console.error('Error generating code:', error);
      
      setTimeout(() => {
        // Show error message
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          groupId: selectedGroup?.id || '',
          userId: 'bot',
          content: "🔮 My crystal ball seems a bit cloudy. Please try again later or rephrase your question.",
          timestamp: new Date(),
          isBot: true,
          userName: 'CodeDiploMate'
        };

        savedMessages[selectedGroup?.id || ''] = [...savedMessages[selectedGroup?.id || ''], errorMessage];
        localStorage.setItem('groupChats', JSON.stringify(savedMessages));
        setChatMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(errorMessage));
        
        setShowMagicEffect(false);
      }, 1500);
    }

    setCodeQuestion('');
  };

  // Add new function to handle optimization requests
  const handleOptimizeCode = async (code: string) => {
    try {
      const optimizedCode = await optimizeCode(code);
      
      const message: ChatMessage = {
        id: Date.now().toString(),
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: `Here's the optimized version:\n\n\`\`\`javascript\n${optimizedCode}\n\`\`\``,
        timestamp: new Date(),
        isBot: true,
        userName: 'CodeDiploMate'
      };

      const savedMessages = JSON.parse(localStorage.getItem('groupChats') || '{}');
      savedMessages[selectedGroup?.id || ''] = [...savedMessages[selectedGroup?.id || ''], message];
      localStorage.setItem('groupChats', JSON.stringify(savedMessages));
      setChatMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error optimizing code:', error);
    }
  };

  // Add new function to handle explanation requests
  const handleExplainCode = async (code: string) => {
    try {
      const explanation = await explainCode(code);
      
      const message: ChatMessage = {
        id: Date.now().toString(),
        groupId: selectedGroup?.id || '',
        userId: 'bot',
        content: `Here's a detailed explanation:\n\n${explanation}`,
        timestamp: new Date(),
        isBot: true,
        userName: 'CodeDiploMate'
      };

      const savedMessages = JSON.parse(localStorage.getItem('groupChats') || '{}');
      savedMessages[selectedGroup?.id || ''] = [...savedMessages[selectedGroup?.id || ''], message];
      localStorage.setItem('groupChats', JSON.stringify(savedMessages));
      setChatMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error explaining code:', error);
    }
  };

  // Update handleSendMessage to handle code-related commands
  const handleSendMessage = (groupId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send messages.",
        variant: "destructive",
      });
      navigate('/signin');
      return;
    }

    if (!newMessage.trim()) return;

    // Check for code-related commands
    const message = newMessage.toLowerCase();
    if (message.includes('optimize') || message.includes('improve')) {
      // Extract code from previous message
      const lastBotMessage = chatMessages
        .filter(m => m.isBot)
        .pop();
      if (lastBotMessage?.content.includes('```')) {
        const codeMatch = lastBotMessage.content.match(/```javascript\n([\s\S]*?)```/);
        if (codeMatch) {
          handleOptimizeCode(codeMatch[1]);
        }
      }
    } else if (message.includes('explain') || message.includes('how does it work')) {
      // Extract code from previous message
      const lastBotMessage = chatMessages
        .filter(m => m.isBot)
        .pop();
      if (lastBotMessage?.content.includes('```')) {
        const codeMatch = lastBotMessage.content.match(/```javascript\n([\s\S]*?)```/);
        if (codeMatch) {
          handleExplainCode(codeMatch[1]);
        }
      }
    }

    const messageObj: ChatMessage = {
      id: Date.now().toString(),
      groupId,
      userId: user.id,
      content: newMessage,
      timestamp: new Date(),
      userName: user.name
    };

    const savedMessages = JSON.parse(localStorage.getItem('groupChats') || '{}');
    const groupMessages = savedMessages[groupId] || [];
    savedMessages[groupId] = [...groupMessages, messageObj];
    localStorage.setItem('groupChats', JSON.stringify(savedMessages));

    setChatMessages([...chatMessages, messageObj]);
    setNewMessage('');
  };

  const loadChatMessages = (groupId: string) => {
    const savedMessages = JSON.parse(localStorage.getItem('groupChats') || '{}');
    const groupMessages = savedMessages[groupId] || [];
    setChatMessages(groupMessages);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    
    try {
      // Update in localStorage
      const savedGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]');
      const updatedGroups = savedGroups.map((group: Group) => 
        group.id === editingGroup.id 
          ? { 
              ...group, 
              name: editingGroup.name, 
              description: editingGroup.description,
              createdAt: editingGroup.createdAt.toISOString()
            }
          : group
      );
      localStorage.setItem('userStudyGroups', JSON.stringify(updatedGroups));
      window.dispatchEvent(new Event('studyGroupsUpdated'));

      setEditingGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting group with ID:', id);
      
      // Delete from backend first
      await groupApi.deleteGroup(id);

      // Remove from localStorage
      const savedGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]');
      const updatedGroups = savedGroups.filter((group: Group) => group.id !== id && group.privateId !== id);
      localStorage.setItem('userStudyGroups', JSON.stringify(updatedGroups));
      window.dispatchEvent(new Event('studyGroupsUpdated'));

      // Show success message
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });

      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add clear chat function
  const handleClearChat = () => {
    if (selectedGroup) {
      const savedMessages = JSON.parse(localStorage.getItem('groupChats') || '{}');
      savedMessages[selectedGroup.id] = [];
      localStorage.setItem('groupChats', JSON.stringify(savedMessages));
      setChatMessages([]);
      
      toast({
        title: "Chat Cleared",
        description: "All messages have been cleared from this chat.",
      });
    }
  };

  // Update the startGroupCall function
  const startGroupCall = async (group: Group) => {
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
      const callState: CallState = {
        initiator: user.id,
        participants: [user.id],
        startTime: new Date()
      };

      const updatedGroup = await groupApi.updateGroupCall(group.id, callState);
      setActiveCallGroup(updatedGroup);
      setShowVideoCall(true);
      
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

  // Update the endGroupCall function
  const endGroupCall = async (group: Group) => {
    try {
      await groupApi.updateGroupCall(group.id, null);
      setActiveCallGroup(null);
      setShowVideoCall(false);
      
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

  // Update the useEffect for URL-based joining
  useEffect(() => {
    const joinGroupFromUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      const groupId = params.get('join');
      
      if (groupId && user) {
        try {
          const savedGroups = JSON.parse(localStorage.getItem('userStudyGroups') || '[]');
          const groupToJoin = savedGroups.find((g: RawGroup) => g.privateId === groupId);
          
          if (groupToJoin) {
            if (!groupToJoin.members.includes(user.id)) {
              handleJoinGroup({ preventDefault: () => {} } as FormEvent);
            } else {
              // If already a member, just open the chat
              const group = {
                ...groupToJoin,
                createdAt: new Date(groupToJoin.createdAt),
                activeCall: groupToJoin.activeCall ? {
                  ...groupToJoin.activeCall,
                  startTime: new Date(groupToJoin.activeCall.startTime)
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

  if (isLoading) {
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            {isCreatePage ? 'Create Study Group' : 'Study Groups'}
          </h2>
        </div>
      </div>
      
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
              <div className="flex justify-center mb-8">
                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate('/groups/create')}
                  >
                    Create New Group
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowJoinDialog(true)}
                  >
                    Join Group
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {groups.map((group) => (
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Join Study Group</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode">Enter Group Code</Label>
                <Input
                  id="joinCode"
                  placeholder="Enter 6-digit code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <form onSubmit={handleJoinGroup} className="flex-1">
                  <Button type="submit" className="w-full">
                    Join Group
                  </Button>
                </form>
              </div>
            </div>
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
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.userId === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isBot
                        ? 'bg-purple-500/10 border border-purple-500/20'
                        : message.userId === user?.id
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
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
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
              <VideoCall
                groupId={selectedGroup.id}
                userName={user?.name || 'Anonymous'}
                onClose={() => endGroupCall(selectedGroup)}
              />
            </div>
          )}
        </div>
      )}

      {activeCallGroup && user && (
        <VideoCall
          groupId={activeCallGroup.id}
          userName={user.name || 'Anonymous'}
          onClose={() => endGroupCall(activeCallGroup)}
        />
      )}
    </div>
  );
};

export default Groups; 