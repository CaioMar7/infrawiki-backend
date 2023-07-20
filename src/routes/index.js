const { Router } = require("express")

const usersRouter = require("./users.routes")
const postsRouter = require("./posts.routes")
const sessionsRouter = require("./sessions.routes")

const routes = Router()

routes.use("/users", usersRouter)
routes.use("/posts", postsRouter)
routes.use("/sessions", sessionsRouter)

module.exports = routes


// REMOVIDO O RECURSO DE TAGS
//routes.use("/tags", tagsRouter)
//const tagsRouter = require("./tags.routes")