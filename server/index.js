/**
 * CCTN Express server — serves static site and Sporting API.
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');

require('./db');

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = path.resolve(__dirname, '..');
const MAIN_INDEX = path.join(ROOT, 'index.html');
const SPORTING_INDEX = path.join(ROOT, 'sporting', 'index.html');
const ADMIN_LOGIN = path.join(ROOT, 'sporting', 'admin', 'login.html');

function sendExistingFile(res, filePath) {
  if (!fs.existsSync(filePath)) {
    res.status(500).json({
      success: false,
      error: 'Static file not found on server.',
      filePath,
    });
    return;
  }
  res.sendFile(filePath);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: 'cctn.sid',
    secret: process.env.SESSION_SECRET || 'cctn-sporting-test-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use('/api', authRoutes);
app.use('/api', walletRoutes);
app.use('/api', adminRoutes);

app.get('/healthz', (req, res) => {
  res.json({
    success: true,
    cwd: process.cwd(),
    root: ROOT,
    files: {
      mainIndex: fs.existsSync(MAIN_INDEX),
      sportingIndex: fs.existsSync(SPORTING_INDEX),
      adminLogin: fs.existsSync(ADMIN_LOGIN),
    },
  });
});

app.get('/', (req, res) => {
  sendExistingFile(res, MAIN_INDEX);
});

app.get('/sporting', (req, res) => {
  sendExistingFile(res, SPORTING_INDEX);
});

app.get('/sporting/', (req, res) => {
  sendExistingFile(res, SPORTING_INDEX);
});

app.get('/sporting/admin', (req, res) => {
  sendExistingFile(res, ADMIN_LOGIN);
});

app.get('/sporting/admin/', (req, res) => {
  sendExistingFile(res, ADMIN_LOGIN);
});

app.use(express.static(ROOT, { index: 'index.html' }));

app.use((req, res) => {
  res.status(404).sendFile(MAIN_INDEX, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        error: 'Route not found.',
        path: req.originalUrl,
        root: ROOT,
      });
    }
  });
});

app.listen(PORT, HOST, () => {
  console.log(`CCTN server running at http://${HOST}:${PORT}`);
  console.log('Sporting: http://' + HOST + ':' + PORT + '/sporting/');
  console.log('Admin: http://' + HOST + ':' + PORT + '/sporting/admin/login.html');
  console.log('Working directory:', process.cwd());
  console.log('Static root:', ROOT);
  console.log('Main index exists:', fs.existsSync(MAIN_INDEX));
  console.log('Sporting index exists:', fs.existsSync(SPORTING_INDEX));
  console.log('Admin login exists:', fs.existsSync(ADMIN_LOGIN));
});
