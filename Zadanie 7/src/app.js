const express = require('express');
const passport = require('passport');
const OrcidStrategy = require('passport-orcid');
const session = require('express-session');

const app = express();

app.use(session({ secret: 'secret-key', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new OrcidStrategy({
    passReqToCallback: true,
    session: false,
    authorizationURL: 'https://orcid.org/oauth/authorize',
    tokenURL: 'https://pub.orcid.org/oauth/token',
    scope: '/authenticate',
    clientID: "NIEPODAM",
    clientSecret: "NIEPODAM",
    callbackURL: 'http://127.0.0.1:3000/auth/callback'
  },
  function(access_token, refresh_token, params, name, orcid, done){            
    const user = {
        orcid: name.orcid,
        displayName: name.name,
      };

      return done(null, user);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/', (req, res) => {
  res.send('Welcome! <a href="/auth">Login with ORCID</a>');
});

app.get('/auth',
  passport.authenticate('orcid', { scope: '/authenticate' })
);

app.get('/auth/callback',
  passport.authenticate('orcid', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`<h1>Profile</h1>
    <p>Welcome, ${req.user.displayName}!</p>
    <p>Your ORCID ID: ${req.user.orcid}</p>
    <p><a href="/logout">Logout</a></p>`);
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});