import React, { createContext, useContext } from "react";

type Vendor = {
  id: string;
  name: string;
  subscription: "starter" | "pro" | "enterprise";
  trialEnd: string; // ISO date string
};

const VendorContext = createContext<Vendor>({
  id: "demo-vendor-1",
  name: "Demo Restaurant",
  subscription: "starter",
  trialEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days left
});

export const useVendor = () => useContext(VendorContext);

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // You can make this dynamic or fetch from Supabase in a real app
  return (
    <VendorContext.Provider value={{
      id: "demo-vendor-1",
      name: "Demo Restaurant",
      subscription: "starter",
      trialEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    }}>
      {children}
    </VendorContext.Provider>
  );
}; 