import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

const PROVIDERS = [
  {
    key: "lieferando",
    name: "Lieferando",
    logo: "/logos/lieferando.png",
    desc: {
      en: "Connect your POS to Lieferando for seamless online orders.",
      de: "Verbinden Sie Ihr POS mit Lieferando für nahtlose Online-Bestellungen."
    }
  },
  {
    key: "wolt",
    name: "Wolt",
    logo: "/logos/wolt.png",
    desc: {
      en: "Integrate with Wolt to receive delivery orders directly in your POS.",
      de: "Integrieren Sie Wolt, um Lieferbestellungen direkt im POS zu empfangen."
    }
  },
  {
    key: "ubereats",
    name: "Uber Eats",
    logo: "/logos/ubereats.png",
    desc: {
      en: "Sync your menu and orders with Uber Eats.",
      de: "Synchronisieren Sie Ihr Menü und Bestellungen mit Uber Eats."
    }
  },
  {
    key: "foodora",
    name: "Foodora",
    logo: "/logos/foodora.png",
    desc: {
      en: "Connect Foodora for more online sales.",
      de: "Verbinden Sie Foodora für mehr Online-Verkäufe."
    }
  },
  {
    key: "custom",
    name: "Custom Webhook",
    logo: "/logos/webhook.png",
    desc: {
      en: "Set up a custom API webhook for order sync.",
      de: "Richten Sie einen benutzerdefinierten API-Webhook für die Bestellsynchronisierung ein."
    }
  }
];

const mockStatus: Record<string, "connected" | "disconnected"> = {
  lieferando: "disconnected",
  wolt: "disconnected",
  ubereats: "disconnected",
  foodora: "disconnected",
  custom: "disconnected"
};

export default function DeliveryIntegrationsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [status, setStatus] = useState(mockStatus);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleConnect = (key: string) => {
    setStatus((prev) => ({ ...prev, [key]: prev[key] === "connected" ? "disconnected" : "connected" }));
    toast({
      title: prev[key] === "connected" ? t("delivery.disconnected") : t("delivery.connected"),
      description: prev[key] === "connected"
        ? t("delivery.disconnect_success", { provider: key })
        : t("delivery.connect_success", { provider: key }),
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("delivery.title", "Online Ordering & Delivery Integration")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {PROVIDERS.map((provider) => (
          <Card key={provider.key} className="flex flex-col items-center text-center">
            <CardHeader>
              <img src={provider.logo} alt={provider.name} className="h-12 mb-2" />
              <CardTitle>{provider.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{provider.desc[i18n.language as "en" | "de"]}</p>
              <Button
                variant={status[provider.key] === "connected" ? "outline" : "default"}
                className={status[provider.key] === "connected" ? "border-green-500 text-green-700" : ""}
                onClick={() => handleConnect(provider.key)}
              >
                {status[provider.key] === "connected" ? t("delivery.disconnect", "Disconnect") : t("delivery.connect", "Connect")}
              </Button>
              <div className="mt-2 text-xs text-gray-500">
                {t("delivery.status", "Status")}: {status[provider.key]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <Button variant="outline" onClick={() => setShowAdvanced((v) => !v)}>
          {showAdvanced ? t("delivery.hide_advanced", "Hide Advanced Settings") : t("delivery.show_advanced", "Show Advanced Settings")}
        </Button>
        {showAdvanced && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h2 className="font-semibold mb-2">{t("delivery.advanced_title", "Advanced Settings")}</h2>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">{t("delivery.webhook_url", "Webhook URL for order sync")}</label>
              <input className="w-full border rounded p-2" placeholder="https://your-pos.com/api/webhook" />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm font-medium">{t("delivery.auto_accept", "Auto-accept orders")}</label>
              <input type="checkbox" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">{t("delivery.printer_routing", "Printer routing logic")}</label>
              <select className="w-full border rounded p-2">
                <option>{t("delivery.kitchen_only", "Send delivery orders to kitchen only")}</option>
                <option>{t("delivery.all_printers", "Send to all printers")}</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 