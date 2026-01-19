import express from "express";
import { logger } from "./middlewares/middlewares.js";
import authRouter from "./routes/authrouter.js";
import dataRouter from "./routes/datarouter.js";
import passport from "passport";
import "./passport/passport.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import path from 'path';
import groupRouter from "./routes/grouprouter.js";
import forumRouter from "./routes/forumrouter.js";
import userReportRouter from "./routes/userReportRouter.js";
import sysadminRouter from "./routes/sysadmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed CORS origins. Can be configured via `CORS_ORIGINS` env var (comma-separated).
const defaultOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://acad-net.vercel.app",
  "https://crishav.com.np",
  "http://crishav.com.np",
];
const allowedOrigins = (process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : defaultOrigins);
const PORT = process.env.BACKEND_PORT || 3000;

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'AcadNet',
      version: '1.0.0',
      description: 'API documentation for AcadNet',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
        },
      },
    },
  },
  apis: [__dirname + '/routes/*.js'], // Path to your API docs
};

const app = express();

// Public health endpoint (always accessible) — allow any origin for this route
app.options('/health', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.sendStatus(204);
});

app.get('/health', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS']
  })
);

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cookieParser());
app.use(express.json());

// Serve static files from resources directory
app.use('/resources', express.static(path.join(__dirname, '../resources')));

app.use(logger);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/data", dataRouter);
app.use("/api/v1/group",groupRouter)
app.use("/api/v1/forum", forumRouter);
app.use("/api/v1/reports", userReportRouter);
app.use("/api/v1/sysadmin", sysadminRouter);

app.use(passport.initialize());

// (health endpoint is defined above and intentionally permissive)



export default app;
