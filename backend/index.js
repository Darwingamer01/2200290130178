const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Sample API endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Restaurant API!');
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
