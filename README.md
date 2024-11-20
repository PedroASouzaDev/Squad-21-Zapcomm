# Squad 21 

Esse é o repositório projeto de redesign do Squad 21

Todos os direitos reservados a [Baasic](https://baasic.com.br)


Como Rodar a aplicação localmente:

1 - instale uma maquina virtual de linux atravez do WSL (como exemplo, utlizaremos o Debian)
    1- wsl
    2- wsl --install Debian (Caso seu computador não tenha o wsl pre-instalado, abra o cmd e digite: winget install wsl)

2 - configure a distro de acordo com as instruções presentes na tela

3 - instale o git
    sudo apt install git

4 - instale o VsCode

5 - instale o wget
    sudo apt-get install wget

6 - instale o redis
    sudo apt install redis

7 - instale o curl
    sudo apt install curl

8 - instale o postgres sql
    sudo apt install postgresql

9 - instale o node.js
    1- curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh
    2- (feche e reabra o terminal)
    3- nvm install 18

10 - clone o repositório:
    git clone https://github.com/PedroASouzaDev/Squad-21-Zapcomm

11 navegue até a pastas frontend e backend e instale as dependencias
    1- cd Squad-21-Zapcomm/frontend/
    2- npm install
    3- (aguarde a instalação)
    4- cd ..
    5- cd Squad-21-Zapcomm/backend/
    6- npm install
    7- (aguarde a instalação)



12 - criação o banco de dados
    1- abra o postgres: 
        sudo -u postgres psql

    2- caso não abra, utilize: 
        sudo service postgresql start

    3- crie o banco de dados: 
        CREATE DATABASE nome_do_banco_de_dados; (escolha um nome de sua preferencia)

    4- verifique se o banco de dados foi criado usando o comando:
         /l

    5- adicione as permissões corretas ao banco de dados com o comando:
        GRANT ALL PRIVILEGES ON DATABASE nome_do_banco_de_dados TO postgres;

    6- adicione um senha ao usuário:
        ALTER USER postgres WITH PASSWORD 'sua_senha';

    6- feche o postgres: 
        \q


13 - criar cópias dos arquivos .env
    1- cd Squad-21-Zapcomm/backend/
    2- cp .env.example .env
    3- cd ..
    4- cp .env.exemple .env
    5- cd ..
    6- abra o projeto no VsCode utilizando o comando:
        code . 

14 - configuração do .env
    1 - no VsCode, haverão 2 arquivos .env (um na pasta frontend e outro no backend), edite-os da seguinte forma

    (backend)

        NODE_ENV=
        BACKEND_URL=http://localhost:8080
        FRONTEND_URL=http://localhost:3000
        PROXY_PORT=8080
        PORT=8080

        DB_DIALECT=postgres
        DB_HOST=localhost
        DB_PORT=5432
        DB_USER=postgres
        DB_PASS=sua_senha
        DB_NAME=nome_do_banco_de_dados

        JWT_SECRET=kZaOTd+YZpjRUyyuQUpigJaEMk4vcW4YOymKPZX0Ts8=
        JWT_REFRESH_SECRET=dBSXqFg9TaNUEDXVp6fhMTRLBysP+j2DSqf7+raxD3A=

        REDIS_URI=redis://:123456@127.0.0.1:6379
        REDIS_OPT_LIMITER_MAX=1
        REDIS_OPT_LIMITER_DURATION=3000

        USER_LIMIT=10000
        CONNECTIONS_LIMIT=100000
        CLOSED_SEND_BY_ME=true

        GERENCIANET_SANDBOX=false
        GERENCIANET_CLIENT_ID=Client_Id_Gerencianet
        GERENCIANET_CLIENT_SECRET=Client_Secret_Gerencianet
        GERENCIANET_PIX_CERT=certificado-Gerencianet
        GERENCIANET_PIX_KEY=chave pix gerencianet

        # EMAIL
        MAIL_HOST="smtp.gmail.com"
        MAIL_USER="seu@gmail.com"
        MAIL_PASS="SuaSenha"
        MAIL_FROM="seu@gmail.com"
        MAIL_PORT="465"

    (frontend)

        REACT_APP_BACKEND_URL=http://localhost:8080
        REACT_APP_HOURS_CLOSE_TICKETS_AUTO = 24


15 - migrações do banco de dados
    1- cd Squad-21-Zapcomm/backend/
    2- npm run build
    3- npm run db:migrate
    4- npm run db:seed

16 - finalização
    1- no VsCode navegue até frontend/src/hooks/useAuth.js/index.js
    2- no index.js altere a função handleLogin para que fique desta forma:

    const handleLogin = async (userData) => {
        setLoading(true);

        try {
        const { data } = await api.post("http://localhost:8080/auth/login", userData);
        const {
            user: { companyId, id, company },
        } = data;

        if (has(company, "settings") && isArray(company.settings)) {
            const setting = company.settings.find(
            (s) => s.key === "campaignsEnabled"
            );
            if (setting && setting.value === "true") {
            localStorage.setItem("cshow", null); //regra pra exibir campanhas
            }
        }

17 - rodando a aplicação
    1- abra duas instancias do terminal
    2- na primeira, vá até diretório Squad-21-Zapcomm/backend/
    3- npm run dev:server
    4- na segunda, vá até diretório Squad-21-Zapcomm/frontend/
    5- npm start
    6- a aplicação irá abrir no navegador (isso pode demorar um pouco)
    7- usuário: admin@admin.com
    8- senha: 123456
