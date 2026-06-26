const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'https://car-price-predictor-live-frontend.onrender.com')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
    })
);
app.use(express.json());

// This is the route your React app will call
app.post('/api/evaluate-car', async (req, res) => {
    const carDetails = req.body;
    console.log("📥 Received request for:", carDetails.make, carDetails.model);

    try {
        // This sends the data to your Python AI (microservice/app.py defaults to 5001)
        const pythonUrl = process.env.PYTHON_SERVICE_URL || 'https://car-price-predictor-live-python.onrender.com';
        const pythonResponse = await axios.post(pythonUrl, carDetails, { timeout: 15000 });
        
        console.log("📤 AI Valuation received!");
        res.json(pythonResponse.data);
    } catch (error) {
        const status = error?.response?.status;
        const data = error?.response?.data;
                const message = error?.message;
        console.error(
          "❌ Error talking to Python AI:",
                    status ? `HTTP ${status}` : message,
          data ? JSON.stringify(data) : ''
        );
        res.status(500).json({
          error:
            "The AI Brain is not responding (or errored). Ensure microservice/app.py is running and healthy.",
        });
    }
});

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Node Server running on http://${HOST}:${PORT}`);
});

server.on('error', (error) => {
    console.error(`❌ Failed to start Node server on http://${HOST}:${PORT}`);
    console.error(error.message);
    process.exit(1);
});
