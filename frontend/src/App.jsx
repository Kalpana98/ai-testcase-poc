import { useState } from "react";

function App() {
  const [bdd, setBdd] = useState("");
  const [domain, setDomain] = useState("generic");
  const [testLevel, setTestLevel] = useState("e2e");
  const [result, setResult] = useState("");
  const [structured, setStructured] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setResult("");
    setStructured(null);

    try {
      const res = await fetch("http://localhost:3001/generate-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bdd, domain, testLevel })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data.output || "");
      setStructured(data.structured || null);
    } catch (e) {
      setError(e.message || "Failed to generate test cases.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <h2>BDD → AI Test Case Generator</h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Provide your BDD feature and scenarios. The backend uses Ollama with a Treeify-style, multi-step test design workflow
        to generate structured, high-coverage test cases.
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
            Domain
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            style={{ padding: 6, minWidth: 160 }}
          >
            <option value="generic">Generic</option>
            <option value="e-commerce">E-commerce</option>
            <option value="banking">Banking / Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="public-sector">Public Sector</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
            Test Level
          </label>
          <select
            value={testLevel}
            onChange={(e) => setTestLevel(e.target.value)}
            style={{ padding: 6, minWidth: 160 }}
          >
            <option value="unit">Unit</option>
            <option value="integration">Integration</option>
            <option value="e2e">End-to-End</option>
          </select>
        </div>
      </div>

      <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
        BDD (Gherkin)
      </label>
      <textarea
        rows={10}
        style={{ width: "100%", padding: 10, fontFamily: "monospace", fontSize: 14 }}
        placeholder={`Feature: User login

  Scenario: Successful login
    Given a registered user exists
    When they log in with valid credentials
    Then they should see the dashboard`}
        value={bdd}
        onChange={(e) => setBdd(e.target.value)}
      />

      <button
        onClick={generate}
        style={{
          marginTop: 12,
          padding: "8px 16px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1
        }}
        disabled={loading || !bdd.trim()}
      >
        {loading ? "Generating…" : "Generate Test Cases"}
      </button>

      {error && (
        <div style={{ marginTop: 12, color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Generated Test Cases (Readable View)</h3>
          <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", padding: 12, borderRadius: 4 }}>
            {result}
          </pre>
        </div>
      )}

      {structured && (
        <div style={{ marginTop: 20 }}>
          <h3>Structured Test Cases (JSON)</h3>
          <pre style={{ marginTop: 8, whiteSpace: "pre-wrap", padding: 12, borderRadius: 4 }}>
            {JSON.stringify(structured, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
