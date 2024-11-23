import { MongoClient } from 'mongodb';

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_PORT, MONGO_SERVICE, MONGO_DATABASE, CONTAINERIZED, MONGO_URL } =
  process.env;

// Changing where to look for Mongo
const MONGO_HOSTNAME = CONTAINERIZED ? MONGO_SERVICE : 'localhost';

console.log(`Connecting to: mongodb`)

// Create connection client
const client: MongoClient = new MongoClient(MONGO_URL ?? 
  `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}`,
);

// Attempt connection
(async () => {
  await client
    .connect()
    .then(() => {
      // tslint:disable-next-line:no-console
      console.log(`MongoDB connected on port ${MONGO_PORT}.`);
    })
    .catch((e) => {
      // tslint:disable-next-line:no-console
      console.error(`Error connecting to MongoDB. \nDetails: ${e}`);
    });
})();

// Select database
const db = client.db(MONGO_DATABASE);

export default db;
