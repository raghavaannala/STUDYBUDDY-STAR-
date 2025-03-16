import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import Group from '../../../models/Group';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const groups = await Group.find({}).sort({ createdAt: -1 });
        res.status(200).json(groups);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch groups' });
      }
      break;

    case 'POST':
      try {
        const group = await Group.create({
          ...req.body,
          members: 1,
          lastActive: 'Just now',
          createdAt: new Date()
        });
        res.status(201).json(group);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create group' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 