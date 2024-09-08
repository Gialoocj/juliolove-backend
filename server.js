const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routers/auth.router.js");

dotenv.config();
app.use(
  cors({
    origin: "*",
  })
);

app.use(cors());
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(() => {
  console.log("Connect to MongoDB successfully");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api/v1/auth/", authRouter);
