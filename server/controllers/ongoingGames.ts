import db from '../db/conn';
import { Context } from 'elysia';

const collection = db.collection('ongoingGames');

export const getAllOngoing = async ({ set }: Context) => {
  try {
    const results = await collection.find({}).toArray();
    if (results.length === 0) {
      set.status = 404;
      return 'No ongoing games found.';
    }
    set.status = 200;
    return results;
  } catch {
    set.status = 400;
    return 'Cannot retrieve ongoing games.';
  }
};
