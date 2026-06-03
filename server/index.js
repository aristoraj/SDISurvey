import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';
import { validateTokenOnStartup } from './lib/zohoAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
// dist is always at repo root, one level up from server/
const DIST       = path.resolve(__dirname, '..', 'dist');

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
  const distExists = fs.existsSync(path.join(DIST, 'index.html'));
  log(distExists ? 'info' : 'error', `dist/index.html ${distExists ? '✅ found' : '❌ NOT FOUND — was the frontend built?'}`);

  // Validate Zoho credentials on startup — logs clear error if scopes/token are wrong
  validateTokenOnStartup();
});
