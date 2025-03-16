const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

console.log('Defining Group model...');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  privateId: {
    type: DataTypes.STRING(6),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  interest: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  members: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('members');
      return JSON.parse(rawValue);
    },
    set(value) {
      this.setDataValue('members', JSON.stringify(value));
    }
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  activeCall: {
    type: DataTypes.TEXT,
    defaultValue: null,
    get() {
      const rawValue = this.getDataValue('activeCall');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('activeCall', value ? JSON.stringify(value) : null);
    }
  }
}, {
  tableName: 'groups',
  timestamps: true
});

console.log('Group model defined successfully');

// Add hooks for logging
Group.addHook('beforeValidate', (group, options) => {
  console.log('Validating group:', JSON.stringify(group, null, 2));
});

Group.addHook('afterCreate', (group, options) => {
  console.log('Created group:', JSON.stringify(group, null, 2));
});

module.exports = Group; 