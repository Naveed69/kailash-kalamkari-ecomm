const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("hello node");
});

app.listen(port, () => {
  console.log("Server started to listen at port:", port);
});
