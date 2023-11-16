import { AxiosError } from 'axios';
import db from '../db/conn';
import { Request, Response } from 'express';
import { IOngoingGame } from '../interfaces/IOngoingGame';
import { ObjectId, WithId } from 'mongodb';

const collection = db.collection<IOngoingGame>('ongoingGames');

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

export const getOneOngoing = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(400).send('Parameter id not provided.');

  try {
    const result: WithId<IOngoingGame> | null = await collection.findOne({ _id: { $eq: new ObjectId(id) } });
    if (!result || result === null) {
      return res.status(404).send('No game with that id found.')
    }
    return res.status(200).json(result);
  } catch (e: unknown) {
    return res.status(400).send(`Cannot retrieve ongoing game. Error: ${(e as AxiosError).message}`);
  }
}
