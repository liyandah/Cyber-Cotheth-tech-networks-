/**
 * CCTN Express server — serves static site and Sporting API.
 */
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
const ROOT = path.join(__dirname, '..');

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

app.use(express.static(ROOT, { index: 'index.html' }));

app.use((req, res) => {
  res.status(404).sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`CCTN server running at http://${HOST}:${PORT}`);
  console.log('Sporting: http://' + HOST + ':' + PORT + '/sporting/');
  console.log('Admin: http://' + HOST + ':' + PORT + '/sporting/admin/login.html');
});
