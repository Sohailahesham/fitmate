require("dotenv").config(); // Load environment variables

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/userModel");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => done(null, user));
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/api/auth/google/callback",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("passport callback function fired");
      // console.log(profile);
      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value,
        });
        if (existingUser) {
          // console.log("Existing user");
          done(null, existingUser);
          return;
        }
        const newUser = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
        });
        await newUser.save();
        console.log("new user created: " + newUser);
        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "displayName"],
      scope: ["email", "public_profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("facebook callback function fired");
      const currentUser = await User.findOne({
        email: profile.emails[0].value,
      });
      if (currentUser) {
        done(null, currentUser);
        return;
      }
      const newUser = new User({
        username: profile.displayName,
        facebookId: profile.id,
        email: profile.emails[0].value,
      });
      await newUser.save();
      console.log(`new user created: ${newUser}`);
      done(null, newUser);
    }
  )
);
