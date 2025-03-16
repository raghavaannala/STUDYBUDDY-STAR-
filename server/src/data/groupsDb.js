const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'groups.json');

// Initialize the database file if it doesn't exist
const initDb = async () => {
  try {
    await fs.access(DB_PATH);
  } catch (error) {
    await fs.writeFile(DB_PATH, '[]');
  }
};

// Read all groups
const getAllGroups = async () => {
  await initDb();
  const data = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(data);
};

// Save all groups
const saveGroups = async (groups) => {
  await fs.writeFile(DB_PATH, JSON.stringify(groups, null, 2));
};

// Get groups for a user
const getUserGroups = async (userId) => {
  const groups = await getAllGroups();
  return groups.filter(group => group.members.includes(userId));
};

// Create a new group
const createGroup = async (groupData) => {
  const groups = await getAllGroups();
  const newGroup = {
    id: uuidv4(),
    ...groupData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  groups.push(newGroup);
  await saveGroups(groups);
  return newGroup;
};

// Find group by privateId
const findGroupByPrivateId = async (privateId) => {
  const groups = await getAllGroups();
  return groups.find(group => group.privateId === privateId);
};

// Update a group
const updateGroup = async (groupId, updateData) => {
  const groups = await getAllGroups();
  const index = groups.findIndex(group => group.id === groupId);
  
  if (index === -1) {
    return null;
  }

  groups[index] = {
    ...groups[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  await saveGroups(groups);
  return groups[index];
};

module.exports = {
  getAllGroups,
  getUserGroups,
  createGroup,
  findGroupByPrivateId,
  updateGroup
}; 