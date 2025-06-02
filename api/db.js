import fs from 'fs';
import path from 'path';

class Database {
  constructor(dbFile) {
    this.dbFile = dbFile || path.join(process.cwd(), 'api', 'data.json');
  }

  loadDB() {
    if (!fs.existsSync(this.dbFile)) {
      fs.writeFileSync(this.dbFile, JSON.stringify([]));
    }
    const data = fs.readFileSync(this.dbFile, "utf-8");
    return JSON.parse(data);
  }

  saveDB(data) {
    fs.writeFileSync(this.dbFile, JSON.stringify(data, null, 2));
  }

  getAll() {
    return this.loadDB();
  }

  add(entry) {
    const db = this.loadDB();
    db.push(entry);
    this.saveDB(db);
  }

  clearDB() {
    this.saveDB([]);
  }

  remove(i) {
    const db = this.loadDB();
    if (i < 0 || i >= db.length) {
      throw new Error("Index out of bounds");
    }
    db.splice(i, 1);
    this.saveDB(db);
  }
}

class KV {
  constructor(dbFile) {
    this.dbFile = dbFile || path.join(process.cwd(), "api", "data.json");
  }

  loadDB() {
    if (!fs.existsSync(this.dbFile)) {
      fs.writeFileSync(this.dbFile, JSON.stringify({}));
    }
    const data = fs.readFileSync(this.dbFile, "utf-8");
    return JSON.parse(data);
  }

  saveDB(data) {
    fs.writeFileSync(this.dbFile, JSON.stringify(data, null, 2));
  }

  getAll() {
    return this.loadDB();
  }

  set(key, entry) {
    const db = this.loadDB();
    db[key] = entry;
    this.saveDB(db);
  }

  get(key) {
    const db = this.loadDB();
    return db[key];
  }

  clearDB() {
    this.saveDB({});
  }

  remove(i) {
    const db = this.loadDB();
    if (i < 0 || i >= db.length) {
      throw new Error("Index out of bounds");
    }
    db.splice(i, 1);
    this.saveDB(db);
  }
}

export default Database;
export { KV };