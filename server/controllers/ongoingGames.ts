import { AxiosError } from 'axios';
import db from '../db/conn';
import { Request, Response } from 'express';

const collection = db.collection('ongoingGames');

export const getAllOngoing = async (req: Request, res: Response) => {
  try {
    const results = await collection.find({}).toArray();
    if (results.length === 0) {
      return res.status(404).send('No ongoing games found.');
    }
    return res.status(200).json(results);
  } catch (e: unknown) {
    return res.status(400).send(`Cannot retrieve ongoing games. Error: ${(e as AxiosError).message}`);
  }
};
