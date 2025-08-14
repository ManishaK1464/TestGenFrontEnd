import React, { useState } from "react";
import "./App.css";
const API_URL =import.meta.env.VITE_API_URL;


const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["Open", "In Progress", "Closed"];

export default function App() {
  const [requirement, setRequirement] = useState("");
  const [loading, setLoading] = useState(false);
  const [testcases, setTestcases] = useState([]);
  const [error, setError] = useState(null);

  function updateTestcase(index, field, value) {
    setTestcases(prev => {
      const newCases = [...prev];
      newCases[index][field] =
        field === "steps" ? value.split("\n") : value;
      return newCases;
    });
  }

  function addTestcase() {
    setTestcases(prev => [
      ...prev,
      {
        id: `TC${(prev.length + 1).toString().padStart(3, "0")}`,
        title: "",
        description: "",
        steps: [],
        expected_result: "",
        priority: "Medium",
        status: "Open"
      }
    ]);
  }

  function removeTestcase(index) {
    setTestcases(prev => prev.filter((_, i) => i !== index));
  }

  function downloadCSV() {
    if (!testcases.length) return;
    const headers = [
      "Test Case ID",
      "Title",
      "Description",
      "Steps",
      "Expected Result",
      "Priority",
      "Status"
    ];
    const rows = testcases.map(tc => [
      tc.id,
      tc.title,
      tc.description,
      tc.steps.join("\n"),
      tc.expected_result,
      tc.priority,
      tc.status
    ]);
    const csvContent =
      [headers, ...rows]
        .map(row =>
          row
            .map(item => `"${item?.toString().replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "testcases.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    if (!testcases.length) return;
    const headers = [
      "Test Case ID",
      "Title",
      "Description",
      "Steps",
      "Expected Result",
      "Priority",
      "Status"
    ];
    const rows = testcases.map(tc => [
      tc.id,
      tc.title,
      tc.description,
      tc.steps.join("\n"),
      tc.expected_result,
      tc.priority,
      tc.status
    ]);
    const csvText = [headers, ...rows]
      .map(row =>
        row
          .map(item => `"${item?.toString().replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(csvText);
      alert("Copied test cases to clipboard!");
    } catch {
      alert("Failed to copy. Try manually.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!requirement.trim()) {
      setError("Please enter a requirement description.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/generate-testcases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement_description: requirement })
      });
      if (!res.ok) throw new Error("Failed to fetch testcases");
      const data = await res.json();
      const normalized = data.testcases.map((tc, i) => ({
        id: tc.id || `TC${(i + 1).toString().padStart(3, "0")}`,
        title: tc.title || "",
        description: tc.description || "",
        steps: Array.isArray(tc.steps) ? tc.steps : tc.steps.split("\n"),
        expected_result: tc.expected_result || "",
        priority: tc.priority || "Medium",
        status: tc.status || "Open"
      }));
      setTestcases(normalized);
    } catch (err) {
      setError(err.message);
      setTestcases([]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Header */}
      <div className="app-header">
        <div className="header-left">
          <div className="app-logo">A</div>
          <div className="header-content">
            <h1>IEM-TestGen</h1>
            <div className="header-subtitle">
              AI-powered test case generation and management
            </div>
          </div>
        </div>
        <div className="ai-badge">AI-Powered</div>
      </div>

      {/* Main */}
      <div className="main-container">
        {/* Left panel */}
        <div className="left-panel">
          <div className="requirements-section">
            <h2>
              <span className="search-icon">🔍</span>
              Requirements Input
            </h2>
            <p>Enter project needs to generate structured test cases</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  Enter requirement or feature description:
                </label>
                <textarea
                  value={requirement}
                  onChange={e => setRequirement(e.target.value)}
                  className="form-textarea"
                  placeholder="E.g. User logs in with email and password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="generate-btn"
              >
                <span className="generate-icon">⚡</span>
                Generate Analysis
              </button>
            </form>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {/* Right panel */}
        <div className="right-panel">
          <div className="results-header">
            <h2>Research Analysis Results</h2>
            {testcases.length > 0 && (
              <div className="action-buttons">
                <button onClick={addTestcase} className="btn-secondary">
                  + ADD TEST
                </button>
                <button onClick={downloadCSV} className="btn-secondary">
                  ⬇️ Export Papers
                </button>
                <button onClick={copyToClipboard} className="btn-primary">
                  📤 SHARE
                </button>
              </div>
            )}
          </div>

          {testcases.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <p className="empty-title">Welcome TO IEMTestGen</p>
              <div className="empty-features">
                <div className="feature-item">
                  <span className="feature-icon">🤖</span>
                  <span className="feature-text">
                    Fast & Accurate
                  </span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✏️</span>
                  <span className="feature-text"> Export-Ready</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span className="feature-text">Customizable — tweak steps, inputs to match your workflow</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-card-header">
                <span>TEST CASES</span>
              </div>
              <div className="table-card-body">
                <table className="test-cases-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Steps</th>
                      <th>Expected Result</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testcases.map((tc, i) => (
                      <tr key={tc.id}>
                        <td>
                          <input
                            type="text"
                            value={tc.id}
                            onChange={e =>
                              updateTestcase(i, "id", e.target.value)
                            }
                            className="table-input"
                            style={{ width: "80px" }}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={tc.title}
                            onChange={e =>
                              updateTestcase(i, "title", e.target.value)
                            }
                            className="table-input"
                          />
                        </td>
                        <td>
                          <textarea
                            value={tc.description}
                            onChange={e =>
                              updateTestcase(i, "description", e.target.value)
                            }
                            className="table-textarea"
                          />
                        </td>
                        <td>
                          <textarea
                            value={tc.steps.join("\n")}
                            onChange={e =>
                              updateTestcase(i, "steps", e.target.value)
                            }
                            className="table-textarea"
                            placeholder="One step per line"
                          />
                        </td>
                        <td>
                          <textarea
                            value={tc.expected_result}
                            onChange={e =>
                              updateTestcase(
                                i,
                                "expected_result",
                                e.target.value
                              )
                            }
                            className="table-textarea"
                          />
                        </td>
                        <td>
                          <select
                            value={tc.priority}
                            onChange={e =>
                              updateTestcase(i, "priority", e.target.value)
                            }
                            className="table-select"
                          >
                            {PRIORITY_OPTIONS.map(p => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={tc.status}
                            onChange={e =>
                              updateTestcase(i, "status", e.target.value)
                            }
                            className="table-select"
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => removeTestcase(i)}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="app-footer">
        © 2025 IEM Fraunhofer • AI-Powered Test Case Generator
      </div>
    </>
  );
}
