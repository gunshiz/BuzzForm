import fs from "fs";
import path from "path";
import db from './db.js';

export default (req, res) => {
  const submissionsPath = path.join(__dirname, "submissionsData.json");
  if (!fs.existsSync(submissionsPath)) {
    return res.json([]);
  }

  const submissions = JSON.parse(fs.readFileSync(submissionsPath));
  res.json(submissions);
};
