import { useState } from "react";

const initialState = {
  loading: false,
  error: "",
  data: null,
};

async function postData(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.detail || "Request failed");
  }

  return json;
}

export default function App() {
  const [sentimentText, setSentimentText] = useState("I really enjoy learning AI and building projects.");
  const [summaryText, setSummaryText] = useState(
    "FastAPI is a modern Python framework for building APIs quickly. Hugging Face provides thousands of pre-trained models for NLP, vision, and audio tasks. With React and Vite, developers can build fast and interactive user interfaces that connect to AI backends in real time."
  );
  const [promptText, setPromptText] = useState("In the next five years, artificial intelligence will");
  const [qaContext, setQaContext] = useState(
    "The Eiffel Tower is located in Paris, France. It was completed in 1889 and is one of the most famous landmarks in the world."
  );
  const [qaQuestion, setQaQuestion] = useState("Where is the Eiffel Tower located?");

  const [sentiment, setSentiment] = useState(initialState);
  const [summary, setSummary] = useState(initialState);
  const [generation, setGeneration] = useState(initialState);
  const [qa, setQa] = useState(initialState);

  const runSentiment = async (event) => {
    event.preventDefault();
    setSentiment({ loading: true, error: "", data: null });
    try {
      const result = await postData("/api/sentiment", { text: sentimentText });
      setSentiment({ loading: false, error: "", data: result.result });
    } catch (error) {
      setSentiment({ loading: false, error: error.message, data: null });
    }
  };

  const runSummary = async (event) => {
    event.preventDefault();
    setSummary({ loading: true, error: "", data: null });
    try {
      const result = await postData("/api/summarize", {
        text: summaryText,
        max_length: 130,
        min_length: 30,
      });
      setSummary({ loading: false, error: "", data: result.result });
    } catch (error) {
      setSummary({ loading: false, error: error.message, data: null });
    }
  };

  const runGeneration = async (event) => {
    event.preventDefault();
    setGeneration({ loading: true, error: "", data: null });
    try {
      const result = await postData("/api/generate", {
        prompt: promptText,
        max_new_tokens: 90,
      });
      setGeneration({ loading: false, error: "", data: result.result });
    } catch (error) {
      setGeneration({ loading: false, error: error.message, data: null });
    }
  };

  const runQa = async (event) => {
    event.preventDefault();
    setQa({ loading: true, error: "", data: null });
    try {
      const result = await postData("/api/qa", {
        context: qaContext,
        question: qaQuestion,
      });
      setQa({ loading: false, error: "", data: result.result });
    } catch (error) {
      setQa({ loading: false, error: error.message, data: null });
    }
  };

  return (
    <div className="page-shell">
      <div className="background-glow glow-left" />
      <div className="background-glow glow-right" />

      <header className="hero">
        <p className="eyebrow">FastAPI + Hugging Face + React</p>
        <h1>AI Model Serving Studio</h1>
        <p className="hero-copy">
          Ek hi dashboard se multiple NLP models serve karo: sentiment analysis, summarization,
          text generation, aur question answering.
        </p>
      </header>

      <main className="grid">
        <section className="panel">
          <h2>Sentiment Analysis</h2>
          <form onSubmit={runSentiment}>
            <textarea
              value={sentimentText}
              onChange={(event) => setSentimentText(event.target.value)}
              rows={4}
            />
            <button type="submit" disabled={sentiment.loading}>
              {sentiment.loading ? "Analyzing..." : "Analyze Sentiment"}
            </button>
          </form>
          {sentiment.error && <p className="error">{sentiment.error}</p>}
          {sentiment.data && (
            <div className="result">
              <p>
                <strong>Label:</strong> {sentiment.data.label}
              </p>
              <p>
                <strong>Score:</strong> {sentiment.data.score}
              </p>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Text Summarization</h2>
          <form onSubmit={runSummary}>
            <textarea
              value={summaryText}
              onChange={(event) => setSummaryText(event.target.value)}
              rows={6}
            />
            <button type="submit" disabled={summary.loading}>
              {summary.loading ? "Summarizing..." : "Generate Summary"}
            </button>
          </form>
          {summary.error && <p className="error">{summary.error}</p>}
          {summary.data && (
            <div className="result">
              <p>{summary.data.summary}</p>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Text Generation</h2>
          <form onSubmit={runGeneration}>
            <textarea
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
              rows={4}
            />
            <button type="submit" disabled={generation.loading}>
              {generation.loading ? "Generating..." : "Generate Text"}
            </button>
          </form>
          {generation.error && <p className="error">{generation.error}</p>}
          {generation.data && (
            <div className="result">
              <p>{generation.data.generated_text}</p>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Question Answering</h2>
          <form onSubmit={runQa}>
            <label>Context</label>
            <textarea value={qaContext} onChange={(event) => setQaContext(event.target.value)} rows={5} />
            <label>Question</label>
            <input value={qaQuestion} onChange={(event) => setQaQuestion(event.target.value)} />
            <button type="submit" disabled={qa.loading}>
              {qa.loading ? "Finding Answer..." : "Get Answer"}
            </button>
          </form>
          {qa.error && <p className="error">{qa.error}</p>}
          {qa.data && (
            <div className="result">
              <p>
                <strong>Answer:</strong> {qa.data.answer}
              </p>
              <p>
                <strong>Confidence:</strong> {qa.data.score}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
