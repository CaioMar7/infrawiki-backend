const { Router } = require("express")

const PostsController = require("../controllers/PostsController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const postsRoutes = Router()

const postsController = new PostsController()

postsRoutes.post("/", ensureAuthenticated, postsController.create)
postsRoutes.get("/:id", postsController.show)
postsRoutes.delete("/:id", ensureAuthenticated, postsController.delete)
postsRoutes.get("/", postsController.index)

module.exports = postsRoutes