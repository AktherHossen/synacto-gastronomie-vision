CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE RESTRICT,
    trial_start DATE NOT NULL DEFAULT CURRENT_DATE,
    trial_end DATE NOT NULL,
    license_key TEXT UNIQUE NOT NULL,
    active_sessions INTEGER NOT NULL DEFAULT 0,
    max_sessions INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by license_key
CREATE UNIQUE INDEX idx_vendors_license_key ON public.vendors(license_key); 