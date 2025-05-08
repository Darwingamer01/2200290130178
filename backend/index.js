const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Backend API');
});

app.get('/api/names', (req, res) => {
    res.json(['Alice', 'Bob', 'Charlie']); // Example names, replace with your database or dynamic data
});

app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
