import React, { useState, useEffect } from 'react';
import { collaborateGroupService } from '../services/collaborateGroup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';

interface Message {
  id: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export const CollaborateGroup: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [pin, setPin] = useState('');
  const [currentGroup, setCurrentGroup] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateGroup = () => {
    try {
      if (!userName || !groupName) {
        setError('Please enter both your name and group name');
        return;
      }

      const { group, pin } = collaborateGroupService.createGroup(groupName, userName);
      setCurrentGroup(group);
      setSuccess(`Group created successfully! Your PIN is: ${pin}`);
      setShowCreateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const handleJoinGroup = () => {
    try {
      if (!userName || !pin) {
        setError('Please enter both your name and the group PIN');
        return;
      }

      const group = collaborateGroupService.joinGroup(pin, userName);
      setCurrentGroup(group);
      setSuccess('Joined group successfully!');
      setShowJoinDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    }
  };

  const handleSendMessage = () => {
    try {
      if (!newMessage.trim() || !currentGroup) return;

      const message = collaborateGroupService.sendMessage(
        currentGroup.id,
        currentGroup.members[0].id,
        newMessage.trim()
      );

      setMessages([...messages, message]);
      setNewMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleLeaveGroup = () => {
    try {
      if (!currentGroup) return;

      collaborateGroupService.leaveGroup(
        currentGroup.id,
        currentGroup.members[0].id
      );

      setCurrentGroup(null);
      setMessages([]);
      setSuccess('Left group successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave group');
    }
  };

  useEffect(() => {
    if (currentGroup) {
      const groupMessages = collaborateGroupService.getGroupMessages(currentGroup.id);
      setMessages(groupMessages);
    }
  }, [currentGroup]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
            Study Group Collaboration
          </h1>
          <p className="text-muted-foreground mb-8">
            Create or join a study group to collaborate with your peers in real-time
          </p>
        </div>

        {!currentGroup ? (
          <div className="max-w-md mx-auto">
            <Paper className="p-8 space-y-6" elevation={3}>
              <div className="space-y-4 text-center">
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setShowCreateDialog(true)}
                  className="py-6 text-lg"
                >
                  Create New Group
                </Button>
                <div className="relative">
                  <Divider>
                    <span className="px-2 text-muted-foreground">or</span>
                  </Divider>
                </div>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => setShowJoinDialog(true)}
                  className="py-6 text-lg"
                >
                  Join Existing Group
                </Button>
              </div>
            </Paper>
          </div>
        ) : (
          <Paper className="max-w-4xl mx-auto p-6">
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h5" component="h2">
                {currentGroup.name}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLeaveGroup}
              >
                Leave Group
              </Button>
            </Box>

            <List className="bg-secondary/10 rounded-lg mb-4" style={{ maxHeight: '60vh', overflow: 'auto' }}>
              {messages.map((message) => (
                <React.Fragment key={message.id}>
                  <ListItem>
                    <ListItemText
                      primary={message.content}
                      secondary={`${message.senderName} - ${new Date(message.timestamp).toLocaleString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Box className="flex gap-2">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
              >
                Send
              </Button>
            </Box>
          </Paper>
        )}

        {/* Create Group Dialog */}
        <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateGroup} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Join Group Dialog */}
        <Dialog open={showJoinDialog} onClose={() => setShowJoinDialog(false)}>
          <DialogTitle>Join Group</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Group PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowJoinDialog(false)}>Cancel</Button>
            <Button onClick={handleJoinGroup} variant="contained">
              Join
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notifications */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}; 