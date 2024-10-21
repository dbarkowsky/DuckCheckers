// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('duck-db');

// Create a new document in the collection.
db.getCollection('ongoingGames').insertOne({
  "_id": {
    "$oid": "222"
  },
  "players": {
    "1": null,
    "2": null
  },
  "state": 0,
  "playerTurn": 0,
  "tiles": [
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
          "player": 1,
          "colour": "#262626",
          "isKinged": true
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
      }
    ],
    [
      {
        "isRed": false,
        "x": 1,
        "y": 0,
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
          "player": 0,
          "colour": "#eb1e1e",
          "isKinged": true
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
      }
    ],
    [
      {
        "isRed": false,
        "x": 7,
        "y": 0,
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
      },
      {
        "isRed": true,
        "x": 7,
        "y": 7
      }
    ]
  ]
});
