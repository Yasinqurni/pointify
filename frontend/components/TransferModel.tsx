import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { useRef, useState, useEffect } from "react";
import { parseEther } from "viem";
import { checkIDRXTransaction } from "@/utils/idrxTransaction";

export default function TransferModal() {
  const [address] = useState("0x1234...5678");
  const [isCopy, setIsCopy] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const input1 = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const [balance] = useState({ formatted: "100.0" });
  const [isNativeSending, setIsNativeSending] = useState(false);
  const [isTransactionComplete, setIsTransactionComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "success" | "error" | null
  >(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const idrxABI = [
    {
      constant: false,
      inputs: [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ name: "success", type: "bool" }],
      type: "function",
    },
  ];

  const [isTokenSending, setIsTokenSending] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (transactionHash && transactionStatus === "pending") {
      interval = setInterval(async () => {
        try {
          const txDetails = await checkIDRXTransaction(transactionHash);
          setTransactionDetails(txDetails);

          if (txDetails.status === "ok") {
            setTransactionStatus("success");
            clearInterval(interval);
          } else if (txDetails.status === "error") {
            setTransactionStatus("error");
            setErrorMessage(
              "Transaksi gagal: " +
                (txDetails.reason || "Alasan tidak diketahui")
            );
            clearInterval(interval);
          }
        } catch (error) {
          console.log("Error checking transaction status:", error);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [transactionHash, transactionStatus]);

  const handleTransfer = async () => {
    if (input1.current) {
      try {
        setErrorMessage(null);
        setIsTransactionComplete(false);

        const amount = parseFloat(input1.current.value);
        const toAddress = input2.current?.value;
        if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
          setErrorMessage("Alamat tujuan tidak valid");
          return;
        }

        if (isNaN(amount) || amount <= 0) {
          setErrorMessage("Jumlah tidak valid");
          return;
        }
        const balanceValue = parseFloat(balance?.formatted || "0");
        if (amount > balanceValue) {
          setErrorMessage("Saldo IDRX tidak cukup");
          return;
        }

        const decimals = 2;
        const multiplier = 10 ** decimals;
        const amountInTokenUnits = BigInt(Math.floor(amount * multiplier));

        const isContractAddress = false;

        let txHash;
        if (isContractAddress) {
          console.log("Approving smart contract to spend tokens...");
          const approvalHash = await transferIDRX({
            address: "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661",
            abi: idrxABI,
            functionName: "approve",
            args: [toAddress as `0x${string}`, amountInTokenUnits],
          });

          console.log("Approval transaction sent with hash:", approvalHash);
          txHash = approvalHash;
        } else {
          txHash = await transferIDRX({
            address: "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661",
            abi: idrxABI,
            functionName: "transfer",
            args: [toAddress as `0x${string}`, amountInTokenUnits],
          });
        }
        setTransactionHash(txHash);
        console.log("IDRX Token transfer sent with hash:", txHash);

        setTransactionStatus("pending");

        try {
          const txDetails = await checkIDRXTransaction(txHash);
          setTransactionDetails(txDetails);

          if (txDetails.status === "ok") {
            setTransactionStatus("success");
          } else if (txDetails.status === "error") {
            setTransactionStatus("error");
            setErrorMessage(
              "Transaksi gagal: " +
                (txDetails.reason || "Alasan tidak diketahui")
            );
          }
        } catch (checkError) {
          console.log(
            "Tidak bisa melakukan pengecekan transaksi saat ini. Transaksi mungkin masih dalam proses:",
            checkError
          );
        }

        // Transaction saved successfully
        setIsTransactionComplete(true);
        setIsCopy(true);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("user rejected") ||
            error.message.includes("rejected transaction") ||
            error.message.includes("user denied") ||
            error.message.includes("User rejected") ||
            error.message.includes("User denied"))
        ) {
          setErrorMessage("Transaksi ditolak oleh pengguna");
        } else {
          console.error("Transaction error:", error);
          setErrorMessage(
            error instanceof Error ? error.message : "Transaction failed"
          );
        }
      }
    }
  };

  return (
    <>
      <Button
        onPress={() => onOpen()}
        className="size-[100px] bg-indigo-100 rounded-xl flex flex-col justify-center items-center font-semibold text-[14px] text-indigo-800 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path d="M11.47 1.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1-1.06 1.06l-1.72-1.72V7.5h-1.5V4.06L9.53 5.78a.75.75 0 0 1-1.06-1.06l3-3ZM11.25 7.5V15a.75.75 0 0 0 1.5 0V7.5h3.75a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h3.75Z" />
        </svg>
        Transfer
      </Button>
      <Modal isOpen={isOpen} backdrop="blur" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h1 className="text-slate-800 font-bold text-2xl text-center">
                  Transfer
                </h1>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-2 rounded-xl p-5 mx-5">
                <h1 className="text-almarai -mt-2 text-slate-700 text-left">
                  Jumlah{" "}
                  <span className="text-slate-400">(Minimal 2 IDRX)</span>
                </h1>
                <div className="flex flex-row gap-2 items-center">
                  <input
                    type="number"
                    placeholder="0.00"
                    ref={input1}
                    className="bg-indigo-100 border-none border-indigo-300 rounded-lg p-2 w-full text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-bold placeholder:text-indigo-500"
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => {
                      if (input1.current) {
                        input1.current.value = "2";
                      }
                    }}
                    className="bg-indigo-100 text-indigo-800 font-semibold px-4 py-2 rounded hover:bg-indigo-300"
                  >
                    Min
                  </Button>
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => {
                      if (input1.current) {
                        input1.current.value = String(balance?.formatted);
                      }
                    }}
                    className="bg-indigo-100 text-indigo-800 font-semibold px-4 py-2 rounded hover:bg-indigo-300"
                  >
                    Max{" "}
                  </Button>
                </div>
                <h1 className="text-almarai text-slate-700 text-left">
                  Alamat Tujuan
                </h1>
                <input
                  type="text"
                  placeholder="0x..."
                  ref={input2}
                  className="bg-indigo-100 border-none border-indigo-300 rounded-lg p-2 w-full text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-bold placeholder:text-indigo-500"
                />
              </ModalBody>{" "}
              <ModalFooter className="flex flex-col">
                {errorMessage && (
                  <div className="text-red-500 text-sm mb-2 w-full text-center">
                    {errorMessage}
                    {errorMessage === "Transaksi ditolak oleh pengguna" && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => {
                            setErrorMessage(null);
                          }}
                        >
                          Coba Lagi
                        </Button>
                      </div>
                    )}
                  </div>
                )}{" "}
                {isTransactionComplete && (
                  <div className="text-green-500 text-sm mb-2 w-full text-center">
                    {transactionStatus === "pending" &&
                      "Transaksi sedang diproses..."}
                    {transactionStatus === "success" && "Transaksi berhasil!"}
                    {transactionStatus === null &&
                      "Transaksi berhasil dikirim!"}

                    {transactionHash && (
                      <div className="mt-1">
                        <a
                          href={`https://sepolia-blockscout.lisk.com/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Lihat di Explorer
                        </a>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end w-full">
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => handleTransfer()}
                    disabled={isCopy || isTokenSending}
                    className="flex flex-row gap-2 items-center"
                  >
                    {isTokenSending
                      ? "Processing Transfer..."
                      : "Transfer IDRX"}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
