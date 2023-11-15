import express from 'express';
import { ongoingGamesController } from '../controllers'

const ongoingGamesRouter = express.Router();

ongoingGamesRouter.route('/ongoing').get(ongoingGamesController.getAllOngoing)

export default ongoingGamesRouter;
