const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const submissionsPath = path.join(__dirname, "submissionsData.json");
  if (!fs.existsSync(submissionsPath)) {
    return res.json([]);
  }

  const submissions = JSON.parse(fs.readFileSync(submissionsPath));
  res.json(submissions);
};
