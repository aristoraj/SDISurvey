import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();

// Allow requests from frontend (GitHub Pages) and local dev
const ALLOWED = [
  'https://aristoraj.github.io',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || ALLOWED.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
}));

app.use(express.json());
app.use('/api', apiRouter);

// Root ping
app.get('/', (_req, res) => res.json({ service: 'SDI Survey API', status: 'running' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SDI Survey API listening on port ${PORT}`);
  console.log(`Zoho owner: ${process.env.ZOHO_OWNER || 'straydoginstitute'}`);
  console.log(`Zoho app:   ${process.env.ZOHO_APP   || 'stray-dog-institute'}`);
});
