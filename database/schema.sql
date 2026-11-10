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

-- 3. GRUPOS DE PARCELAMENTO E REPETICAO
-- Guarda os dados gerais de cada grupo. Cada parcela ou ocorrencia continua
-- sendo uma transacao independente na tabela public.transactions.
CREATE TABLE public.transaction_groups (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,
    group_type VARCHAR(15) NOT NULL
        CHECK (group_type IN ('parcelamento', 'repeticao')),
    amount_mode VARCHAR(20),
    item_count INTEGER NOT NULL
        CHECK (item_count >= 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_transaction_groups_amount_mode
        CHECK (
            (group_type = 'parcelamento'
                AND amount_mode IN ('dividir_total', 'repetir_valor'))
            OR
            (group_type = 'repeticao'
                AND amount_mode IS NULL)
        ),

    -- Permite que transactions valide o grupo e o proprietario em conjunto.
    CONSTRAINT uq_transaction_groups_user_id
        UNIQUE (user_id, id)
);

-- 4. TRANSACOES FINANCEIRAS

--public.transactions: guarda as transações de cada usuário.
CREATE TABLE public.transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id BIGINT,
    group_id BIGINT,
    group_position INTEGER,
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

    -- Garante que o grupo vinculado pertence ao mesmo usuario da transacao.
    CONSTRAINT fk_transactions_group
        FOREIGN KEY (user_id, group_id)
        REFERENCES public.transaction_groups(user_id, id)
        ON DELETE RESTRICT,

    -- Contas normais nao possuem grupo nem posicao.
    -- Contas agrupadas precisam de uma posicao inteira maior que zero.
    CONSTRAINT chk_transactions_group_position
        CHECK (
            (group_id IS NULL AND group_position IS NULL)
            OR
            (group_id IS NOT NULL
                AND group_position IS NOT NULL
                AND group_position > 0)
        ),

    CONSTRAINT ck_transactions_type
        CHECK (type IN ('receita', 'despesa')),

    CONSTRAINT ck_transactions_amount
        CHECK (amount > 0),

    CONSTRAINT ck_transactions_status
        CHECK (status IN ('pendente', 'vencida', 'paga')),

    CONSTRAINT ck_transactions_paid_at
        CHECK (status <> 'paga' OR paid_at IS NOT NULL)
);

-- 5. INDICES
CREATE INDEX idx_categories_user
    ON public.categories(user_id);

CREATE INDEX idx_transactions_user_due_date
    ON public.transactions(user_id, due_date);

CREATE INDEX idx_transactions_user_status
    ON public.transactions(user_id, status);

CREATE INDEX idx_transactions_category
    ON public.transactions(category_id);

-- Acelera a busca das transacoes que pertencem a um grupo.
CREATE INDEX idx_transactions_group_id
    ON public.transactions(group_id)
    WHERE group_id IS NOT NULL;

-- Impede que duas transacoes ocupem a mesma posicao dentro do mesmo grupo.
CREATE UNIQUE INDEX uq_transactions_group_position
    ON public.transactions(group_id, group_position)
    WHERE group_id IS NOT NULL;


-- 6. ATUALIZAÇÃO AUTOMÁTICA DA DATA DE MODIFICAÇÃO
-- Atualiza automaticamente o campo updated_at da tabela transactions
-- sempre que um registro for alterado, permitindo identificar as contas
-- modificadas mais recentemente no histórico do Dashboard.

CREATE OR REPLACE FUNCTION public.set_transaction_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_transaction_updated_at();



-- 7. SEGURANCA EM NIVEL DE LINHA (RLS)
-- Ativa o controle de acesso aos registros de cada tabela.
-- O acesso sera permitido conforme as politicas de seguranca
-- definidas posteriormente para cada usuario autenticado.
-- A ativacao do RLS, por si so, nao cria politicas de acesso.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_groups ENABLE ROW LEVEL SECURITY;

