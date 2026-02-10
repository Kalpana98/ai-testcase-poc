// backend/index.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-tests", async (req, res) => {
  const { bdd, domain = "generic", testLevel = "e2e" } = req.body;

  const prompt = `
You are a senior QA engineer using a Treeify-style, multi-agent test design workflow.

Goal:
- Convert the following BDD feature/scenarios into a high-quality set of test cases with maximum coverage and accuracy.
- Apply domain knowledge for the domain: "${domain}".
- Focus on the test level: "${testLevel}" (for example: unit, integration, e2e).

Think in three internal steps:
1) REQUIREMENT ANALYSIS: rewrite the BDD into clear, numbered requirements.
2) TEST OBJECT ANALYSIS: identify main objects, inputs, states, and boundaries.
3) TEST CASE DESIGN: derive positive, negative, boundary, and edge test cases.

Output format (VERY IMPORTANT):
Return ONLY a valid JSON object with this exact structure and nothing else:

{
  "summary": {
    "domain": "string",
    "testLevel": "string",
    "assumptions": ["string"],
    "risks": ["string"]
  },
  "testCases": [
    {
      "id": "TC-001",
      "title": "string",
      "type": "functional | boundary | negative | security | performance | usability | regression",
      "priority": "high | medium | low",
      "preconditions": ["string"],
      "steps": ["string"],
      "expectedResults": ["string"],
      "tags": ["string"]
    }
  ]
}

BDD input:
"""${bdd}"""
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

    let structured = null;
    let outputText = data.response || "";

    try {
      structured = JSON.parse(data.response);

      if (structured && Array.isArray(structured.testCases)) {
        outputText = structured.testCases
          .map((tc) => {
            const steps = Array.isArray(tc.steps)
              ? tc.steps.map((s, idx) => `${idx + 1}. ${s}`).join("\n")
              : "";
            const preconditions = Array.isArray(tc.preconditions)
              ? tc.preconditions.join("\n- ")
              : "";
            const expected = Array.isArray(tc.expectedResults)
              ? tc.expectedResults.join("\n- ")
              : "";

            return [
              `ID: ${tc.id || ""}`,
              `Title: ${tc.title || ""}`,
              `Type: ${tc.type || ""}`,
              `Priority: ${tc.priority || ""}`,
              preconditions ? `Preconditions:\n- ${preconditions}` : "Preconditions: (none)",
              steps ? `Steps:\n${steps}` : "Steps: (none)",
              expected ? `Expected Results:\n- ${expected}` : "Expected Results: (none)",
              tc.tags && tc.tags.length ? `Tags: ${tc.tags.join(", ")}` : ""
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n\n");
      }
    } catch (parseErr) {
      // If parsing fails, fall back to plain text.
    }

    res.json({ output: outputText, structured });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
