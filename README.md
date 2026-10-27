# Conta Fácil — Controle Financeiro

Aplicação web para controle financeiro pessoal, com foco no gerenciamento de contas a pagar.

O projeto foi desenvolvido como atividade acadêmica do curso de Tecnologia da Informação da Universidade Federal de Mato Grosso do Sul (UFMS), na disciplina **Projeto Integrador de Tecnologia da Informação II**.

## Sobre o projeto

O Conta Fácil tem como objetivo facilitar o acompanhamento das contas a pagar, permitindo registrar despesas, acompanhar vencimentos, controlar pagamentos e organizar categorias financeiras.

O desenvolvimento começou com um protótipo de interface que utilizava dados armazenados em memória. O projeto evoluiu para utilizar o Supabase como serviço de banco de dados e autenticação, permitindo persistir os registros e associá-los ao usuário autenticado.

O trabalho também contempla a modelagem e a manipulação de dados relacionais e o uso do Git e do GitHub para organizar e registrar a evolução do código-fonte.

**Aluno:** San Midler Gomes de Souza

**Instituição:** Universidade Federal de Mato Grosso do Sul (UFMS)

**Curso:** Tecnologia da Informação

**Disciplina:** Projeto Integrador de Tecnologia da Informação II

## Tecnologias utilizadas

- **React:** construção das interfaces e componentes da aplicação.
- **Vite:** ambiente de desenvolvimento e ferramenta de compilação.
- **TypeScript:** tipagem estática do código JavaScript.
- **Tailwind CSS:** estilização das interfaces.
- **CSS:** definição de estilos complementares.
- **Supabase:** serviço utilizado para autenticação e armazenamento dos dados em um banco PostgreSQL.
- **SQL:** definição das tabelas, relacionamentos e restrições do banco de dados.
- **Git:** controle de versão do código-fonte.
- **GitHub:** hospedagem do repositório e acompanhamento das alterações.

## Funcionalidades implementadas

### Autenticação e usuários

- Cadastro de usuários integrado ao Supabase Authentication.
- Login com validação das credenciais.
- Persistência da sessão de autenticação.
- Proteção das rotas privadas.
- Logout com encerramento da sessão.
- Redirecionamento para a página de login após sair.
- Criação automática do perfil do usuário na tabela `public.profiles`.
- Exibição dos dados do usuário autenticado no cabeçalho da aplicação.

### Categorias financeiras

- Cadastro de categorias no banco de dados.
- Listagem das categorias registradas.
- Edição de categorias existentes.
- Exclusão de categorias.
- Associação dos registros ao usuário autenticado.
- Tratamento de situações como nomes duplicados e categorias vinculadas a contas.
- Atualização dos dados exibidos após as operações realizadas.

### Contas a pagar

- Cadastro de contas no banco de dados.
- Listagem das contas cadastradas.
- Edição de contas existentes.
- Exclusão de contas.
- Marcação de contas como pagas, com registro da data do pagamento.
- Possibilidade de desfazer um pagamento.
- Identificação automática da situação da conta de acordo com o vencimento e o pagamento.
- Atualização das informações apresentadas no sistema.

### Dashboard

- Exibição dinâmica da data atual em português.
- Apresentação das contas mais recentes, considerando novos cadastros e alterações.
- Atualização da lista após modificações nos registros.
- Compartilhamento dos dados de contas entre o Dashboard e a página de contas a pagar.

### Banco de dados e acesso

- Utilização do PostgreSQL por meio do Supabase.
- Definição de tabelas, chaves estrangeiras e restrições.
- Associação dos registros aos usuários autenticados.
- Habilitação do Row Level Security (RLS) nas três tabelas.
- Configuração de políticas de acesso e privilégios.
- Restrição das permissões de execução de funções automáticas, conforme a configuração adotada no banco.

As políticas de segurança foram configuradas para controlar o acesso aos registros de acordo com as permissões estabelecidas no banco de dados.

## Banco de dados

O projeto utiliza o PostgreSQL por meio do Supabase para armazenar os dados dos usuários e os registros financeiros. A estrutura inicial do banco está documentada no arquivo `database/schema.sql`.

O banco possui três tabelas principais:

| Tabela                | Finalidade                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `public.profiles`     | Armazenar informações complementares do perfil do usuário, como nome, telefone e imagem.                       |
| `public.categories`   | Armazenar as categorias financeiras de cada usuário, classificadas como receita ou despesa.                    |
| `public.transactions` | Armazenar os registros financeiros, incluindo descrição, valor, vencimento, categoria e situação do pagamento. |

As tabelas utilizam identificadores, chaves estrangeiras e restrições para relacionar os dados e contribuir para a consistência das informações. A tabela `public.transactions`, por exemplo, possui uma relação com as categorias, impedindo a associação de uma transação à categoria de outro usuário.

O banco também possui índices para auxiliar consultas, além de uma função e um gatilho que atualizam automaticamente a data de modificação das transações.

### Segurança e controle de acesso

O projeto utiliza o Row Level Security (RLS) nas três tabelas, com políticas que controlam as operações de consulta, cadastro, edição e exclusão de acordo com o usuário autenticado.

