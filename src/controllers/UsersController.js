// LIB PARA ENCRIPTAR SENHA
const { hash, compare } = require("bcryptjs")

// MIDDLEWARE DE TRATAMENTO DE ERROS
const AppError = require("../utils/AppError")

// REALIZA A CONEXÃO COM O BANCO DE DADOS
const sqliteConnection = require("../database/sqlite")

class UsersController {
    // A FUNÇÃO PRECISA SER ASSINCRONA PORQUE ESTÁ REALIZANDO AÇÕES NO BANCO DE DADOS

    async create(request, response) {
        // RECEBENDO OS DADOS EM JSON DO CORPO DA REQUISIÇÃO
        const { name, email, password } = request.body
        
        const database = await sqliteConnection()

        // BUSCA NO BANCO DE DADOS SE EXISTE REGISTRO COM ESSE EMAIL
        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        // SE EXISTIR USUÁRIO COM ESS EMAIL DISPARA UM ERRO E PARA A APLICAÇÃO
        if (checkUserExists) {
            throw new AppError("Esse email já está sendo utilizado.")
        }

        // GERA A CRIPTOGRAFIA NA SENHA
        const hashedPassword = await hash(password, 8)
        
        // SE ESTIVER TUDO OK, CRIA O USUÁRIO
        await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword])

        return response.status(201).json("Seu usuário foi criado com sucesso!")
    }

    async show(request, response ) {
        const { id } = request.params
        
        const database = await sqliteConnection()
        const checkUserExists = await database.get("SELECT * FROM users WHERE id = (?)", [id])

        if (!checkUserExists) {
            throw new AppError("Esse usuário não foi encontrado!")
        }

        return response.status(200).json(checkUserExists)
        
    }

    async update(request, response ) {
        // CAPTURA O NOME E EMAIL ENVIADO NA REQUISIÇAO
        const { name, email, password, old_password } = request.body
        
        // CAPTURA O ID ENVIADO PELA REQUISIÇAO
        const  id  = request.user.id

        const database = await sqliteConnection()

        // CONSULTA NO BANCO DE DADOS SE EXISTE USUÁRIO COM ESSE ID
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [id])

        // APRESENTA UM ERRO SE NÃO ENCONTRA O USUÁRIO INFORMADO
        if(!user) {
            throw new AppError("Usuário não encontrado!")
        }

        // CONSULTA NO BANCO DE DADOS SE EXISTE USUÁRIO COM ESSE EMAIL
        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])
        
        // APRESENTA UM ERRO SE ENCONTRA O EMAIL JÁ SENDO UTILIZADO POR UM USUÁRIO QUE NÃO SEJA ELE.
        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError("Esse email já está em uso!")
        }

        // DEFINE QUE O USER VAI RECEBER O NOVO NOME E NOVO EMAIL
        // VERIFICA SE ESTÁ SENDO RECEBIDO OS DADOS, SE NÃO
        // REPETE O VALOR QUE JÁ ESTÁ NO BANCO DE DADOS
        user.name = name ?? user.name
        user.email = email ?? user.email

        if ( password && !old_password) {
            throw new AppError("Você precisa informar a senha atual para cadastrar sua nova senha!")
        }

        if ( password && old_password) {
            const checkOldPassword = await compare(old_password, user.password)

            if ( !checkOldPassword ) {
                throw new AppError("A senha atual está incorreta!")                
            }

            user.password = await hash(password, 8)            
        }

        // ALTERA NO BANCO DE DADOS O NOME/EMAIL PROS NOVOS E SETA
        // NOVA DATA DE UPDATED BASEADO NO ID
        await database.run(` 
        UPDATE users SET
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?`,
        [user.name, user.email, user.password, id]
        )

        return response.status(200).json("Alteração realizada com sucesso!")
    }
}

module.exports = UsersController