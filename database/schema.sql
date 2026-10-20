
-- =====================================================
-- CONTA FACIL | CONTROLE FINANCEIRO
-- Banco de dados: PostgreSQL (Neon)
-- Arquivo: database/schema.sql
-- =====================================================

-- 1. USUARIOS
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_users_email_lower
    ON users (LOWER(email));

-- 2. CATEGORIAS
CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(80) NOT NULL,
    type VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_categories_type
        CHECK (type IN ('receita', 'despesa')),

    CONSTRAINT uq_categories_user_name_type
        UNIQUE (user_id, name, type),

    CONSTRAINT uq_categories_user_id
        UNIQUE (user_id, id)
);

-- 3. LANCAMENTOS FINANCEIROS
CREATE TABLE transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    description VARCHAR(200) NOT NULL,
    type VARCHAR(10) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pendente',
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transactions_category_owner
        FOREIGN KEY (user_id, category_id)
        REFERENCES categories(user_id, id)
        ON DELETE RESTRICT,

    CONSTRAINT ck_transactions_type
        CHECK (type IN ('receita', 'despesa')),

    CONSTRAINT ck_transactions_amount
        CHECK (amount > 0),

    CONSTRAINT ck_transactions_status
        CHECK (status IN ('pendente', 'vencida', 'paga')),

    CONSTRAINT ck_transactions_paid_at
        CHECK (status <> 'paga' OR paid_at IS NOT NULL)
);

-- 4. INDICES
CREATE INDEX idx_categories_user
    ON categories(user_id);

CREATE INDEX idx_transactions_user_due_date
    ON transactions(user_id, due_date);

CREATE INDEX idx_transactions_user_status
    ON transactions(user_id, status);

CREATE INDEX idx_transactions_category
    ON transactions(category_id);

-- =====================================================
-- FIM DO ESQUEMA
-- =====================================================
