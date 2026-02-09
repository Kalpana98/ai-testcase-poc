import { useState } from "react";

function App() {
  const [bdd, setBdd] = useState("");
  const [result, setResult] = useState("");

  const generate = async () => {
    const res = await fetch("http://localhost:3001/generate-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bdd })
    });

    const data = await res.json();
    setResult(data.output);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>BDD → Test Case Generator</h2>

      <textarea
        rows={8}
        style={{ width: "100%" }}
        placeholder="Enter BDD here"
        value={bdd}
        onChange={(e) => setBdd(e.target.value)}
      />

      <button onClick={generate} style={{ marginTop: 10 }}>
        Generate Test Cases
      </button>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        {result}
      </pre>
    </div>
  );
}

export default App;
