import { useState } from "react";
type TransferCardProps = {
  fromAddress: string;
  type: "Menerima" | "Mengirim";
  amount: number;
  txHash: string;
  date: string;
};

export default function TransferCard({
  fromAddress,
  type,
  amount,
  txHash,
  date,
}: TransferCardProps) {
  const [address] = useState("0x1234...5678");
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  const formattedAddress = formatAddress(address || "");
  return (
    <div
      className="bg-indigo-100 p-4 flex flex-row gap-5 items-center rounded-xl cursor-pointer"
      onClick={() =>
        window.open(
          `https://sepolia-blockscout.lisk.com/tx/${txHash}`,
          "_blank"
        )
      }
    >
      <div>
        <h1 className="text-slate-800 font-almarai font-semibold text-xl mb-1">
          Transfer{" "}
          <span className=" rounded-xl bg-green-200 text-green-600 font-normal px-2 py-1 text-[14px] ml-3">
            {type}
          </span>
        </h1>
        <p className="text-slate-500 text-md -mt-1">
          {type === "Menerima"
            ? `Dari : ${fromAddress} Ke: ${formattedAddress}`
            : `Dari : ${formattedAddress} Ke: ${fromAddress}`}
          {date}
        </p>
      </div>
      <div className="text-indigo-800 font-bold font-notoSans text-xl flex-grow text-right pr-5">
        {amount} IDRX
      </div>
    </div>
  );
}
