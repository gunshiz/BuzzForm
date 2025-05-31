const express = require("express");
const router = express.Router();
const { add, getAll, clearDB } = require("./db");

router.all("/", (req, res) => {
  if (req.method === "POST" && !getAll().find((e) => e.ip === req.ip))
    req.next();
  else if (req?.cookies?.auth === process.env.ADMIN_AUTH) req.next();
  else if (req?.headers?.authorization === process.env.ADMIN_AUTH) {
    res.cookie("auth", process.env.ADMIN_AUTH);
    req.next();
  } else res.status(401).json({ error: "Unauthorized" });
});

router.post("/", (req, res) => {
  const { name, uid, character, message } = req.body;
  if (!name || !uid || !character) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if(name.length > 50)
    return res.status(400).json({ error: "Name is too long" });
  if(uid.length > 15)
    return res.status(400).json({ error: "UID is too long" });
  if(character.length > 50)
    return res.status(400).json({ error: "Character name is too long" });
  if(message.length > 4000)
    return res.status(400).json({ error: "Message is too long" });
  
  // Store exactly what client sent, including uid
  add({ name, uid, character, message, ip: req.ip });
  res.status(200).json({ message: "Submission received" });
});

router.get("/", (req, res) => {
  res.json(getAll()); // return all submissions exactly as stored
});

// Delete all submissions
router.delete("/", (req, res) => {
  clearDB();
  res.status(200).json({ message: "All submissions deleted" });
});

module.exports = router;
