import express from "express";
import Database, { KV } from "./db.js";
import { sendToDiscord } from "../discord/webhook.js";
import config from "../discord/config.json" assert { type: "json" };
import path from "path";
import { pub } from "./ntf.js";
import { EventEmitter } from "events";

const db = new Database(path.join(__dirname, "submissions.db"));
const limit = new KV(path.join(__dirname, "limit.db"));
const router = express.Router();
const ev = new EventEmitter();

router.all("/", (req, res, next) => {
  if (req.headers["x-bot-token"] === config.botTokenSecret) return next();
  else if (req.method === "POST" && !db.getAll().find((e) => e.ip === req.ip))
    return next();
  else if (req?.cookies?.auth === process.env.ADMIN_AUTH) req.next();
  else if (req?.headers?.authorization === process.env.ADMIN_AUTH) {
    res.cookie("auth", process.env.ADMIN_AUTH);
    req.next();
  } else res.status(401).json({ error: "Unauthorized" });
});

router.post("/", (req, res) => {
  const { name, uid, character, message } = req.body;
  if (!name || !uid || !character)
    return res.status(400).json({ error: "Missing required fields" });
  if (limit.get("disabled"))
    return res.status(403).json({ error: "ตอนนี้ยังไม่รับข้อมูลเพิ่มเติม" });
  if (limit.get("max") && db.getAll().length >= limit.get("max"))
    return res.status(403).json({ error: "ตอนนี้คำขอเต็มแล้ว" });
  if (name.length > 50 || name.length < 1)
    return res.status(400).json({ error: "ชื่อยาวเกินไป" });
  if (uid.length > 15 || uid.length < 7)
    return res.status(400).json({ error: "UID สั้นหรือยาวเกินไป" });
  if (!/^[0-9 ]+$/.test(uid))
    return res.status(400).json({ error: "UID ต้องเป็นตัวเลขเท่านั้น!" });
  if (character.length > 50 || character.length < 3)
    return res.status(400).json({ error: "ชื่อตัวละครสั้นหรือยาวเกินไป" });
  if (message.length > 4000)
    return res.status(400).json({ error: "ข้อความที่จะส่งยาวเกินไป" });

  db.add({ name, uid, character, message, ip: req.ip });
  if (!process.argv.includes("--no-bot"))
    sendToDiscord({ name, uid, character, message });
  pub(name);
  res.status(200).json({ message: "Submission received" });
});

router.get("/", (req, res) => {
  res.json(db.getAll());
});

router.delete("/", (req, res) => {
  db.clearDB();
  res.status(200).json({ message: "All submissions deleted" });
});

router.get("/limit", (req, res) => {
  const config = { max: null, disabled: false, ...limit.getAll() };
  res.json(config);
});
router.post("/limit", (req, res) => {
  const { max, disabled } = req.body;
  limit.saveDB({ max, disabled });
  res.status(200).json({ message: "Limit configuration updated" });
});

router.get("/watch", (req, res) => {
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendData = () => {
    res.write(`event: reload\ndata: ${JSON.stringify(db.getAll())}\n\n`);
  };

  sendData();
  ev.on("update", sendData);

  req.on("close", () => {
    ev.removeListener("update", sendData);
    res.end();
  });
});

export default router;
