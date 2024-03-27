import express from "express";
import "dotenv/config";
import { DataRouter } from "./data-router";

const app = express();
const port = 3001;

app.use("/", DataRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
