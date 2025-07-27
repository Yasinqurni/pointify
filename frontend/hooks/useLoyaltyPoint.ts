"use client";

import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";

import { LOYALTY_POINT_ABI, CONTRACT_ADDRESSES } from "@/utils/loyaltyPointAbi";

// Hook untuk membaca user points
export function useUserPoints(address?: string) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.LOYALTY_POINT as `0x${string}`,
    abi: LOYALTY_POINT_ABI,
    functionName: "userPoint",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    points: data ? formatEther(data) : formatEther(0n),
    pointsWei: data ?? 0n,
    isLoading,
    error,
    refetch,
  };
}

// Hook untuk membaca merchant quota
export function useMerchantQuota(address?: string) {
  const { address: connectedAddress } = useAccount();
  const merchantAddress = address || connectedAddress;

  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.LOYALTY_POINT as `0x${string}`,
    abi: LOYALTY_POINT_ABI,
    functionName: "merchantQuota",
    args: merchantAddress ? [merchantAddress] : undefined,
    query: {
      enabled: !!merchantAddress,
    },
  });

  return {
    quota: data ? formatEther(data) : formatEther(0n),
    quotaWei: data ?? 0n,
    isLoading,
    error,
    refetch,
  };
}

// Hook untuk membaca platform fee
export function usePlatformFee() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESSES.LOYALTY_POINT as `0x${string}`,
    abi: LOYALTY_POINT_ABI,
    functionName: "platformFee",
  });

  return {
    fee: data ? Number(data) : 0,
    feePercentage: data ? Number(data) / 100 : 0, // Convert basis points to percentage
    isLoading,
    error,
  };
}

// Hook untuk transfer points
export function useTransferPoints() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const transferPoints = async (to: string, amount: string) => {
    try {
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESSES.LOYALTY_POINT as `0x${string}`,
        abi: LOYALTY_POINT_ABI,
        functionName: "transferPoint",
        args: [to as `0x${string}`, parseEther(amount)],
      });

      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    transferPoints,
    isPending,
    error,
  };
}

// Hook untuk redeem points
export function useRedeemPoints() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const redeemPoints = async (amount: string) => {
    try {
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESSES.LOYALTY_POINT as `0x${string}`,
        abi: LOYALTY_POINT_ABI,
        functionName: "redeemPoint",
        args: [parseEther(amount)],
      });

      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    redeemPoints,
    isPending,
    error,
  };
}

// Hook untuk issue points (merchant only)
export function useIssuePoints() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const issuePoints = async (to: string, amount: string) => {
    try {
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESSES.LOYALTY_POINT as `0x${string}`,
        abi: LOYALTY_POINT_ABI,
        functionName: "issuePoint",
        args: [to as `0x${string}`, parseEther(amount)],
      });

      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    issuePoints,
    isPending,
    error,
  };
}

// Hook untuk top up IDRX (merchant only)
export function useTopUpIDRX() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const topUpIDRX = async (amount: string) => {
    try {
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESSES.LOYALTY_POINT as `0x${string}`,
        abi: LOYALTY_POINT_ABI,
        functionName: "topUpIDRX",
        args: [parseEther(amount)],
      });

      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    topUpIDRX,
    isPending,
    error,
  };
}

// Hook untuk withdraw IDRX (merchant only)
export function useWithdrawIDRX() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const withdrawIDRX = async (amount: string) => {
    try {
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESSES.LOYALTY_POINT as `0x${string}`,
        abi: LOYALTY_POINT_ABI,
        functionName: "withdrawIDRX",
        args: [parseEther(amount)],
      });

      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    withdrawIDRX,
    isPending,
    error,
  };
}
