import { useState } from "react";
import { motion } from "framer-motion";
import "./App.css";

const sides = ["Heads", "Tails"] as const;

function Coin({ result }: { result: string | null }) {
  return (
    <motion.div
      className="coin"
      animate={{ rotateY: result ? 720 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="coin-face front">H</div>
      <div className="coin-face back">T</div>
      <div className="coin-result">{result ?? "?"}</div>
    </motion.div>
  );
}

export default function App() {
  const [wager, setWager] = useState("0.01");
  const [choice, setChoice] = useState<typeof sides[number]>("Heads");
  const [status, setStatus] = useState("Ready to flip");
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const flipLocal = () => {
    setStatus("Flipping...");
    setTimeout(() => {
      const outcome = sides[Math.floor(Math.random() * sides.length)];
      setResult(outcome);
      const win = outcome === choice ? "won" : "lost";
      const entry = `${new Date().toLocaleTimeString()} – You ${win} ${wager} on ${choice}`;
      setHistory((prev) => [entry, ...prev].slice(0, 6));
      setStatus(`Result: ${outcome}. You ${win}.`);
    }, 800);
  };

  return (
    <div className="app-shell">
      <header>
        <h1>FlipFlux</h1>
        <p>Coin-flip wagers coming soon on Sepolia & Abstract testnets. Connect wallet, bet, flip.</p>
      </header>
      <main>
        <section className="left">
          <Coin result={result} />
          <div className="controls">
            <label>
              Wager (ETH)
              <input value={wager} onChange={(e) => setWager(e.target.value)} type="number" min="0.001" step="0.001" />
            </label>
            <label>
              Choose your side
              <select value={choice} onChange={(e) => setChoice(e.target.value as typeof choice)}>
                {sides.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <button onClick={flipLocal}>Flip (local preview)</button>
            <p className="status">{status}</p>
          </div>
        </section>
        <section className="right">
          <div className="panel">
            <h3>Live Contract (WIP)</h3>
            <ul>
              <li>Deployment: pending</li>
              <li>Bankroll: pending</li>
              <li>House edge: 0%</li>
            </ul>
          </div>
          <div className="panel history">
            <h3>Recent flips</h3>
            {history.length === 0 && <p>No flips yet.</p>}
            <ul>
              {history.map((entry, idx) => (
                <li key={idx}>{entry}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
