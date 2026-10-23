-- =====================================================
-- CONTA FACIL | CONTROLE FINANCEIRO
-- Banco de dados: Supabase PostgreSQL
-- Versao inicial: sem compartilhamento de transacoes
-- =====================================================

-- 1. PERFIS DOS USUARIOS
--auth.users: guarda a identidade de autenticação, incluindo e-mail e informações protegidas da senha. 
--O Supabase mantém os dados de autenticação em uma tabela própria, chamada auth.users, que é gerenciada pelo serviço de autenticação.
--public.profiles: guarda os dados complementares do usuário, como nome, telefone e avatar.
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
--public.categories: guarda as categorias de cada usuário.
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
--public.transactions: guarda as transações de cada usuário.
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

-- 6. CRIACAO AUTOMATICA DE PERFIL DE USUARIO
--Quando o Supabase cria um usuário em auth.users, precisamos de um gatilho (trigger) para criar o registro correspondente em public.profiles.
--para não precisar inserir manualmente os dados em profiles.
--NEW.id: reutiliza o identificador do usuário autenticado.
--raw_user_meta_data: recupera o nome enviado pelo formulário de cadastro.
--COALESCE: garante um nome padrão caso o nome não esteja disponível.
--AFTER INSERT ON auth.users: cria o perfil automaticamente após o registro do usuário.
--SECURITY DEFINER e search_path = '': ajudam a executar a função com permissões controladas e evitar ambiguidades na resolução de objetos do banco.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
            'Usuário'
        )
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- =====================================================
-- FIM
-- =====================================================








