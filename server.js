const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
require('dotenv').config();

// สร้างแอพ Express
const app = express();
const PORT = process.env.PORT || 3000;

// ตั้งค่าการใช้ Passport และ Session
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL || "https://test-3x2s.onrender.com/auth/github/callback",  // ใช้ process.env สำหรับการตั้งค่า callback URL
},
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// ใช้ express-session สำหรับจัดการ session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } 
}));

// ใช้ Passport สำหรับการ authenticate
app.use(passport.initialize());
app.use(passport.session());

// ให้ไฟล์ HTML และ CSS
app.use(express.static('public'));

// Route สำหรับ login ผ่าน GitHub
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// Route callback หลังจาก login สำเร็จ
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/search');
  }
);

// Route สำหรับหน้า index
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Route สำหรับหน้า search
app.get('/search', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.sendFile(__dirname + '/public/search.html');
});

// Route สำหรับ logout
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
