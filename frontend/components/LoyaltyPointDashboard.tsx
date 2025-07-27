"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";

import {
  useUserPoints,
  useMerchantQuota,
  useTransferPoints,
  useRedeemPoints,
  useIssuePoints,
  useTopUpIDRX,
  useWithdrawIDRX,
} from "@/hooks/useLoyaltyPoint";

type UserMode = "user" | "merchant";

export default function LoyaltyPointDashboard() {
  const [address, setAddress] = useState("0x1234...5678");
  const [isConnected, setIsConnected] = useState(true);
  const [userMode, setUserMode] = useState<UserMode>("user");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [issueTo, setIssueTo] = useState("");
  const [issueAmount, setIssueAmount] = useState("");
  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Hooks
  const {
    points,
    isLoading: pointsLoading,
    refetch: refetchPoints,
  } = useUserPoints();
  const {
    quota,
    isLoading: quotaLoading,
    refetch: refetchQuota,
  } = useMerchantQuota();
  const { transferPoints, isPending: isTransferring } = useTransferPoints();
  const { redeemPoints, isPending: isRedeeming } = useRedeemPoints();
  const { issuePoints, isPending: isIssuing } = useIssuePoints();
  const { topUpIDRX, isPending: isToppingUp } = useTopUpIDRX();
  const { withdrawIDRX, isPending: isWithdrawing } = useWithdrawIDRX();

  // Modals
  const {
    isOpen: isTransferOpen,
    onOpen: onTransferOpen,
    onOpenChange: onTransferOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRedeemOpen,
    onOpen: onRedeemOpen,
    onOpenChange: onRedeemOpenChange,
  } = useDisclosure();
  const {
    isOpen: isIssueOpen,
    onOpen: onIssueOpen,
    onOpenChange: onIssueOpenChange,
  } = useDisclosure();
  const {
    isOpen: isTopupOpen,
    onOpen: onTopupOpen,
    onOpenChange: onTopupOpenChange,
  } = useDisclosure();
  const {
    isOpen: isWithdrawOpen,
    onOpen: onWithdrawOpen,
    onOpenChange: onWithdrawOpenChange,
  } = useDisclosure();

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) return;

    try {
      setTxStatus("Transferring points...");
      await transferPoints(transferTo, transferAmount);
      setTxStatus("Transfer successful!");
      setTransferTo("");
      setTransferAmount("");
      refetchPoints();
      onTransferOpenChange();
    } catch (error: any) {
      setTxStatus(`Transfer failed: ${error.message}`);
    }
  };

  const handleRedeem = async () => {
    if (!redeemAmount) return;

    try {
      setTxStatus("Redeeming points...");
      await redeemPoints(redeemAmount);
      setTxStatus("Redeem successful!");
      setRedeemAmount("");
      refetchPoints();
      onRedeemOpenChange();
    } catch (error: any) {
      setTxStatus(`Redeem failed: ${error.message}`);
    }
  };

  const handleIssue = async () => {
    if (!issueTo || !issueAmount) return;

    try {
      setTxStatus("Issuing points...");
      await issuePoints(issueTo, issueAmount);
      setTxStatus("Issue successful!");
      setIssueTo("");
      setIssueAmount("");
      refetchQuota();
      onIssueOpenChange();
    } catch (error: any) {
      setTxStatus(`Issue failed: ${error.message}`);
    }
  };

  const handleTopUp = async () => {
    if (!topupAmount) return;

    try {
      setTxStatus("Topping up IDRX...");
      await topUpIDRX(topupAmount);
      setTxStatus("Top up successful!");
      setTopupAmount("");
      refetchQuota();
      onTopupOpenChange();
    } catch (error: any) {
      setTxStatus(`Top up failed: ${error.message}`);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;

    try {
      setTxStatus("Withdrawing IDRX...");
      await withdrawIDRX(withdrawAmount);
      setTxStatus("Withdraw successful!");
      setWithdrawAmount("");
      refetchQuota();
      onWithdrawOpenChange();
    } catch (error: any) {
      setTxStatus(`Withdraw failed: ${error.message}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Pointify</h2>
        <p className="text-gray-600 mb-4">
          Please connect your wallet to continue
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8">🎯 Pointify</h1>

        {/* Wallet Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Connected Wallet</h3>
          <p className="text-sm text-gray-600 break-all">{address}</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-6">
          <Button
            className="flex-1"
            color={userMode === "user" ? "primary" : "default"}
            onClick={() => setUserMode("user")}
          >
            👤 User Mode
          </Button>
          <Button
            className="flex-1"
            color={userMode === "merchant" ? "primary" : "default"}
            onClick={() => setUserMode("merchant")}
          >
            🏪 Merchant Mode
          </Button>
        </div>

        {/* User Mode */}
        {userMode === "user" && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                Your Loyalty Points
              </h3>
              {pointsLoading ? (
                <p className="text-blue-600">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-blue-900">
                  {points} Points
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                className="h-16 text-lg"
                color="primary"
                onClick={onTransferOpen}
              >
                💸 Transfer Points
              </Button>
              <Button
                className="h-16 text-lg"
                color="secondary"
                onClick={onRedeemOpen}
              >
                💰 Redeem to IDRX
              </Button>
            </div>
          </div>
        )}

        {/* Merchant Mode */}
        {userMode === "merchant" && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                Your Merchant Quota
              </h3>
              {quotaLoading ? (
                <p className="text-green-600">Loading...</p>
              ) : (
                <p className="text-2xl font-bold text-green-900">
                  {quota} IDRX
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="h-16 text-lg"
                color="primary"
                onClick={onTopupOpen}
              >
                💳 Top Up IDRX
              </Button>
              <Button
                className="h-16 text-lg"
                color="secondary"
                onClick={onIssueOpen}
              >
                🎁 Issue Points
              </Button>
              <Button
                className="h-16 text-lg"
                color="default"
                onClick={onWithdrawOpen}
              >
                💸 Withdraw IDRX
              </Button>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {txStatus && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">{txStatus}</p>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      <Modal isOpen={isTransferOpen} onOpenChange={onTransferOpenChange}>
        <ModalContent>
          <ModalHeader>Transfer Points</ModalHeader>
          <ModalBody>
            <Input
              label="Recipient Address"
              placeholder="0x..."
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
            />
            <Input
              label="Amount"
              placeholder="100"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onTransferOpenChange}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isTransferring}
              onPress={handleTransfer}
            >
              Transfer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Redeem Modal */}
      <Modal isOpen={isRedeemOpen} onOpenChange={onRedeemOpenChange}>
        <ModalContent>
          <ModalHeader>Redeem Points to IDRX</ModalHeader>
          <ModalBody>
            <Input
              label="Amount to Redeem"
              placeholder="100"
              type="number"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onRedeemOpenChange}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isRedeeming}
              onPress={handleRedeem}
            >
              Redeem
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Issue Modal */}
      <Modal isOpen={isIssueOpen} onOpenChange={onIssueOpenChange}>
        <ModalContent>
          <ModalHeader>Issue Points</ModalHeader>
          <ModalBody>
            <Input
              label="Recipient Address"
              placeholder="0x..."
              value={issueTo}
              onChange={(e) => setIssueTo(e.target.value)}
            />
            <Input
              label="Amount"
              placeholder="100"
              type="number"
              value={issueAmount}
              onChange={(e) => setIssueAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onIssueOpenChange}>
              Cancel
            </Button>
            <Button color="primary" isLoading={isIssuing} onPress={handleIssue}>
              Issue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Top Up Modal */}
      <Modal isOpen={isTopupOpen} onOpenChange={onTopupOpenChange}>
        <ModalContent>
          <ModalHeader>Top Up IDRX</ModalHeader>
          <ModalBody>
            <Input
              label="Amount to Top Up"
              placeholder="1000"
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onTopupOpenChange}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isToppingUp}
              onPress={handleTopUp}
            >
              Top Up
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={isWithdrawOpen} onOpenChange={onWithdrawOpenChange}>
        <ModalContent>
          <ModalHeader>Withdraw IDRX</ModalHeader>
          <ModalBody>
            <Input
              label="Amount to Withdraw"
              placeholder="500"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onWithdrawOpenChange}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isWithdrawing}
              onPress={handleWithdraw}
            >
              Withdraw
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
