"use client";
import { useState } from "react";

export default function IDRXBalance() {
  const [address] = useState("0x1234...5678");
  const [balance] = useState({ formatted: "100.0" });
  return (
    <div>
      <p>
        {balance?.formatted
          ? parseFloat(balance.formatted).toLocaleString("id-ID", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
          : "0"}{" "}
        IDRX
      </p>
    </div>
  );
}
