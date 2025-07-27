export interface IDRXTransaction {
  txHash: string;
  from: string;
  to: string;
  amount: number;
  timestamp: Date;
  type: "SENT" | "RECEIVED";
  status: string;
}

export const fetchIDRXTransactions = async (
  address: string,
  limit: number = 50
): Promise<IDRXTransaction[]> => {
  try {
    const idrxContractAddress = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661";

    const apiUrl = `https://sepolia-blockscout.lisk.com/api/v2/addresses/${address}/token-transfers`;

    const params = new URLSearchParams({
      token: idrxContractAddress,
      type: "ERC-20",
      limit: limit.toString(),
    });

    const response = await fetch(`${apiUrl}?${params}`);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("IDRX transactions data:", data);

    const formattedTransactions = data.items.map((tx: any) => {
      return {
        txHash: tx.transaction_hash,
        from: tx.from.hash,
        to: tx.to.hash,
        amount: parseFloat(tx.total.value) / 10 ** 2,
        timestamp: new Date(tx.timestamp),
        type:
          address.toLowerCase() === tx.from.hash.toLowerCase()
            ? "SENT"
            : "RECEIVED",
      };
    });

    return formattedTransactions;
  } catch (error) {
    console.error("Error fetching IDRX transactions:", error);
    throw error;
  }
};

export const checkIDRXTransaction = async (txHash: string): Promise<any> => {
  try {
    const apiUrl = `https://sepolia-blockscout.lisk.com/api/v2/transactions/${txHash}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking transaction:", error);
    throw error;
  }
};
