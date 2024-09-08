const jwt = require("jsonwebtoken");

const generateToken = ({ data, tokenName }) => {
  if (
    tokenName.toUpperCase() !== "ACCESSTOKEN" &&
    tokenName.toUpperCase() !== "REFRESHTOKEN"
  ) {
    throw new Error("Invalid token name");
  }

  if (!data) {
    throw new Error("Invalid data");
  }

  if (!tokenName) {
    throw new Error("Token name is required");
  }

  if (tokenName.toUpperCase() === "ACCESSTOKEN") {
    return jwt.sign(data, process.env.ACCESS_TOKEN_KEY, { expiresIn: "15m" });
  } else {
    return jwt.sign(data, process.env.REFRESH_TOKEN_KEY, { expiresIn: "365d" });
  }
};

module.exports = generateToken;
