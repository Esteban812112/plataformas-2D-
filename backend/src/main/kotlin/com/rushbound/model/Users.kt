package com.rushbound.model

import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.timestampWithTimeZone

object Users : Table("users") {
    val id = uuid("id")
    val email = varchar("email", 255)
    val passwordHash = varchar("password_hash", 255)
    val unlockedLevel = integer("unlocked_level").default(1)
    val createdAt = timestampWithTimeZone("created_at")

    override val primaryKey = PrimaryKey(id)

    init {
        uniqueIndex("users_email_unique", email)
    }
}
