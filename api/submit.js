import express from "express";
import { add, getAll, clearDB } from "./db.js";
import { sendToDiscord } from "../discord/webhook.js";
import config from '../discord/config.json' assert { type: "json" };

const router = express.Router();

router.all("/", (req, res, next) => {
  if (req.headers['x-bot-token'] === config.botTokenSecret) return next();
  else if (req.method === "POST" && !getAll().find((e) => e.ip === req.ip)) return next();
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

  add({ name, uid, character, message, ip: req.ip });
  sendToDiscord({ name, uid, character, message });
  res.status(200).json({ message: "Submission received" });
});

router.get("/", (req, res) => {
  res.json(getAll());
});

router.delete("/", (req, res) => {
  clearDB();
  res.status(200).json({ message: "All submissions deleted" });
});

export default router;
