import cors from "cors";
import express, { Router } from "express";
import { createClient } from "@supabase/supabase-js";

export const DataRouter = Router();

DataRouter.use(express.json());
DataRouter.use(cors()); // For parsing application/json

const supabase = createClient(
  process.env.SUPABASE_URL ? process.env.SUPABASE_URL : "",
  process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY : ""
);

DataRouter.get("/is-completed", async (req, res) => {
  const { name } = req.query;

  const filename = `${name}_questions.json`;

  const { data } = supabase.storage.from("data").getPublicUrl(filename);

  const response = await fetch(data.publicUrl, {
    method: "get",
  });

  console.log(response.ok, response.status, data.publicUrl);

  if (response.ok) {
    res.status(200).send(true);
    return;
  } else {
    res.status(200).send(false);
    return;
  }
});

DataRouter.post("/create-file", async (req, res) => {
  const { name, questions } = req.body;
  const filename = `${name}_questions.json`;

  const { data, error } = await supabase.storage
    .from("data")
    .upload(filename, JSON.stringify(questions));

  console.log(data, error);

  if (error) {
    res.status(500).send("Error");
    return;
  } else {
    res.status(200).send("Success");
    return;
  }
});
