import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import Group from '../../../models/Group';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    switch (req.method) {
      case 'GET':
        const groups = await Group.find({}).sort({ createdAt: -1 });
        return res.status(200).json(groups);

      case 'POST':
        const group = await Group.create(req.body);
        return res.status(201).json(group);

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
} 