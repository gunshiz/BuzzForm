const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const submitAPI = require('./api/submit');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Cloudflare tunnel IP filtering support
app.set("trust proxy", true);

// Serve static files from buzz folder (this folder itself)
app.use(express.static(path.join(__dirname, "src")));

// API routes under /api/submit
app.use('/api/submit', submitAPI);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
