import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import Group from '../../../models/Group';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const session = await getSession({ req });
  const { id } = req.query;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const group = await Group.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });
        res.status(200).json(group);
      } catch (error) {
        res.status(400).json({ error: 'Error updating group' });
      }
      break;

    case 'DELETE':
      try {
        await Group.findByIdAndDelete(id);
        res.status(200).json({ message: 'Group deleted' });
      } catch (error) {
        res.status(400).json({ error: 'Error deleting group' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 