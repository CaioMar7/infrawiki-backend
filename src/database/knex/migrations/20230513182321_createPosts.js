
exports.up = knex => knex.schema.createTable("posts", table => {
    table.increments("id")
    table.text("title")
    table.text("description")
    table.text("thumbnail")
    table.boolean("locked")
    table.integer("user_id").references("id").inTable("users")

    table.timestamp("created_at").default(knex.fn.now())
    table.timestamp("updated_at").default(knex.fn.now())
})


exports.down = knex => knex.schema.dropTable("posts")
