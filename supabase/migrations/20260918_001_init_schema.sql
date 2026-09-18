-- ============================================================
-- Migration: 001_init_profiles
-- Bozor-Analitika MVP — Phase 2: Core DB Schema (Profiles)
-- ============================================================

-- Auto-update timestamp helper
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── PROFILES ─────────────────────────────────────────────────
CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('buyer', 'supplier', 'admin')),
  full_name         TEXT NOT NULL,
  company_name      TEXT,
  region            TEXT,
  address           TEXT,
  tin               TEXT,                          -- STIR/INN for suppliers
  telegram_id       BIGINT,                        -- Phase 15: Telegram integration

  -- KYB (Know Your Business) — for suppliers
  kyb_status        TEXT NOT NULL DEFAULT 'pending'
                      CHECK (kyb_status IN ('pending', 'verified', 'rejected')),
  kyb_verified_at   TIMESTAMPTZ,
  kyb_verified_by   UUID REFERENCES profiles(id),
  kyb_notes         TEXT,

  -- Trust & financials
  trust_score       NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (trust_score BETWEEN 0 AND 5),
  total_gmv         NUMERIC(18,2) NOT NULL DEFAULT 0.00,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── LISTINGS ─────────────────────────────────────────────────
CREATE TABLE listings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  category              TEXT NOT NULL,
  subcategory           TEXT,
  description           TEXT,
  unit                  TEXT NOT NULL,              -- ton, kg, litre, piece
  price_per_unit        NUMERIC(18,2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'UZS',
  moq                   NUMERIC(12,2) NOT NULL,     -- Min Order Qty
  available_quantity    NUMERIC(12,2) NOT NULL,
  location_region       TEXT NOT NULL,
  location_address      TEXT,
  delivery_regions      TEXT[],
  delivery_days         INTEGER NOT NULL DEFAULT 3,
  delivery_cost_per_ton NUMERIC(18,2) NOT NULL DEFAULT 0,
  price_updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  stock_status          TEXT NOT NULL DEFAULT 'available'
                          CHECK (stock_status IN ('available', 'low_stock', 'out_of_stock')),
  images                TEXT[],
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update price_updated_at when price changes
CREATE OR REPLACE FUNCTION update_price_freshness()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price_per_unit <> OLD.price_per_unit THEN
    NEW.price_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_price_freshness
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_price_freshness();

-- ── LISTING PRICING TIERS ────────────────────────────────────
CREATE TABLE listing_pricing_tiers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id     UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  min_quantity   NUMERIC(12,2) NOT NULL,
  max_quantity   NUMERIC(12,2),
  price_per_unit NUMERIC(18,2) NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PURCHASE REQUESTS (RFQ) ──────────────────────────────────
CREATE TABLE purchase_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  category            TEXT NOT NULL,
  subcategory         TEXT,
  requested_quantity  NUMERIC(12,2) NOT NULL,
  unit                TEXT NOT NULL,
  budget_per_unit     NUMERIC(18,2),
  total_budget        NUMERIC(18,2),
  destination_region  TEXT NOT NULL,
  required_by         DATE,
  urgency_level       TEXT NOT NULL DEFAULT 'normal'
                        CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
  additional_notes    TEXT,
  status              TEXT NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'matched', 'ordered', 'expired', 'cancelled')),
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_purchase_requests_updated_at
  BEFORE UPDATE ON purchase_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── MATCH RESULTS ────────────────────────────────────────────
