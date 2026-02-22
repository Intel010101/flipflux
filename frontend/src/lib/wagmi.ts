import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const abstractTestnet = {
  id: 11124,
  name: "Abstract Sepolia",
  network: "abstract-sepolia",
  nativeCurrency: { name: "Abstract ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.testnet.abs.xyz"] },
    public: { http: ["https://api.testnet.abs.xyz"] },
  },
  blockExplorers: {
    default: { name: "ABScan", url: "https://sepolia.abscan.org" },
  },
} as const;

export const wagmiConfig = createConfig({
  chains: [sepolia, abstractTestnet],
  connectors: [injected({ target: "metaMask" })],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia.rpc.subquery.network/public"),
    [abstractTestnet.id]: http("https://api.testnet.abs.xyz"),
  },
  multiInjectedProviderDiscovery: true,
});
