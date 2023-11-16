import express from 'express';
import { ongoingGamesController } from '../controllers'

const ongoingGamesRouter = express.Router();

ongoingGamesRouter.route('/ongoing')
  .get(ongoingGamesController.getAllOngoing)
  .post(ongoingGamesController.createNewOngoing);

ongoingGamesRouter.route('/ongoing/:id')
  .get(ongoingGamesController.getOneOngoing);

export default ongoingGamesRouter;
