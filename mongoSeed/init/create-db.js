// Used to seed local MongoDB containers for testing and development.

db = new Mongo().getDB('duck-db');

db.createCollection("ongoingGames", { capped: false });
db.createCollection("completedGames", { capped: false });
db.createCollection("users", { capped: false });
