const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001; 

app.use(express.json());
app.use(cors()); // For parsing application/json

app.get('/', (req, res) => {
    res.send('Welcome to the Annotation Interface Backend!! Server is running and ready to accept requests.');
  });

app.post('/create-file', (req, res) => {
  const { name, questions } = req.body;
  const filename = `${name}_questions.json`;
  const filePath = path.join(__dirname,'output', filename);

  fs.writeFile(filePath, JSON.stringify(questions, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      res.status(500).send('Error saving data');
      return;
    }
    // Respond to the client that the data was successfully saved
    res.status(200).send('Data saved successfully');
  });

});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});