Também foram definidos privilégios para as operações permitidas e restrições de execução direta de determinadas funções do banco. O cadastro de usuários conta com um mecanismo automático de criação do perfil correspondente em `public.profiles`.

Essas configurações buscam garantir que cada usuário acesse e manipule somente os registros permitidos pelas políticas estabelecidas no banco de dados.

### Operações com os dados

A integração com o Supabase permite realizar as seguintes operações:

- **Cadastro:** inserir categorias e contas financeiras.
- **Consulta:** recuperar os registros armazenados no banco.
- **Edição:** atualizar informações de categorias e contas.
- **Exclusão:** remover registros respeitando as restrições definidas.
- **Controle de pagamentos:** registrar e desfazer pagamentos de contas a pagar.

Essas operações demonstram a aplicação prática da modelagem e da manipulação de dados relacionais no projeto acadêmico.

A configuração foi baseada na documentação oficial do Supabase:

- SUPABASE. _Row Level Security_. Disponível em: https://supabase.com/docs/guides/database/postgres/row-level-security. Acesso em: 23 out. 2026.
- SUPABASE. _Securing your API_. Disponível em: https://supabase.com/docs/guides/api/securing-your-api. Acesso em: 23 out. 2026.
- SUPABASE. _Database Functions_. Disponível em: https://supabase.com/docs/guides/database/functions. Acesso em: 23 out. 2026.

## Requisitos para execução

Antes de executar o projeto, verifique se as seguintes ferramentas estão instaladas:

**Node.js**

```bash
node -v
```

**npm**

```bash
npm -v
```

**Git**

```bash
git --version
```

O npm é instalado junto com as versões usuais do Node.js. Não é necessário verificar o `npx` para executar os comandos básicos descritos neste documento.

## Como baixar e executar o projeto

### 1. Clonar o repositório

Abra o terminal e execute:

```bash
git clone https://github.com/msan-ufms/Controle-Financeiro.git
```

Entre na pasta do projeto:

```bash
cd Controle-Financeiro
```

### 2. Instalar as dependências

