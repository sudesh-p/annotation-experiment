import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors()); // For parsing application/json

app.get("/", (req, res) => {
  res.send(
    "Welcome to the Annotation Interface Backend!! Server is running and ready to accept requests."
  );
});

app.get("/is-completed", (req, res) => {
  const { name } = req.query;

  const filename = `${name}_questions.json`;
  const filePath = path.join(__dirname, "output", filename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(200).send("false");
      return;
    }
    res.status(200).send("true");
  });
});

app.post("/create-file", (req, res) => {
  const { name, questions } = req.body;
  const filename = `${name}_questions.json`;

  const filePath = path.join(__dirname, "output", filename);

  // Write the questions to the file
  fs.writeFile(
    filePath,
    JSON.stringify(questions, null, 2),
    {
      flag: "w+",
      encoding: "utf8",
    },
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        res.status(500).send("Error saving data");
        return;
      }
      // Respond to the client that the data was successfully saved
      res.status(200).send("Data saved successfully");
    }
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
