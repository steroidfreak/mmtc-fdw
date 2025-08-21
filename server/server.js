const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/helpers', require('./routes/helpers'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 👉 add this:
app.use('/api/admin', require('./routes/admin'));

const port = process.env.PORT || 4000;
connectDB().then(() => {
    app.listen(port, () => console.log(`API running on ${port}`));
}).catch(err => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
});
