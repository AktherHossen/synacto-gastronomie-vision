CREATE TABLE public.vendor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Index for fast lookup by vendor and admin
CREATE INDEX idx_vendor_sessions_vendor_id ON public.vendor_sessions(vendor_id);
CREATE INDEX idx_vendor_sessions_admin_id ON public.vendor_sessions(admin_id); 