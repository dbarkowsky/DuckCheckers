import { AxiosError } from 'axios';
import db from '../db/conn';
import { Request, Response } from 'express';
import { IOngoingGame } from '../interfaces/IOngoingGame';
import { ObjectId, WithId, InsertOneResult } from 'mongodb';
import { startingState } from '../constants/startingGameState';
import { generateSlug } from 'random-word-slugs';

const collection = db.collection<IOngoingGame>('ongoingGames');

export const getAllOngoing = async (req: Request, res: Response) => {
  try {
    const results = await collection.find({}, {sort: {
      "created": 'desc',
    }}).toArray();
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

export const createNewOngoing = async (req: Request, res: Response) => {
  const defaultGameObject: IOngoingGame = startingState;
  interface PostBody {
    gameName?: string;
  }

  const { gameName } = req.body as PostBody;

  let cleanGameName = generateSlug(2, {
    format: 'lower',
    categories: {
      noun: ['place']
    },
    partsOfSpeech: ["adjective", "noun"]
  })

  if (gameName && gameName.length) {
    const exists = await collection.findOne({gameName: {$eq: gameName}})
    if (exists) return res.status(400).send('Game name already in use.')
    else cleanGameName = gameName;
  }

  const gameToAdd = {
    ...defaultGameObject,
    gameName: cleanGameName
  }
  try {
    const result: InsertOneResult<IOngoingGame> = await collection.insertOne(gameToAdd);
    // Did the insertion go bad?
    if (!result.insertedId) {
      return res.status(400).send('Game creation failed.')
    }
    return res.status(201).json(result);
  } catch (e: unknown) {
    return res.status(400).send(`Could not create game. Error: ${(e as AxiosError).message}`);
  }
}
