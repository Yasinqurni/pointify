"use client";

import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";
import { useState, useEffect } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const [isDisconnected, setIsDisconnected] = useState(false);

  const handleLogout = async () => {
    try {
      await disconnect();
      await router.push("/");
      console.log("Logged out from Xellar Wallet");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Button
      onPress={handleLogout}
      variant="solid"
      className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </Button>
  );
}
