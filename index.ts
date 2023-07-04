import express from "express";

const app = express();
app.listen(3000, "localhost", 1, () => console.log("Listening on localhost:3000"));