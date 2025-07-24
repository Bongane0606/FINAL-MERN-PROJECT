const express = require('express');
const cors = require('cors'); // For cross-origin requests
const app = express();

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON requests

// Example API endpoint
app.get('/api/data', (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

app.post('/api/submit', (req, res) => {
  const { name, email } = req.body;
  console.log('Received:', name, email);
  res.json({ success: true });
});