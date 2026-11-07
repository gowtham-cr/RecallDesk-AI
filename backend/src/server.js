const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const memoryRoutes = require('./routes/memoryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/memory', memoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'RecallDesk AI Backend',
    timestamp: new Date().toISOString()
  });
});

// Start server when executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`RecallDesk AI server running on port ${PORT}`);
  });
}

module.exports = app;

