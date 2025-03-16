const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage for groups
const groups = new Map();

// Debug middleware
router.use((req, res, next) => {
  console.log('\n=== Incoming Request ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  next();
});

// Get user's groups
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    console.log('\n=== Fetching Groups ===');
    console.log('User ID:', userId);
    console.log('Current groups in memory:', Array.from(groups.values()));

    if (!userId) {
      console.log('Error: No userId provided');
      return res.status(400).json({ 
        error: 'User ID is required',
        received: { userId }
      });
    }

    // Filter groups for this user
    const userGroups = Array.from(groups.values()).filter(group => 
      group.members.includes(userId)
    );

    console.log('Found groups:', {
      userId,
      groupCount: userGroups.length,
      groups: userGroups
    });
    
    return res.json(userGroups);
  } catch (error) {
    console.error('Error in GET /user/:userId:', {
      error: {
        message: error.message,
        stack: error.stack
      },
      userId: req.params.userId
    });
    return res.status(500).json({ 
      error: 'Failed to fetch groups',
      details: error.message
    });
  }
});

// Create a group
router.post('/', (req, res) => {
  try {
    console.log('\n=== Creating Group ===');
    console.log('Request body:', req.body);
    
    const { name, description = '', userId } = req.body;

    if (!name || !userId) {
      console.log('Error: Missing required fields');
      return res.status(400).json({ 
        error: 'Name and userId are required',
        received: { name, userId }
      });
    }

    const group = {
      id: uuidv4(),
      name,
      description,
      createdBy: userId,
      members: [userId],
      privateId: Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    groups.set(group.id, group);
    
    console.log('Created group:', {
      groupId: group.id,
      name: group.name,
      createdBy: group.createdBy
    });
    console.log('Current groups in memory:', Array.from(groups.values()));

    return res.status(201).json(group);
  } catch (error) {
    console.error('Error in POST /:', {
      error: {
        message: error.message,
        stack: error.stack
      },
      body: req.body
    });
    return res.status(500).json({ 
      error: 'Failed to create group',
      details: error.message
    });
  }
});

// Join a group
router.post('/join', (req, res) => {
  try {
    const { privateId, userId } = req.body;
    console.log('Join request:', { privateId, userId });

    if (!privateId || !userId) {
      return res.status(400).json({ error: 'Private ID and user ID are required' });
    }

    const group = Array.from(groups.values()).find(g => g.privateId === privateId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    group.members.push(userId);
    group.updatedAt = new Date();
    console.log('Updated group:', group);
    res.json(group);
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Delete a group
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log('\n=== Deleting Group ===');
    console.log('Group ID:', id);

    if (!id) {
      console.log('Error: No group ID provided');
      return res.status(400).json({ 
        error: 'Group ID is required',
        received: { id }
      });
    }

    // Try to find the group by either UUID or string ID
    const group = Array.from(groups.values()).find(g => 
      g.id === id || g.privateId === id
    );

    if (!group) {
      console.log('Error: Group not found');
      return res.status(404).json({ 
        error: 'Group not found',
        groupId: id
      });
    }

    groups.delete(group.id);
    console.log('Group deleted successfully:', group.id);
    console.log('Remaining groups:', Array.from(groups.values()));

    return res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /:id:', {
      error: {
        message: error.message,
        stack: error.stack
      },
      groupId: req.params.id
    });
    return res.status(500).json({ 
      error: 'Failed to delete group',
      details: error.message
    });
  }
});

module.exports = router; 