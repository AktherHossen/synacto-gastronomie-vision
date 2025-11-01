ALTER TABLE public.vendors
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT;

CREATE INDEX idx_vendors_stripe_customer_id ON public.vendors(stripe_customer_id);
CREATE INDEX idx_vendors_stripe_subscription_id ON public.vendors(stripe_subscription_id); 