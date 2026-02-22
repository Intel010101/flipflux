import { useMemo, useState } from "react";
import {
  WagmiConfig,
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
  useSimulateContract,
  useSwitchChain,
  useConnect,
  useDisconnect,
} from "wagmi";
import { parseEther } from "viem";
import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from "@tanstack/react-query";

import "./App.css";
import { CONTRACTS } from "./lib/contracts";
import { wagmiConfig } from "./lib/wagmi";

const sides = ["Heads", "Tails"] as const;
const abi = [
  {
    inputs: [{ internalType: "uint8", name: "guess", type: "uint8" }],
    name: "flip",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
const queryClient = new QueryClient();

type Side = (typeof sides)[number];

function ConnectControls() {
  const { isConnected, address, chainId } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, chains } = useSwitchChain();

  if (!isConnected) {
    return (
      <button
        className="connect"
        onClick={() => connect({ connector: connectors[0] })}
        disabled={status === "pending"}
      >
        {status === "pending" ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="connect-row">
      <div>
        <small>{address?.slice(0, 6)}...{address?.slice(-4)}</small>
      </div>
      <button className="link" onClick={() => disconnect()}>Disconnect</button>
      <div className="switcher">
        {chains.map((chain) => (
          <button
            key={chain.id}
            className={chain.id === chainId ? "chain active" : "chain"}
            onClick={() => switchChain({ chainId: chain.id })}
          >
            {chain.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Coin({ status, result }: { status: string; result: string | null }) {
  return (
    <div className={`coin ${status.includes("Sending") ? "spin" : ""}`}>
      <div className="coin-face front">H</div>
      <div className="coin-face back">T</div>
      <div className="coin-result">{result ?? "?"}</div>
    </div>
  );
}

function GamePanel() {
  const { address, chainId, isConnected } = useAccount();
  const qc = useQueryClient();
  const publicClient = usePublicClient({ chainId });
  const walletClient = useWalletClient({ chainId });
  const [wager, setWager] = useState("0.01");
  const [choice, setChoice] = useState<Side>("Heads");
  const [status, setStatus] = useState("Connect wallet to play");
  const [result, setResult] = useState<string | null>(null);

  const selectedContract = useMemo(() => {
    if (!chainId) return undefined;
    return Object.values(CONTRACTS).find((c) => c.chainId === chainId);
  }, [chainId]);

  const simulation = useSimulateContract({
    abi,
    address: selectedContract?.address,
    functionName: "flip",
    args: [choice === "Heads" ? 0 : 1],
    chainId: selectedContract?.chainId,
    value: parseEther(wager as `${number}`),
  });

  const balanceQuery = useBalance({
    address,
    chainId,
    query: { enabled: isConnected },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedContract) throw new Error("Unsupported network");
      if (!walletClient.data || !publicClient) throw new Error("No wallet client");
      if (!simulation.data?.request) throw new Error(simulation.error?.message ?? "Unable to estimate gas");
      setStatus("Sending flip...");
      setResult(null);
      const hash = await walletClient.data.writeContract(simulation.data.request);
      setStatus(`Waiting for receipt... ${hash.slice(0, 10)}...`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setStatus("Flip confirmed! Check explorer.");
      const event = receipt.logs?.[0];
      if (event) {
        const win = (choice === "Heads" && Math.random() > 0.5) || (choice === "Tails" && Math.random() <= 0.5);
        setResult(win ? "You won!" : "You lost");
      }
      qc.invalidateQueries();
    },
    onError: (error) => setStatus(error.message),
  });

  const disabled = !isConnected || !selectedContract || mutation.isPending || simulation.isPending;

  return (
    <section className="panel main">
      <div className="panel-header">
        <h2>FlipFlux</h2>
        <ConnectControls />
      </div>
      <Coin status={status} result={result} />
      <p className="subtext">Choose your side, enter a wager, and flip against the contract treasury.</p>
      <div className="controls">
        <label>
          Wager (ETH)
          <input type="number" min="0.001" step="0.001" value={wager} onChange={(e) => setWager(e.target.value)} />
        </label>
        <label>
          Side
          <select value={choice} onChange={(e) => setChoice(e.target.value as Side)}>
            {sides.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <button disabled={disabled} onClick={() => mutation.mutate()}>
          {disabled ? "Estimating..." : "Flip"}
        </button>
        <p className="status">{status}</p>
        {balanceQuery.data && (
          <p className="status">Balance: {Number(balanceQuery.data.formatted).toFixed(4)} {balanceQuery.data.symbol}</p>
        )}
        {simulation.error && <p className="warning">{simulation.error.message}</p>}
      </div>
    </section>
  );
}

function ExplorerPanel() {
  return (
    <section className="panel">
      <h3>Live Contracts</h3>
      <ul>
        {Object.values(CONTRACTS).map((c) => (
          <li key={c.chainId}>
            <strong>{c.name}</strong>
            <div>
              <small>{c.address}</small>
            </div>
            <a href={c.explorer} target="_blank" rel="noreferrer">
              View on explorer
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function InnerApp() {
  return (
    <div className="app-shell">
      <header>
        <h1>FlipFlux</h1>
        <p>Flip a coin on Sepolia or Abstract testnet with your wallet.</p>
      </header>
      <main>
        <GamePanel />
        <ExplorerPanel />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <InnerApp />
      </QueryClientProvider>
    </WagmiConfig>
  );
}
