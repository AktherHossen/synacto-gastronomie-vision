import { supabase } from "@/integrations/supabase/client";

export async function getIntegrations(vendorId: string) {
  const { data, error } = await supabase
    .from("delivery_integrations")
    .select("*")
    .eq("vendor_id", vendorId);
  if (error) throw error;
  return data;
}

export async function setIntegrationStatus(vendorId: string, provider: string, status: "connected" | "disconnected", apiKey?: string) {
  const { data, error } = await supabase
    .from("delivery_integrations")
    .upsert([
      { vendor_id: vendorId, provider, status, api_key: apiKey }
    ], { onConflict: "vendor_id,provider" });
  if (error) throw error;
  return data;
} 