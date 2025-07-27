"use client";

import { useUserPoints, useMerchantQuota } from "@/hooks/useLoyaltyPoint";

interface LoyaltyPointBalanceProps {
  address?: string;
  showMerchantQuota?: boolean;
}

export default function LoyaltyPointBalance({
  address,
  showMerchantQuota = false,
}: LoyaltyPointBalanceProps) {
  const { points, isLoading: pointsLoading } = useUserPoints(address);
  const { quota, isLoading: quotaLoading } = useMerchantQuota(address);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="pb-2">
          <h3 className="text-lg font-semibold text-blue-800">
            Loyalty Points
          </h3>
        </div>
        <div>
          {pointsLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-blue-200 rounded" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-blue-900">{points}</p>
          )}
        </div>
      </div>

      {showMerchantQuota && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="pb-2">
            <h3 className="text-lg font-semibold text-green-800">
              Merchant Quota
            </h3>
          </div>
          <div>
            {quotaLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-green-200 rounded" />
              </div>
            ) : (
              <p className="text-3xl font-bold text-green-900">{quota} IDRX</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
