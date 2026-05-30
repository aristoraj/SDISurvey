import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRouter from './routes/api.js';

// ── Timestamp helper ─────────────────────────────────────────────────────────
export function ts() {
  return new Date().toISOString();
}

export function log(level, ...args) {
  console.log(`[${ts()}] [${level.toUpperCase()}]`, ...args);
}

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();

// HTTP access log — every request logged with method, path, status, response time
morgan.token('ts', ts);
app.use(morgan('[:ts] :method :url :status :res[content-length]b — :response-time ms', {
  stream: { write: msg => process.stdout.write(msg) },
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED = [
  'https://sdi-survey-frontend.onrender.com',
  'https://aristoraj.github.io',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl / Postman / server-to-server
    if (ALLOWED.includes(origin) || origin.endsWith('.onrender.com')) {
      return cb(null, true);
    }
    log('warn', `CORS blocked origin: ${origin}`);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
}));

app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

app.get('/', (_req, res) => {
  res.json({ service: 'SDI Survey API', status: 'running', ts: ts() });
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
  log('info', `SDI Survey API listening on port ${PORT}`);
  log('info', `Zoho owner : ${process.env.ZOHO_OWNER || 'straydoginstitute'}`);
  log('info', `Zoho app   : ${process.env.ZOHO_APP   || 'stray-dog-institute'}`);
  log('info', `Allowed origins: ${ALLOWED.join(', ')}`);
});