-- 8. CRIACAO AUTOMATICA DE PERFIL DE USUARIO
--Quando o Supabase cria um usuário em auth.users, precisamos de um gatilho (trigger) para criar o registro correspondente em public.profiles.
--para não precisar inserir manualmente os dados em profiles.
--NEW.id: reutiliza o identificador do usuário autenticado.
--raw_user_meta_data: recupera o nome enviado pelo formulário de cadastro.
--COALESCE: garante um nome padrão caso o nome não esteja disponível.
--AFTER INSERT ON auth.users: cria o perfil automaticamente após o registro do usuário.
--SECURITY DEFINER e search_path = '': ajudam a executar a função com permissões controladas e evitar ambiguidades na resolução de objetos do banco.

BEGIN;

-- Atualiza a função que cria o perfil do usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    -- Cria o perfil
    INSERT INTO public.profiles (id, name)
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
            'Usuário'
        )
    );

    -- Cria as categorias padrão de despesas
    INSERT INTO public.categories (user_id, name, type)
    VALUES
        (NEW.id, 'Alimentação', 'despesa'),
        (NEW.id, 'Moradia', 'despesa'),
        (NEW.id, 'Transporte', 'despesa'),
        (NEW.id, 'Saúde', 'despesa'),
        (NEW.id, 'Educação', 'despesa'),
        (NEW.id, 'Lazer', 'despesa'),
        (NEW.id, 'Compras', 'despesa'),
        (NEW.id, 'Serviços', 'despesa'),
        (NEW.id, 'Outros', 'despesa')
    ON CONFLICT (user_id, name, type) DO NOTHING;

    RETURN NEW;
END;
$function$;

-- Cria as categorias para os usuários já cadastrados
INSERT INTO public.categories (user_id, name, type)
SELECT
    users.id,
    defaults.name,
    'despesa'
FROM auth.users AS users
CROSS JOIN (
    VALUES
        ('Alimentação'),
        ('Moradia'),
        ('Transporte'),
        ('Saúde'),
        ('Educação'),
        ('Lazer'),
        ('Compras'),
        ('Serviços'),
        ('Outros')
) AS defaults(name)
ON CONFLICT (user_id, name, type) DO NOTHING;

COMMIT;


DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- 9. POLITICAS DE SEGURANCA (RLS)

-- POLÍTICAS DE CONSULTAS: 
-- permite que usuários autenticados façam consultas às tabelas,
-- mas apenas aos registros que pertencem a eles, através do user_id, que é o identificador do usuário conectado.

CREATE POLICY "Usuário pode consultar o próprio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    (SELECT auth.uid()) = id
);

CREATE POLICY "Usuário pode consultar próprias categorias"
ON public.categories
FOR SELECT
TO authenticated
USING (
    (SELECT auth.uid()) = user_id
);

CREATE POLICY "Usuário pode consultar próprias transações"
ON public.transactions
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- POLITICAS PARA GRUPOS DE PARCELAMENTO E REPETICAO
-- O usuario pode consultar e cadastrar somente os proprios grupos.
CREATE POLICY "Usuário pode consultar próprios grupos de transações"
ON public.transaction_groups
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);


-- POLÍTICAS DE CADASTRO
-- permite que usuários autenticados façam cadastros,
-- impede que o usuário cadastre e vincule à outra pessoa

CREATE POLICY "Usuário pode cadastrar próprias categorias"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id); -- with check: GARANTE QUE O USUÁRIO SÓ PODE INSERIR CATEGORIAS COM SEU PRÓPRIO user_id.

CREATE POLICY "Usuário pode cadastrar próprias transações"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Usuário pode cadastrar próprios grupos de transações"
ON public.transaction_groups
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);



-- POLÍTICAS DE EDIÇÃO
-- permite que usuários autenticados façam edições
-- impede que o usuário edite registros de outra pessoa

CREATE POLICY "Usuário pode editar próprias categorias"
ON public.categories
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id) -- USING: permite editar somente categorias que pertencem ao usuário autenticado.
WITH CHECK ((SELECT auth.uid()) = user_id); -- WITH CHECK: impede que, após a edição, a categoria seja vinculada a outro usuário.

