# Squad 21 

Esse é o repositório projeto de redesign do Squad 21

Todos os direitos reservados a [Baasic](https://baasic.com.br)


## Como rodar a aplicação localmente:

### 1 - instale uma maquina virtual de linux atravez do WSL (como exemplo, utlizaremos o Debian)
    
    wsl
    wsl --install Debian 
(Caso seu computador não tenha o wsl pre-instalado, abra o cmd e digite: winget install wsl)

### 2 - configure a distro de acordo com as instruções presentes na tela

### 3 - instale o git

    sudo apt install git

### 4 - instale o wget
    
    sudo apt-get install wget

### 5 - instale o redis
    
    sudo apt install redis

### 6 - instale o curl
    
    sudo apt install curl

### 7 - instale o postgres sql
    
    sudo apt install postgresql

### 8 - instale o node.js
    
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh
 (feche e reabra o terminal)
    
    nvm install 18

### 9 - clone o repositório:
    
    git clone https://github.com/PedroASouzaDev/Squad-21-Zapcomm

### 10 - navegue até a pastas frontend e backend e instale as dependencias
    
    cd Squad-21-Zapcomm/frontend/
    npm install
(aguarde a instalação)

    cd Squad-21-Zapcomm/backend/
    npm install
(aguarde a instalação)



### 11 - criação o banco de dados
abra o postgres: 
    
        sudo -u postgres psql
        
caso não abra, utilize: 
       
        sudo service postgresql start

crie o banco de dados (escolha um nome de sua preferencia): 
       
        CREATE DATABASE nome_do_banco_de_dados;

verifique se o banco de dados foi criado usando o comando:
         
         /l

adicione as permissões corretas ao banco de dados com o comando:
       
        GRANT ALL PRIVILEGES ON DATABASE nome_do_banco_de_dados TO postgres;

 adicione uma senha ao usuário:
       
        ALTER USER postgres WITH PASSWORD 'sua_senha';

feche o postgres: 
       
        \q


### 12 - criar cópias dos arquivos .env
   
    cd Squad-21-Zapcomm/backend/
    cp .env.example .env
    cd ..
    cd Squad-21-Zapcomm/frontend/
    cp .env.exemple .env
    cd ..
    code . 
    
### 13 - configuração do .env

no VsCode, haverão 2 arquivos .env (um na pasta frontend e outro no backend), edite-os da seguinte forma

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


### 14 - migrações do banco de dados
    
    cd Squad-21-Zapcomm/backend/
    npm run build
    npm run db:migrate
    npm run db:seed

### 15 - finalização

no VsCode navegue até frontend/src/hooks/useAuth.js/index.js

no index.js altere a função handleLogin para que fique desta forma:

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

### 16 - rodando a aplicação
    
abra duas instancias do terminal
na primeira, vá até diretório Squad-21-Zapcomm/backend/
    
    npm run dev:server
na segunda, vá até diretório Squad-21-Zapcomm/frontend/
    
    npm start
a aplicação irá abrir no navegador (isso pode demorar um pouco)
    
    usuário: admin@admin.com
    senha: 123456
