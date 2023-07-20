const knex = require("../database/knex")

class PostsController {
    async create(request, response) {
        const { title, description, locked} = request.body
        const user_id  = request.user.id

        const [post_id] = await knex("posts").insert({
            title, description, locked, user_id
        })

        /*
        const tagsInsert = tags.map(tag => {
            return {
                post_id,
                user_id,
                name: tag
            }
        })

        await knex("tags").insert(tagsInsert) */

        return response.json({"message" : "Post criado com sucesso!"})
    }

    async show(request, response) {
        const { id } = request.params

        const post = await knex("posts").where({id}).first()
        // const tags = await knex("tags").where({post_id:id}).orderBy("name")

        return response.json({
            ...post,
        })
    }

    async delete(request, response) {
        const { id } = request.params

        await knex("posts").where({id}).delete()

        return response.json()
    }

    async index(request, response) {
        const { title, tags, locked } = request.query;
        let posts;
      
        const query = knex("posts")
          .select([
            "posts.id",
            "posts.title",
            "posts.description",
            "posts.locked",
            "posts.user_id",
            "posts.thumbnail",
          ])
          .orderBy("created_at", "desc");
      
        /* REMOVIDO O RECURSO DE TAGS
        if (tags) {
          const filterTags = tags.split(",").map((tag) => tag.trim());
          query
            .innerJoin("tags", "posts.id", "tags.post_id")
            .whereIn("name", filterTags);
        }
        */
      
        if (locked) {
          const isLocked = Number(locked)
          if(isLocked === 1){
              query.where("posts.locked", 1)
          } else if(isLocked === 0) {
            query.where("posts.locked", 0)
          }
        }
      
        if (title) {
          query.where("posts.title", "like", `%${title}%`)
        }
      
        posts = await query;
      
        const taglist = await knex("tags")
        const postWithTags = posts.map((post) => {
          const postTags = taglist.filter((tag) => tag.post_id === post.id);
          return {
            ...post,
            tags: postTags,
          }
        })
      
        return response.json(postWithTags)
      }
}

module.exports = PostsController



/*
                if(tags) {
                        const filterTags = tags.split(",").map(tag => tag.trim())
                        posts = await knex("tags")
                        .select([
                            "posts.id",
                            "posts.title",
                            "posts.description",
                            "posts.locked",
                            "posts.user_id",
                        ])
                        .whereIn("name", filterTags)
                        .whereLike("posts.title", `%${title}%`)
                        .innerJoin("posts", "posts.id", "tags.post_id")
                        .orderBy("posts.title")
                    } 
                } else {
                    posts = await knex("posts").orderBy("created_at", "desc")
                    .whereLike("title", `%${title}%`)
                }
            }


*/