CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    features JSONB NOT NULL,
    trial_days INTEGER NOT NULL DEFAULT 7,
    max_users INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by name
CREATE UNIQUE INDEX idx_subscriptions_name ON public.subscriptions(name);

-- Example insert (remove in production)
INSERT INTO public.subscriptions (name, price, features, trial_days, max_users)
VALUES
  ('Starter', 0, '["basic_orders"]', 7, 3),
  ('Pro', 49, '["basic_orders","floor_plan","kitchen_display"]', 7, 10),
  ('Enterprise', 199, '["basic_orders","floor_plan","kitchen_display","multi_terminal","advanced_reports"]', 7, 100); 