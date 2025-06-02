import express from "express";
import webpush, { PushSubscription, WebPushError } from "web-push";
import { join } from "path";
import {
  privateKey,
  publicKey,
} from "../notification.json" assert { type: "json" };
import Database from "./db";

const r = express.Router();
const db = new Database(join(__dirname, "subscriptions.db"));
webpush.setVapidDetails("mailto:gunshiz@dgnr.us", publicKey, privateKey);

r.post("/sub", (req, res): any => {
  if (!req.body || !req.body?.endpoint)
    return res.status(400).json({ error: "Invalid subscription data" });
  if (
    db.getAll().some((s: PushSubscription) => s.endpoint === req.body.endpoint)
  )
    return res.status(409).json({ error: "Already subscribed" });
  const sub = req.body;
  db.add(sub);
  res.json({ success: true });
});
r.get("/public_key", (req, res) => {
  res.json(publicKey);
});

function pub(name: string) {
  const subs: PushSubscription[] = db.getAll();
  var offset = 0;
  subs.forEach((sub, i) =>
    webpush
      .sendNotification(sub, JSON.stringify({ body: "From " + name }))
      .catch(
        (e: WebPushError) =>
          (e?.statusCode === 404 && db.remove(i - offset)) || offset++
      )
  );
}

export default r;
export { pub };
