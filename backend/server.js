const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (useful for Kubernetes probes later)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Welcome endpoint - this is what Vue will call
app.get('/api/welcome', (req, res) => {
  res.json({
    message: 'Welcome from Node.js Backend! 🚀',
    timestamp: new Date().toISOString(),
    pod: process.env.HOSTNAME || 'local', // Will show the pod name in K8s
  });
});

// Root endpoint (just for sanity checking)
app.get('/', (req, res) => {
  res.send('Backend is running. Try /api/welcome');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});