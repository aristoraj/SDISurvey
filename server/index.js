import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Timestamp helpers ────────────────────────────────────────────────────────
export function ts() {
  return new Date().toISOString();
}
export function log(level, ...args) {
  console.log(`[${ts()}] [${level.toUpperCase()}]`, ...args);
}

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();

// HTTP access log
morgan.token('ts', ts);
app.use(morgan('[:ts] :method :url :status :res[content-length]b — :response-time ms', {
  stream: { write: msg => process.stdout.write(msg) },
}));

// ── CORS (only needed for local dev — same origin in production) ─────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = ['http://localhost:5173', 'http://localhost:5174'];
    if (allowed.includes(origin) || origin.endsWith('.onrender.com')) return cb(null, true);
    log('warn', `CORS blocked: ${origin}`);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
}));

app.use(express.json());

// ── API routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── Serve React frontend (production build) ──────────────────────────────────
const DIST = path.join(__dirname, '../dist');
app.use(express.static(DIST));

// SPA catch-all — every non-API route serves index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  log('error', `${req.method} ${req.path} —`, err.message);
  if (err.stack) log('error', err.stack);
  res.status(500).json({ error: err.message });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  log('info', `SDI Survey listening on port ${PORT}`);
  log('info', `Zoho owner : ${process.env.ZOHO_OWNER || 'straydoginstitute'}`);
  log('info', `Zoho app   : ${process.env.ZOHO_APP   || 'stray-dog-institute'}`);
  log('info', `Serving frontend from: ${DIST}`);
});