CREATE POLICY "Usuário pode editar próprias transações"
ON public.transactions
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);



-- IMPEDE QUE O USUÁRIO EXCLUA UMA CATEGORIA VINCULADA À OUTRA PESSOA
CREATE POLICY "Usuário pode excluir próprias categorias"
ON public.categories
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Usuário pode excluir próprias transações"
ON public.transactions
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Os grupos nao possuem politicas de UPDATE ou DELETE:
-- seus dados gerais e sua quantidade ficam fixos apos a criacao.
-- As alteracoes das contas individuais sao controladas em transactions.

-- 10. GRANT DE PERMISSOES 
--GRANT SELECT: permite que usuários autenticados façam consultas à tabela.

--PERMITE A LEITURA
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.categories TO authenticated;
GRANT SELECT ON TABLE public.transactions TO authenticated;
GRANT SELECT, INSERT ON TABLE public.transaction_groups TO authenticated;

-- PERMITE O CADASTRO. INSERÇÃO.
GRANT INSERT ON TABLE public.categories TO authenticated;
GRANT INSERT ON TABLE public.transactions TO authenticated;

-- PERMITE A EDIÇÃO.
GRANT UPDATE ON TABLE public.categories TO authenticated;
GRANT UPDATE ON TABLE public.transactions TO authenticated;

-- PERMITE A EXCLUSÃO.
GRANT DELETE ON TABLE public.categories TO authenticated;
GRANT DELETE ON TABLE public.transactions TO authenticated;



-- CONCEDE PERMISSÃO DE USO NAS SEQUÊNCIAS. Para a criação de registros quando o PostgreSQL precisar gerar os IDs automaticamente.
-- PARA USUÁRIOS AUTENTICADOS, PERMITE O USO DAS SEQUÊNCIAS DE ID DAS TABELAS CATEGORIES E TRANSACTIONS.
GRANT USAGE
ON SEQUENCE
    public.categories_id_seq,
    public.transactions_id_seq
TO authenticated;

-- Permissoes para gerar e consultar os identificadores dos grupos.
GRANT USAGE, SELECT
ON SEQUENCE public.transaction_groups_id_seq
TO authenticated;

-- AJUSTE DE PRIVILÉGIOS PADRÃO PARA TABELAS FUTURAS
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT USAGE ON SEQUENCES TO authenticated;




-- REVOKE: remove todas as permissões de acesso público às tabelas.
-- No Supabase, anon é o papel usado para requisições sem uma sessão de usuário autenticada.

-- Remover privilégios extras de anon
REVOKE REFERENCES, TRIGGER, TRUNCATE
ON TABLE
    public.profiles,
    public.categories,
    public.transactions,
    public.transaction_groups
FROM anon;

-- Remover todos os privilégios de anon das três tabelas,
REVOKE ALL PRIVILEGES
ON TABLE
    public.profiles,
    public.categories,
    public.transactions,
    public.transaction_groups
FROM anon;



-- AJUSTE DE PRIVILÉGIOS PADRÃO PARA TABELAS FUTURAS
-- Ajustar os privilégios padrão de tabelas futuras
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
REVOKE ALL PRIVILEGES ON TABLES
FROM anon, authenticated, service_role;

-- AJUSTE DE PRIVILÉGIOS PADRÃO PARA TABELAS FUTURAS
-- Restringir a execução padrão de funções
-- novas funções serão privadas por padrão
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;


-- Revoga a execução direta da função de criação automática de perfil,
-- impedindo chamadas pelas roles PUBLIC, anon e authenticated.
-- O gatilho on_auth_user_created permanece responsável por executá-la
-- durante o cadastro de novos usuários.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()
FROM PUBLIC, anon, authenticated;

-- Revoga a execução direta da função responsável por habilitar o RLS
-- automaticamente, restringindo seu uso pelas roles da API.
-- O gatilho de evento ensure_rls permanece configurado.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
FROM PUBLIC, anon, authenticated;


-- =====================================================
-- FIM
-- =====================================================