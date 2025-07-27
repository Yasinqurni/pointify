"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import Image from "next/image";

interface ReconnectWalletProps {
  onReconnect: () => void;
}

export default function ReconnectWallet({ onReconnect }: ReconnectWalletProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full animate-fade-in">
        <div className="flex flex-col items-center">
          <Image
            src="/idrxLogo.svg"
            alt="IDRX Logo"
            width={80}
            height={80}
            className="mb-4"
          />

          <h2 className="text-xl font-semibold mb-2 text-center">
            Koneksi Wallet Terputus
          </h2>

          <p className="text-gray-600 text-center mb-4">
            Waktu koneksi sudah habis atau terjadi masalah dengan wallet Anda.
            Silakan coba sambungkan kembali.
          </p>

          <div className="flex gap-2 w-full">
            <Button
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800"
              onPress={() => window.location.reload()}
            >
              Refresh Halaman
            </Button>

            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              onPress={onReconnect}
            >
              Hubungkan Wallet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
