-- EXTENSIONS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- ENUMS
-- =========================================================

CREATE TYPE user_role_enum AS ENUM (
    'USER',
    'ADMIN'
);

CREATE TYPE user_status_enum AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'DELETED'
);

CREATE TYPE package_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'ARCHIVED'
);

CREATE TYPE transaction_status_enum AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);

CREATE TYPE payment_method_enum AS ENUM (
    'FAKE_PAYMENT',
    'STRIPE',
    'PAYPAL'
);

CREATE TYPE ledger_type_enum AS ENUM (
    'PURCHASE',
    'USAGE',
    'REFUND',
    'BONUS',
    'EXPIRE',
    'ADMIN_ADJUSTMENT'
);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    role user_role_enum NOT NULL DEFAULT 'USER',
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =========================================================
-- CREDIT WALLETS
-- =========================================================

CREATE TABLE credit_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,

    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- FEATURES
-- =========================================================

CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- PACKAGES
-- =========================================================

CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,

    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    credits BIGINT NOT NULL CHECK (credits > 0),

    status package_status_enum NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =========================================================
-- PACKAGE FEATURES
-- =========================================================

CREATE TABLE package_features (
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (package_id, feature_id)
);

-- =========================================================
-- TRANSACTIONS
-- =========================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,

    package_name VARCHAR(255) NOT NULL,

    status transaction_status_enum NOT NULL DEFAULT 'PENDING',

    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    credits_added BIGINT NOT NULL CHECK (credits_added > 0),

    payment_method payment_method_enum NOT NULL DEFAULT 'FAKE_PAYMENT',
    payment_reference VARCHAR(255),

    idempotency_key UUID NOT NULL UNIQUE,

    failure_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =========================================================
-- CREDIT LEDGER
-- =========================================================

CREATE TABLE credit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    transaction_id UUID REFERENCES transactions(id) ON DELETE RESTRICT,

    type ledger_type_enum NOT NULL,

    amount BIGINT NOT NULL CHECK (amount <> 0),

    balance_before BIGINT NOT NULL CHECK (balance_before >= 0),
    balance_after BIGINT NOT NULL CHECK (balance_after >= 0),

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_credit_ledger_balance_math
    CHECK (balance_after = balance_before + amount)
);

-- =========================================================
-- USER FEATURES
-- =========================================================

CREATE TABLE user_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    feature_code VARCHAR(100) NOT NULL REFERENCES features(code) ON DELETE RESTRICT,

    source_transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,

    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expired_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_users_status
ON users(status);

CREATE INDEX idx_users_role
ON users(role);

CREATE INDEX idx_wallets_user
ON credit_wallets(user_id);

CREATE INDEX idx_features_code
ON features(code);

CREATE INDEX idx_features_active
ON features(is_active);

CREATE INDEX idx_packages_status
ON packages(status);

CREATE INDEX idx_package_features_package
ON package_features(package_id);

CREATE INDEX idx_package_features_feature
ON package_features(feature_id);

CREATE INDEX idx_transactions_user
ON transactions(user_id);

CREATE INDEX idx_transactions_package
ON transactions(package_id);

CREATE INDEX idx_transactions_status
ON transactions(status);

CREATE INDEX idx_transactions_created_at
ON transactions(created_at DESC);

CREATE INDEX idx_ledger_user
ON credit_ledger(user_id);

CREATE INDEX idx_ledger_transaction
ON credit_ledger(transaction_id);

CREATE INDEX idx_ledger_created_at
ON credit_ledger(created_at DESC);

CREATE INDEX idx_user_features_lookup
ON user_features(user_id, feature_code);

CREATE INDEX idx_user_features_active_lookup
ON user_features(user_id, feature_code)
WHERE revoked_at IS NULL;

-- =========================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_wallets_updated_at
BEFORE UPDATE ON credit_wallets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_features_updated_at
BEFORE UPDATE ON features
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_packages_updated_at
BEFORE UPDATE ON packages
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- SEED FEATURES
-- =========================================================

INSERT INTO features (code, name, description)
VALUES
    ('AI_CHAT', 'AI Chat', 'AI assistant access'),
    ('IMAGE_GENERATION', 'Image Generation', 'Generate AI images'),
    ('EXPORT_HD', 'Export HD', 'Export high quality content'),
    ('AUTO_POST', 'Auto Post', 'Automatically post content');

-- =========================================================
-- SEED PACKAGES
-- =========================================================

INSERT INTO packages (name, description, price, credits, status)
VALUES
    ('BASIC', 'Starter package for basic AI usage', 9.99, 100, 'ACTIVE'),
    ('PRO', 'Professional package with image generation and HD export', 29.99, 500, 'ACTIVE'),
    ('ENTERPRISE', 'Enterprise package with all advanced features', 99.99, 2000, 'ACTIVE');

-- =========================================================
-- SEED PACKAGE FEATURES
-- =========================================================

-- BASIC: AI_CHAT
INSERT INTO package_features (package_id, feature_id)
SELECT p.id, f.id
FROM packages p
JOIN features f ON f.code IN ('AI_CHAT')
WHERE p.name = 'BASIC';

-- PRO: AI_CHAT, IMAGE_GENERATION, EXPORT_HD
INSERT INTO package_features (package_id, feature_id)
SELECT p.id, f.id
FROM packages p
JOIN features f ON f.code IN (
    'AI_CHAT',
    'IMAGE_GENERATION',
    'EXPORT_HD'
)
WHERE p.name = 'PRO';

-- ENTERPRISE: ALL FEATURES
INSERT INTO package_features (package_id, feature_id)
SELECT p.id, f.id
FROM packages p
JOIN features f ON f.code IN (
    'AI_CHAT',
    'IMAGE_GENERATION',
    'EXPORT_HD',
    'AUTO_POST'
)
WHERE p.name = 'ENTERPRISE';

-- =========================================================
-- OPTIONAL ADMIN USER
-- password_hash should be generated by backend later
-- =========================================================

-- INSERT INTO users (email, password_hash, role, status)
-- VALUES (
--     'admin@example.com',
--     '$2b$12$replace_with_real_bcrypt_hash',
--     'ADMIN',
--     'ACTIVE'
-- );