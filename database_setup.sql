-- PostgreSQL / Supabase setup for Madhuban Traders
-- Run this script in your database to create all required tables and seed data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- 1. Workers / manager auth
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'manager',
    token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

INSERT INTO workers (id, username, password_hash, name, role, created_at)
VALUES (
    'w1',
    'shop1',
    '1f5d9134b47329e61aaf3c2a5a2af8a95d712a6c01ab07b7dc5d2625c8713b54',
    'Shop Manager 1',
    'manager',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Billing settings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS billing_settings (
    id TEXT PRIMARY KEY,
    supplier_name TEXT NOT NULL DEFAULT 'MADHUBAN TRADERS',
    supplier_address TEXT NOT NULL DEFAULT 'Sindhora, Varanasi, Uttar Pradesh 221208',
    supplier_gstin TEXT NOT NULL DEFAULT '09AAAAA0000A1Z5' CHECK (
        supplier_gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    ),
    supplier_fssai TEXT NOT NULL DEFAULT '10023051000123' CHECK (
        supplier_fssai ~ '^[0-9]{14}$'
    ),
    supplier_state_code TEXT NOT NULL DEFAULT '09',
    supplier_state_name TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO billing_settings (
    id,
    supplier_name,
    supplier_address,
    supplier_gstin,
    supplier_fssai,
    supplier_state_code,
    supplier_state_name,
    created_at,
    updated_at
)
VALUES (
    'default',
    'MADHUBAN TRADERS',
    'Sindhora, Varanasi, Uttar Pradesh 221208',
    '09AAAAA0000A1Z5',
    '10023051000123',
    '09',
    'Uttar Pradesh',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 3. Products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_hi TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    category TEXT DEFAULT 'General',
    description TEXT DEFAULT '',
    description_hi TEXT DEFAULT '',
    manufacturer TEXT DEFAULT 'Madhuban Traders',
    origin TEXT DEFAULT 'India',
    ingredients JSONB DEFAULT '[]'::jsonb,
    health_benefits JSONB DEFAULT '[]'::jsonb,
    health_benefits_hi JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    hsn_code TEXT NOT NULL DEFAULT '1514',
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 5,
    variants JSONB DEFAULT '[]'::jsonb,
    stock INTEGER NOT NULL DEFAULT 0,
    image TEXT DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INSERT INTO products (
--     id,
--     name,
--     name_hi,
--     price,
--     category,
--     description,
--     description_hi,
--     manufacturer,
--     origin,
--     ingredients,
--     health_benefits,
--     health_benefits_hi,
--     certifications,
--     hsn_code,
--     gst_rate,
--     variants,
--     stock,
--     image,
--     images,
--     created_at,
--     updated_at
-- )
-- VALUES
-- (
--     'prod-1',
--     'Mustard Oil (Kacchi Ghani)',
--     'सरसों का तेल (कच्ची घानी)',
--     190,
--     'Oils',
--     'Authentic Kacchi Ghani Mustard Oil with rich natural aroma.',
--     'प्राकृतिक खुशबू वाला असली कच्ची घानी सरसों का तेल।',
--     'Madhuban Oils Co.',
--     'Rajasthan, India',
--     '["Cold-pressed mustard oil"]',
--     '["Rich in MUFA", "Supports heart health"]',
--     '["MUFA से भरपूर", "हृदय स्वास्थ्य के लिए मददगार"]',
--     '["FSSAI"]',
--     '1514',
--     5,
--     '[{"id":"v1a","label":"1 L","price":195}]',
--     25,
--     '',
--     '[]',
--     NOW(),
--     NOW()
-- ),
-- (
--     'prod-2',
--     'Groundnut Oil',
--     'मूंगफली का तेल',
--     70,
--     'Oils',
--     'Pure groundnut oil ideal for frying and cooking.',
--     'तलने और पकाने के लिए उपयुक्त शुद्ध मूंगफली का तेल।',
--     'Madhuban Oils Co.',
--     'Gujarat, India',
--     '["Cold-pressed groundnut oil"]',
--     '["High smoke point", "Vitamin E enriched"]',
--     '["उच्च स्मोक पॉइंट", "विटामिन ई समृद्ध"]',
--     '["FSSAI"]',
--     '1508',
--     5,
--     '[{"id":"v2a","label":"500 ml","price":150}]',
--     18,
--     '',
--     '[]',
--     NOW(),
--     NOW()
-- ),
-- (
--     'prod-3',
--     'Turmeric Powder',
--     'हल्दी पाउडर',
--     90,
--     'Spices',
--     'Premium turmeric powder with natural color and aroma.',
--     'प्राकृतिक रंग और खुशबू वाला प्रीमियम हल्दी पाउडर।',
--     'Madhuban Traders',
--     'India',
--     '["Turmeric"]',
--     '["Anti-inflammatory", "Good for immunity"]',
--     '["एंटी-इंफ्लेमेटरी", "प्रतिरक्षा के लिए उत्तम"]',
--     '["FSSAI"]',
--     '0910',
--     5,
--     '[{"id":"v3a","label":"500 g","price":95}]',
--     40,
--     '',
--     '[]',
--     NOW(),
--     NOW()
-- )
-- ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 4. Bills
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    bill_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL DEFAULT 'Walk-in Customer',
    customer_phone TEXT,
    customer_address TEXT,
    customer_gstin TEXT,
    customer_state_code TEXT,
    customer_state_name TEXT,
    supplier_name TEXT,
    supplier_address TEXT,
    supplier_gstin TEXT,
    supplier_fssai TEXT,
    supplier_state_code TEXT,
    supplier_state_name TEXT,
    invoice_number TEXT,
    is_b2b BOOLEAN NOT NULL DEFAULT TRUE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    taxable_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    cgst NUMERIC(12,2) NOT NULL DEFAULT 0,
    sgst NUMERIC(12,2) NOT NULL DEFAULT 0,
    igst NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    arrears NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'completed',
    created_by TEXT,
    created_by_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. Submissions / inbound forms
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'inquiry',
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    page TEXT,
    customer JSONB,
    cart JSONB,
    subtotal NUMERIC(12,2) DEFAULT 0,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. Useful indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_workers_username ON workers(username);
CREATE INDEX IF NOT EXISTS idx_billing_settings_id ON billing_settings(id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_received_at ON submissions(received_at DESC);

-- ------------------------------------------------------------
-- 7. Optional trigger to keep updated_at fresh
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
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
-- End of setup
-- ------------------------------------------------------------
