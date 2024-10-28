// src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

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
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'https://nfcapi.zapto.org/auth/google/callback',
      },

      
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Access Token:', accessToken);
          console.log('Refresh Token:', refreshToken);
          console.log('Profile:', profile);
  
          // Procure um usuário existente
          let user = await User.findOne({ where: { googleId: profile.id } });
  
          if (!user) {
            // Crie um novo usuário
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            });
            console.log('Usuário criado:', user);
          } else {
            console.log('Usuário encontrado:', user);
          }
  
          return done(null, user);
        } catch (err) {
          console.error('Erro na função de verificação do Passport:', err);
          return done(err, null);
        }
      }
    )
  );
  

module.exports = passport;
