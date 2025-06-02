import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import path from "path";
import compression from "compression";
import submitApi from "./api/submit.js";
import { startBot } from "./discord/bot.js";
import notificationApi from "./api/ntf.ts";
import minify from "express-minify";

const app = express();
const PORT = parseInt(process.env.PORT || "3000");

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(compression());
// Fix nested CSS
app.use(function (req, res, next) {
  if (/\/admin\/style.css$/.test(req.url)) {
    res.minifyOptions = res.minifyOptions || {};
    res.minifyOptions.minify = false;
  }
  next();
});
app.use(minify());

app.set("trust proxy", true);
app.use(express.static(path.join(__dirname, "src")));

app.use("/api/submit", submitApi);
app.use("/api/ntf", notificationApi);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Start bot
if (!process.argv.includes("--no-bot")) startBot();

export { app };