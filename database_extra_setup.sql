-- Extra database setup for Supabase/PostgreSQL
-- Purpose: enable RLS, add indexes, create manager analytics views, and add helper trigger

-- ------------------------------------------------------------
-- 1. Helper function for updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 2. Apply updated_at trigger to all tables used by the app
-- ------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'workers_set_updated_at'
    ) THEN
        CREATE TRIGGER workers_set_updated_at
        BEFORE UPDATE ON workers
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'products_set_updated_at'
    ) THEN
        CREATE TRIGGER products_set_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'billing_settings_set_updated_at'
    ) THEN
        CREATE TRIGGER billing_settings_set_updated_at
        BEFORE UPDATE ON billing_settings
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'bills_set_updated_at'
    ) THEN
        CREATE TRIGGER bills_set_updated_at
        BEFORE UPDATE ON bills
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'submissions_set_updated_at'
    ) THEN
        CREATE TRIGGER submissions_set_updated_at
        BEFORE UPDATE ON submissions
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- ------------------------------------------------------------
-- 3. Extra indexes for search + dashboard work
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_name ON products (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_bills_customer_name ON bills (LOWER(customer_name));
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills (status);
CREATE INDEX IF NOT EXISTS idx_bills_payment_method ON bills (payment_method);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions (type);
CREATE INDEX IF NOT EXISTS idx_workers_last_login ON workers (last_login DESC NULLS LAST);

-- ------------------------------------------------------------
-- 4. RLS setup (recommended when using authenticated clients)
-- ------------------------------------------------------------
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workers_all_for_service_role" ON workers;
CREATE POLICY "workers_all_for_service_role"
ON workers
FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "products_all_for_service_role" ON products;
CREATE POLICY "products_all_for_service_role"
ON products
FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "billing_settings_all_for_service_role" ON billing_settings;
CREATE POLICY "billing_settings_all_for_service_role"
ON billing_settings
FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "bills_all_for_service_role" ON bills;
CREATE POLICY "bills_all_for_service_role"
ON bills
FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "submissions_all_for_service_role" ON submissions;
CREATE POLICY "submissions_all_for_service_role"
ON submissions
FOR ALL
USING (true)
WITH CHECK (true);

-- If you use Supabase with an authenticated app user instead of service-role, uncomment the pattern below:
-- CREATE POLICY "authenticated_users_read_products"
-- ON products
-- FOR SELECT
-- USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 5. Dashboard summary view for manager analytics
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW manager_bill_summary_daily AS
SELECT
    DATE(created_at) AS bill_date,
    COUNT(*) AS total_bills,
    COALESCE(SUM(total_amount), 0) AS total_sales,
    COALESCE(SUM(tax_amount), 0) AS total_gst,
    COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) AS cash_collected,
    COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END), 0) AS card_collected,
    COALESCE(SUM(CASE WHEN payment_method = 'online' THEN total_amount ELSE 0 END), 0) AS online_collected,
    COALESCE(SUM(CASE WHEN payment_method = 'check' THEN total_amount ELSE 0 END), 0) AS check_collected
FROM bills
GROUP BY DATE(created_at)
ORDER BY bill_date DESC;

-- ------------------------------------------------------------
-- 6. Optional manager return summary view
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW manager_return_summary AS
SELECT
    customer_name,
    created_at,
    total_amount,
    discount,
    arrears,
    payment_method,
    CASE
        WHEN arrears > 0 THEN arrears
        ELSE 0
    END AS outstanding_amount,
    CASE
        WHEN discount > 0 THEN discount
        ELSE 0
    END AS discount_applied
FROM bills
ORDER BY created_at DESC;

-- ------------------------------------------------------------
-- End of extra setup
-- ------------------------------------------------------------