Execute o comando na pasta que contém o arquivo `package.json`:

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Para conectar a aplicação ao Supabase, configure as variáveis utilizadas pelo frontend em um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
```

Substitua os valores de exemplo pelos dados correspondentes ao seu projeto Supabase.

O arquivo `.env` contém configurações locais e não deve ser enviado ao repositório. Mantenha-o listado no `.gitignore`.

A chave pública é destinada ao uso no frontend. O controle de acesso aos dados deve ser realizado pelas políticas e permissões configuradas no Supabase. Não coloque chaves secretas ou credenciais administrativas no código do navegador.

### 4. Iniciar o servidor de desenvolvimento

Execute:

```bash
npm run dev
```

Por padrão, o Vite disponibiliza a aplicação no endereço:

http://localhost:5173/

Abra esse endereço no navegador.

### 5. Verificar a compilação

Para verificar a tipagem e compilar o projeto para produção, execute:

```bash
npm run build
```

O comando deve terminar sem erros para que a compilação seja considerada bem-sucedida.

## Controle de versão com Git e GitHub

O Git é utilizado para registrar as alterações realizadas durante o desenvolvimento. O GitHub hospeda o repositório remoto e permite consultar o histórico de commits.

O projeto adota mensagens de commit inspiradas no padrão **Conventional Commits**, com tipos e escopos que ajudam a identificar o objetivo de cada alteração.

### Padrão de branches

As branches são utilizadas para organizar o desenvolvimento de funcionalidades e correções.

| Tipo    | Finalidade                            | Exemplo                        |
| ------- | ------------------------------------- | ------------------------------ |
| `main`  | Manter a versão principal do projeto. | `main`                         |
| `feat/` | Desenvolver funcionalidades.          | `feat/supabase-client`         |
| `fix/`  | Corrigir problemas.                   | `fix/categorias-sincronizacao` |
| `docs/` | Atualizar a documentação.             | `docs/readme`                  |

Os nomes apresentados como exemplos são referências de nomenclatura; a existência de cada branch deve ser verificada no histórico do repositório.

### Padrão de commits

As mensagens seguem, preferencialmente, esta estrutura:

```text
tipo(escopo): descrição objetiva da alteração
```

Exemplos:

```text
feat(auth): integra cadastro com Supabase
feat(categories): implementa módulo de categorias
feat(payables): implementa contas a pagar
fix(categories): sincroniza registros após cadastro
docs(readme): atualiza documentação do projeto
```

Os tipos mais utilizados são:

- `feat`: implementação de funcionalidades.
- `fix`: correção de problemas.
- `docs`: alterações na documentação.
- `refactor`: reorganização interna do código sem alterar o comportamento esperado.
- `test`: criação ou atualização de testes.
- `chore`: tarefas de configuração e manutenção.

### Comandos básicos

Consultar a situação dos arquivos:

```bash
git status
```

Consultar o histórico de commits:

```bash
git log --oneline
```

Adicionar alterações à área de preparação:

```bash
git add .
```

Registrar um commit:

```bash
git commit -m "feat(escopo): descreve a alteração"
```

Enviar os commits da branch atual para o GitHub:

```bash
git push
```

Para enviar uma branch pela primeira vez:

```bash
git push -u origin nome-da-branch
```

O comando `git init` é utilizado para inicializar um repositório novo. Em um projeto já clonado do GitHub, não é necessário executá-lo novamente.

## Histórico de desenvolvimento — Git

O desenvolvimento do Conta Fácil foi organizado em etapas, com o uso do Git para registrar as alterações realizadas no código-fonte. As mensagens dos commits seguem uma convenção que identifica o tipo de alteração e sua finalidade.

### 1. Banco de dados e configuração do Supabase

- `docs(database): adiciona esquema SQL inicial`
- `feat(database): adapta esquema inicial ao Supabase`
- `chore(supabase): instala cliente do Supabase`
- `chore(supabase): configura cliente do Supabase`
- `feat(supabase): configura cliente de conexão`
- `feat(supabase): configura segurança e permissões do banco`

### 2. Autenticação e usuários

- `feat(auth): integra cadastro com Supabase`
- `feat(auth): redireciona apos login`
- `feat(auth): protege rotas e implementa logout`
- `feat(auth): exibe usuário conectado no header`

### 3. Categorias financeiras

- `feat(categorias): integrar consulta e operações CRUD com Supabase`
- `fix(categorias): carregar opções ao iniciar o aplicativo`
- `fix(categorias): sincronizar registros após cadastro`

### 4. Contas a pagar

- `feat(contas): carregar e cadastrar contas no Supabase`
- `feat(contas): concluir integração com Supabase`

### 5. Dashboard

- `feat(dashboard): exibir data dinamica`
- `feat(dashboard): exibir contas recentes por atualizacao`

### Branches identificadas

- `main`: branch principal do projeto.
- `feat/supabase-schema`: branch relacionada à etapa de configuração do Supabase.
- `feat/supabase-client`: branch utilizada para o desenvolvimento da integração com o Supabase.

### Considerações sobre o versionamento

Os commits registram a evolução do projeto desde a definição inicial do esquema SQL até a integração do banco de dados, a autenticação de usuários, o gerenciamento de categorias, as contas a pagar e a atualização do Dashboard.

A organização das alterações por etapas facilita a consulta do histórico e permite identificar os objetivos das modificações realizadas durante o desenvolvimento.

### Exemplos de descrições acadêmicas dos commits

**Integração da autenticação**

Foi implementada a integração do cadastro e do login com o Supabase Authentication. Também foram configuradas a persistência da sessão, a proteção das rotas privadas, o encerramento da sessão e o redirecionamento para a página de login após a saída do usuário.

**Integração das categorias**

Foi integrado o gerenciamento de categorias ao Supabase, permitindo carregar, cadastrar, editar e excluir registros persistidos no banco de dados. As categorias passaram a ser associadas ao usuário autenticado, e foram tratadas situações como nomes duplicados e vínculos com contas.

**Integração das contas a pagar**

Foi implementada a persistência das contas a pagar no Supabase, contemplando cadastro, consulta, edição, exclusão e controle de pagamentos. O carregamento dos registros foi centralizado para permitir a atualização das informações apresentadas no Dashboard e na página de contas.

**Atualização do Dashboard**

Foi implementada a apresentação dinâmica da data e ajustada a listagem das contas recentes. A lista passou a considerar tanto novos cadastros quanto alterações nos registros, atualizando as informações exibidas após as operações realizadas.

**Configuração de segurança do banco**

Foram configurados o RLS, as políticas de acesso, os privilégios das funções do PostgreSQL e as permissões relacionadas às funções automáticas. O objetivo foi estabelecer regras de acesso aos dados de acordo com as permissões definidas no Supabase.

## Objetivos acadêmicos atendidos

O desenvolvimento do Conta Fácil permite demonstrar os seguintes conteúdos:

- **Modelagem de banco de dados:** definição das tabelas, relacionamentos, chaves estrangeiras e restrições.
- **Manipulação de dados:** operações de cadastro, consulta, edição e exclusão de registros.
- **Integração entre aplicação e banco:** utilização do Supabase para persistir e recuperar dados.
- **Autenticação e controle de acesso:** integração com o serviço de autenticação e configuração de políticas no banco.
- **Controle de versão:** organização do código com Git, utilização de branches e registro das alterações por meio de commits.
- **Documentação:** descrição das tecnologias, da execução e das principais etapas de desenvolvimento.

## Considerações finais

O Conta Fácil evoluiu de um protótipo de interface para uma aplicação integrada a um banco de dados, com autenticação e operações persistentes para categorias e contas a pagar.

A utilização de tecnologias como React, TypeScript, Vite e Supabase permitiu manter uma arquitetura simplificada, adequada ao escopo acadêmico do projeto.

O uso do Git e do GitHub complementa o desenvolvimento, permitindo documentar a evolução do código e identificar as alterações realizadas em cada etapa.

**Repositório:** https://github.com/msan-ufms/Controle-Financeiro
