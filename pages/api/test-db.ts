import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';

export default async function handler(req: NextApiResponse, res: NextApiResponse) {
  try {
    await dbConnect();
    res.status(200).json({ message: 'Database connected successfully' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Failed to connect to database' });
  }
} 