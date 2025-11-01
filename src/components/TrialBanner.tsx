import React from "react";
import { useVendor } from "@/context/VendorContext";

export const TrialBanner: React.FC = () => {
  const { trialEnd, subscription } = useVendor();
  if (subscription !== "starter") return null;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-4 flex justify-between items-center">
      <span>
        Your free trial ends in <b>{daysLeft} days</b>. Upgrade to keep using all features!
      </span>
      <button className="bg-purple-600 text-white px-4 py-2 rounded font-semibold">
        Upgrade
      </button>
    </div>
  );
}; 