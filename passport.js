const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const passport = require("passport");

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require("./config");

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/google/callback",
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
