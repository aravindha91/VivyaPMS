const jwt = require("jsonwebtoken");
const responseSend = require("../config/response");
module.exports = {
  validateToken: function (req, res, next) {
    const authorizationHeaader = req.headers.authorization;
    let result;
    if (authorizationHeaader) {
      const token = req.headers.authorization.split(" ")[1]; // Bearer <token>
     // console.log("######TOKEN########",{authorizationHeaader})
      const options = {algorithm: "HS256"};
      try {
        // verify makes sure that the token hasn't expired and has been issued by us
        result = jwt.verify(token, process.env.JWT_SECRET, options);

        // Let's pass back the decoded token to the request object
        req.userDetails = result.userDetails;
        // We call next to pass execution to the subsequent middleware
        next();
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
        console.log(err);
        responseSend.res(res, 500, false, { msg: "Internal server error" });
        throw new Error(err);
      }
    } else {
      responseSend.res(res, 401, false, { msg: "Authentication error" });
    }
  },
  validateTokenGet: function (req, res, next) {
    const authorizationHeaader = req.query.token;
    let result;
    if (authorizationHeaader) {
      const token = authorizationHeaader; //<token>
      const options = {algorithm: "HS256"};
      try {
        // verify makes sure that the token hasn't expired and has been issued 4by us
        result = jwt.verify(token, process.env.JWT_SECRET, options);

        // Let's pass back the decoded token to the request object
        req.userDetails = result.userDetails;
        // We call next to pass execution to the subsequent middleware
        next();
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
        console.log(err);
        responseSend.res(res, 500, false, { msg: "Internal server error" });
        throw new Error(err);
      }
    } else {
      responseSend.res(res, 401, false, { msg: "Authentication error" });
    }
  }
};
