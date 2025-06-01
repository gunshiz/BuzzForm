import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import compression from 'compression';
import submitAPI from './api/submit.js';
import { startBot } from './discord/bot.js';

const app = express();
const PORT = parseInt(process.env.PORT || "3000");

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(compression());

app.set("trust proxy", true);
app.use(express.static(path.join(__dirname, "src")));

app.use('/api/submit', submitAPI);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Start bot
if (!process.argv.includes("--no-bot")) startBot();