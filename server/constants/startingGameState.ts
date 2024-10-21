import { IOngoingGame } from "../interfaces/IOngoingGame";
import { PlayerPosition } from "../interfaces/messages";

export const startingState: IOngoingGame = {
  state: 0,
  created: new Date(),
  playerTurn: 0,
  players: {
    0: undefined,
    1: undefined,
  },
  gameName: '',
  observers: [],
  tiles: [
    [
      {
        "isRed": true,
        "x": 0,
        "y": 0
      },
      {
        "isRed": false,
        "x": 0,
        "y": 1,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 0,
        "y": 2
      },
      {
        "isRed": false,
        "x": 0,
        "y": 3,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 0,
        "y": 4
      },
      {
        "isRed": false,
        "x": 0,
        "y": 5,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 0,
        "y": 6
      },
      {
        "isRed": false,
        "x": 0,
        "y": 7,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      }
    ],
    [
      {
        "isRed": false,
        "x": 1,
        "y": 0,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 1,
        "y": 1
      },
      {
        "isRed": false,
        "x": 1,
        "y": 2,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 1,
        "y": 3
      },
      {
        "isRed": false,
        "x": 1,
        "y": 4,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 1,
        "y": 5
      },
      {
        "isRed": false,
        "x": 1,
        "y": 6,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 1,
        "y": 7
      }
    ],
    [
      {
        "isRed": true,
        "x": 2,
        "y": 0
      },
      {
        "isRed": false,
        "x": 2,
        "y": 1,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 2,
        "y": 2
      },
      {
        "isRed": false,
        "x": 2,
        "y": 3,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 2,
        "y": 4
      },
      {
        "isRed": false,
        "x": 2,
        "y": 5,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 2,
        "y": 6
      },
      {
        "isRed": false,
        "x": 2,
        "y": 7,
        "chip": {
          "player": PlayerPosition.TWO,
          "colour": "#262626",
          "isKinged": false
        }
      }
    ],
    [
      {
        "isRed": false,
        "x": 3,
        "y": 0
      },
      {
        "isRed": true,
        "x": 3,
        "y": 1
      },
      {
        "isRed": false,
        "x": 3,
        "y": 2
      },
      {
        "isRed": true,
        "x": 3,
        "y": 3
      },
      {
        "isRed": false,
        "x": 3,
        "y": 4
      },
      {
        "isRed": true,
        "x": 3,
        "y": 5
      },
      {
        "isRed": false,
        "x": 3,
        "y": 6
      },
      {
        "isRed": true,
        "x": 3,
        "y": 7
      }
    ],
    [
      {
        "isRed": true,
        "x": 4,
        "y": 0
      },
      {
        "isRed": false,
        "x": 4,
        "y": 1
      },
      {
        "isRed": true,
        "x": 4,
        "y": 2
      },
      {
        "isRed": false,
        "x": 4,
        "y": 3
      },
      {
        "isRed": true,
        "x": 4,
        "y": 4
      },
      {
        "isRed": false,
        "x": 4,
        "y": 5
      },
      {
        "isRed": true,
        "x": 4,
        "y": 6
      },
      {
        "isRed": false,
        "x": 4,
        "y": 7
      }
    ],
    [
      {
        "isRed": false,
        "x": 5,
        "y": 0,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 5,
        "y": 1
      },
      {
        "isRed": false,
        "x": 5,
        "y": 2,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 5,
        "y": 3
      },
      {
        "isRed": false,
        "x": 5,
        "y": 4,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 5,
        "y": 5
      },
      {
        "isRed": false,
        "x": 5,
        "y": 6,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 5,
        "y": 7
      }
    ],
    [
      {
        "isRed": true,
        "x": 6,
        "y": 0
      },
      {
        "isRed": false,
        "x": 6,
        "y": 1,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 6,
        "y": 2
      },
      {
        "isRed": false,
        "x": 6,
        "y": 3,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 6,
        "y": 4
      },
      {
        "isRed": false,
        "x": 6,
        "y": 5,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 6,
        "y": 6
      },
      {
        "isRed": false,
        "x": 6,
        "y": 7,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      }
    ],
    [
      {
        "isRed": false,
        "x": 7,
        "y": 0,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 7,
        "y": 1
      },
      {
        "isRed": false,
        "x": 7,
        "y": 2,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 7,
        "y": 3
      },
      {
        "isRed": false,
        "x": 7,
        "y": 4,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 7,
        "y": 5
      },
      {
        "isRed": false,
        "x": 7,
        "y": 6,
        "chip": {
          "player": PlayerPosition.ONE,
          "colour": "#eb1e1e",
          "isKinged": false
        }
      },
      {
        "isRed": true,
        "x": 7,
        "y": 7
      }
    ]
  ]
}
