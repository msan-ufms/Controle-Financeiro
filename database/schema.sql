-- =====================================================
-- CONTA FACIL | CONTROLE FINANCEIRO
-- Banco de dados: Supabase PostgreSQL
-- Versao inicial: sem compartilhamento de transacoes
-- =====================================================

-- 1. PERFIS DOS USUARIOS
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIAS
CREATE TABLE public.categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    type VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_categories_type
        CHECK (type IN ('receita', 'despesa')),

    CONSTRAINT uq_categories_user_name_type
        UNIQUE (user_id, name, type),

    CONSTRAINT uq_categories_user_id
        UNIQUE (user_id, id)
);

-- 3. TRANSACOES FINANCEIRAS
CREATE TABLE public.transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,
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

    CONSTRAINT fk_transactions_category_owner
        FOREIGN KEY (user_id, category_id)
        REFERENCES public.categories(user_id, id)
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
    ON public.categories(user_id);

CREATE INDEX idx_transactions_user_due_date
    ON public.transactions(user_id, due_date);

CREATE INDEX idx_transactions_user_status
    ON public.transactions(user_id, status);

CREATE INDEX idx_transactions_category
    ON public.transactions(category_id);


-- 5. SEGURANCA EM NIVEL DE LINHA (RLS)
-- Ativa o controle de acesso aos registros de cada tabela.
-- O acesso sera permitido conforme as politicas de seguranca
-- definidas posteriormente para cada usuario autenticado.
-- A ativacao do RLS, por si so, nao cria politicas de acesso.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIM
-- =====================================================