CREATE TABLE match_results (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_request_id    UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  listing_id             UUID NOT NULL REFERENCES listings(id),
  supplier_id            UUID NOT NULL REFERENCES profiles(id),

  score_total            NUMERIC(5,4) NOT NULL,
  score_cost             NUMERIC(5,4),
  score_quantity         NUMERIC(5,4),
  score_delivery         NUMERIC(5,4),
  score_trust            NUMERIC(5,4),
  score_freshness        NUMERIC(5,4),

  recommendation_uz      TEXT,
  recommendation_ru      TEXT,

  offered_price_per_unit NUMERIC(18,2),
  offered_quantity       NUMERIC(12,2),
  estimated_delivery_days INTEGER,
  estimated_total_cost   NUMERIC(18,2),

  rank                   INTEGER NOT NULL,
  is_selected            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TYPE order_status AS ENUM (
  'pending',
  'matched',
  'confirmed',
  'in_delivery',
  'delivered',
  'completed',
  'disputed',
  'cancelled'
);

CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id            UUID NOT NULL REFERENCES profiles(id),
  supplier_id         UUID NOT NULL REFERENCES profiles(id),
  purchase_request_id UUID REFERENCES purchase_requests(id),
  match_result_id     UUID REFERENCES match_results(id),
  listing_id          UUID REFERENCES listings(id),

  status              order_status NOT NULL DEFAULT 'pending',

  quantity            NUMERIC(12,2) NOT NULL,
  unit                TEXT NOT NULL,
  price_per_unit      NUMERIC(18,2) NOT NULL,
  delivery_cost       NUMERIC(18,2) NOT NULL DEFAULT 0,
  subtotal            NUMERIC(18,2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  gmv                 NUMERIC(18,2) GENERATED ALWAYS AS (quantity * price_per_unit + delivery_cost) STORED,

  pickup_address      TEXT,
  delivery_address    TEXT NOT NULL,
  expected_delivery   DATE,
  actual_delivery     DATE,

  confirmed_by        UUID REFERENCES profiles(id),
  confirmed_at        TIMESTAMPTZ,
  confirmation_method TEXT CHECK (confirmation_method IN ('manual_call', 'buyer_app', 'auto')),

  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ORDER TIMELINE ───────────────────────────────────────────
CREATE TABLE order_timeline (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  changed_by  UUID REFERENCES profiles(id),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-log every status change
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    INSERT INTO order_timeline (order_id, from_status, to_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_timeline
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ── FINANCIAL LEDGER ─────────────────────────────────────────
CREATE TABLE financial_ledger (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id),
  supplier_id       UUID NOT NULL REFERENCES profiles(id),

  gmv               NUMERIC(18,2) NOT NULL,
  commission_rate   NUMERIC(5,4) NOT NULL DEFAULT 0.0200,
  commission_amount NUMERIC(18,2) GENERATED ALWAYS AS (gmv * commission_rate) STORED,

  payment_status    TEXT NOT NULL DEFAULT 'pending'
                      CHECK (payment_status IN ('pending', 'invoiced', 'paid', 'waived', 'disputed')),
  invoice_number    TEXT UNIQUE,
  invoiced_at       TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  payment_method    TEXT,
  payment_reference TEXT,
  notes             TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_ledger_updated_at
  BEFORE UPDATE ON financial_ledger
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create ledger entry when order is completed
CREATE OR REPLACE FUNCTION create_commission_on_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'delivered' THEN
    INSERT INTO financial_ledger (order_id, supplier_id, gmv)
    VALUES (NEW.id, NEW.supplier_id, NEW.gmv);

    UPDATE profiles
    SET total_gmv = total_gmv + NEW.gmv
    WHERE id = NEW.supplier_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_commission_on_complete
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION create_commission_on_complete();

-- ── RATINGS ──────────────────────────────────────────────────
CREATE TABLE ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id),
  rater_id   UUID NOT NULL REFERENCES profiles(id),
  ratee_id   UUID NOT NULL REFERENCES profiles(id),
  role       TEXT CHECK (role IN ('buyer_rates_supplier', 'supplier_rates_buyer')),
  score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, rater_id, ratee_id)
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  channel    TEXT NOT NULL DEFAULT 'app'
               CHECK (channel IN ('app', 'telegram', 'sms')),
  sent_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_listings_category_active  ON listings(category, is_active);
CREATE INDEX idx_listings_region           ON listings(location_region);
CREATE INDEX idx_listings_supplier         ON listings(supplier_id);
CREATE INDEX idx_purchase_requests_buyer   ON purchase_requests(buyer_id, status);
CREATE INDEX idx_purchase_requests_status  ON purchase_requests(status, expires_at);
CREATE INDEX idx_orders_buyer              ON orders(buyer_id, status);
CREATE INDEX idx_orders_supplier           ON orders(supplier_id, status);
CREATE INDEX idx_match_results_request     ON match_results(purchase_request_id, rank);
CREATE INDEX idx_ledger_supplier           ON financial_ledger(supplier_id, payment_status);
CREATE INDEX idx_notifications_user        ON notifications(user_id, is_read, created_at DESC);
