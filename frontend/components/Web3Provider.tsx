"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { liskSepolia } from "viem/chains";
import { XellarKitProvider, defaultConfig, darkTheme } from "@xellar/kit";

const walletConnectProjectId = "c56afd86d6e30cd57a8555718b43e2cc";
const xellarAppId = "f63e9d62-b9f6-4c9f-a9c2-d90d50c108ea";

const config = defaultConfig({
  appName: "Pointify",
  walletConnectProjectId,
  xellarAppId,
  xellarEnv: "sandbox",
  chains: [liskSepolia],
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider theme={darkTheme}>{children}</XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
