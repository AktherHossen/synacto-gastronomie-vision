CREATE TABLE public.delivery_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected')),
    api_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_integrations_vendor_id ON public.delivery_integrations(vendor_id);
CREATE INDEX idx_delivery_integrations_provider ON public.delivery_integrations(provider); 