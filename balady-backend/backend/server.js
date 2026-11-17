require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not defined in .env! Using a fallback secret for local development.');
    process.env.JWT_SECRET = 'fallback_secret_for_local_dev_12345';
}


const authRoutes = require('./routes/auth');
const certRoutes = require('./routes/certificates');
const { setupSwagger } = require('./swagger');


const app = express();

const allowedOrigins = [
    'https://appbalady.vercel.app',
    'https://balabygov.vercel.app',
    'https://www.balabygov.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://admin.balady-gav-sa.com',
    'https://balady-admin.vercel.app',

];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

app.use(express.json());
// serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api', authRoutes);
app.use('/api', certRoutes);

// Swagger API Documentation
setupSwagger(app);


const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Mongo connected');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`📚 Swagger API Docs: http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(err => console.error('Mongo connection error', err));
