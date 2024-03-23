import { ObjectId, UpdateResult } from 'mongodb';
import db from '../db/conn';
import { IOngoingGame } from '../interfaces/IOngoingGame';

const collection = db.collection<IOngoingGame>('ongoingGames');


export const updateGame = async (id: ObjectId, gameInfo: IOngoingGame) => {
  const updatedGame: UpdateResult<IOngoingGame> = await collection.updateOne({
    _id: id
  }, gameInfo)
  return updatedGame;
}
