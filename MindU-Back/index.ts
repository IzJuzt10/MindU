import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db';
import authRoutes from './authRoutes';
import forgotPasswordRoutes from './forgotPasswordRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── ROUTES ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/password', forgotPasswordRoutes);

// ─── HEALTH CHECK ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '✅ MindU API is running!' });
});

// ─── START SERVER ──────────────────────────────────────────────
function startServer() {
  initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 MindU API running at http://localhost:${PORT}`);
    console.log(`📡 Auth endpoints:`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/refresh`);
    console.log(`   POST /api/auth/logout`);
    console.log(`   GET  /api/auth/me`);
    console.log(`📧 Password endpoints:`);
    console.log(`   POST /api/password/forgot`);
    console.log(`   POST /api/password/reset`);
    console.log(`   POST /api/password/send-verification`);
    console.log(`   POST /api/password/verify-email`);
  });
}

startServer();