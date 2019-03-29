const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const db = require("./dbconnection");
const keys = require("./keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrkey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      let sql =
        "SELECT * from COORDINATOR where corEmail=" +
        db.escape(jwt_payload.email);
      db.query(sql, (err, result) => {
        if (err) return err;
        else if (result.length > 0) {
          return done(null, jwt_payload);
        } else {
          sql =
            "SELECT * from EVALUATOR where evalEmail=" +
            db.escape(jwt_payload.email);
          db.query(sql, (err, result) => {
            if (err) return err;
            else if (result.length > 0) {
              return done(null, jwt_payload);
            } else return done(null, false);
          });
        }
      });
    })
  );
};
