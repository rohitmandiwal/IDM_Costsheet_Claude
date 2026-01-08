import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import { connectDB } from './config/database';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Connect to the database
connectDB();

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('IDM Cost Sheet Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
