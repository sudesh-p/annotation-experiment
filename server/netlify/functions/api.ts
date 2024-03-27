import express from "express";
import serverless from "serverless-http";
import { DataRouter } from "../../data-router";

const api = express();

api.use("/api/", DataRouter);

export const handler = serverless(api);
