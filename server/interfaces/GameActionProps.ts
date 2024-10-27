import { Condition, ObjectId, WithId } from "mongodb";
import { DuckSocket } from "..";
import { IOngoingGame } from "./IOngoingGame";
import { BaseMessage } from "./messages";

export interface GameActionProps { 
  gameId: Condition<ObjectId>;
  existingGame: WithId<IOngoingGame>;
  socket: DuckSocket;
  message: BaseMessage;
}
