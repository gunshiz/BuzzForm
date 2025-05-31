const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "data.json");

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getAll() {
  return loadDB();
}

function add(entry) {
  const db = loadDB();
  db.push(entry);
  saveDB(db);
}

function findByUid(uid) {
  const db = loadDB();
  return db.find((e) => e.uid === uid);
}

function updateByUid(uid, updates) {
  const db = loadDB();
  const idx = db.findIndex((e) => e.uid === uid);
  if (idx !== -1) {
    db[idx] = { ...db[idx], ...updates };
    saveDB(db);
    return db[idx];
  }
  return null;
}

function removeByUid(uid) {
  let db = loadDB();
  const initialLen = db.length;
  db = db.filter((e) => e.uid !== uid);
  if (db.length !== initialLen) {
    saveDB(db);
    return true;
  }
  return false;
}

function clearDB() {
  saveDB([]);
}

module.exports = {
  getAll,
  add,
  findByUid,
  updateByUid,
  removeByUid,
  clearDB,
};
