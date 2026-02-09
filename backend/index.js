// backend/index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-tests", async (req, res) => {
  const { bdd } = req.body;

  const prompt = `
You are a senior QA engineer.
Convert the following BDD scenario into test cases.

Return the result in plain text with:
- Test Case Title
- Preconditions
- Steps
- Expected Result

BDD:
${bdd}
`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false
      })
    });

    const data = await response.json();
    res.json({ output: data.response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
