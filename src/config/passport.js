// src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const { encrypt } = require('./crypto');
const jwt = require('jsonwebtoken');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://nfcapi.zapto.org/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          });
        }

        if (refreshToken) {
          const encryptedToken = encrypt(refreshToken);
          user.refreshToken = encryptedToken;

          await user.save();
        }
        const payload = {
          id: user.id,
          googleId: user.googleId,
          email: user.email,
          name: user.name,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '1h', 
        });

        return done(null, { user, token });
      } catch (err) {
        console.error('Erro na função de verificação do Passport:', err);
        return done(err, null);
      }
    }
  )
);
module.exports = passport;
