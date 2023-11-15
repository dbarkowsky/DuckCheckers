import { ServerWebSocket } from 'bun';
import { getAllOngoing } from './controllers/ongoingGames';
import express, { RequestHandler,NextFunction, Response } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app: express.Application = express();

const { TESTING, BACKEND_URL, FRONTEND_URL } = Bun.env;

// Swagger Configuration
const swaggerURL = `${BACKEND_URL}/api`;
const OPENAPI_OPTIONS = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Duck Checkers',
      version: '1.0.0',
      description: '',
    },
    servers: [{ url: swaggerURL }],
  },
  apis: ['./docs/*.yaml'],
};

// Express Rate Limiter Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// CORS Configuration
// Localhost does not need to be specified.
const corsOptions = {
  origin: [
    FRONTEND_URL ?? 'http://localhost:8080', // Frontend or local
  ],
  credentials: true,
};

// Incoming CORS Filter
app.use(cors(corsOptions));

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(morgan('dev')); // logging middleware

// Set headers for response
const HeaderHandler: unknown = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  next();
};
app.use('/api', HeaderHandler as RequestHandler);

// Use rate limiter if not testing
if (!TESTING) app.use(limiter);

// Swagger service route
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(OPENAPI_OPTIONS)));


// Other Routes
app.get('/ongoing', getAllOngoing);

// app.ws('/ws', {
//   message(ws, message) {
//     console.log(`Message: ${ws.id}@${ws.remoteAddress} sends ${message}`);
//     // Send message to all connections in the list.
//     connections.forEach((conn) => {
//       conn.send(message);
//     });
//   },
//   open(ws) {
//     console.log(`Connected: ${ws.id}@${ws.remoteAddress}`);
//     ws.send('Hello');
//     // Add the connection to the list
//     connections.push(ws);
//   },
//   close(ws, code, message) {
//     ws.send('Goodbye');
//     console.log(`Disconnected: ${ws.id}@${ws.remoteAddress}`);
//     // Remove the connection from the list
//     connections.splice(
//       connections.findIndex((conn) => conn.id === ws.id),
//       1,
//     );
//   },
// });

export default app;
