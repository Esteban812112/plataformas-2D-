package com.rushbound.repository

import com.rushbound.model.UserAccount
import com.rushbound.model.Users
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.update
import kotlin.uuid.Uuid

/**
 * All methods must run inside an Exposed transaction.
 */
class UserRepository {
    fun findByEmail(email: String): UserAccount? =
        Users.selectAll().where { Users.email eq email }.singleOrNull()?.toAccount()

    fun findById(id: Uuid): UserAccount? =
        Users.selectAll().where { Users.id eq id }.singleOrNull()?.toAccount()

    /** Locks the user row so concurrent level updates are applied one at a time. */
    fun findByIdForUpdate(id: Uuid): UserAccount? =
        Users.selectAll().where { Users.id eq id }.forUpdate().singleOrNull()?.toAccount()

    fun insert(account: UserAccount) {
        Users.insert {
            it[id] = account.id
            it[email] = account.email
            it[passwordHash] = account.passwordHash
            it[unlockedLevel] = account.unlockedLevel
            it[createdAt] = account.createdAt
        }
    }

    fun updateUnlockedLevel(id: Uuid, level: Int) {
        Users.update({ Users.id eq id }) {
            it[unlockedLevel] = level
        }
    }

    private fun ResultRow.toAccount() = UserAccount(
        id = this[Users.id],
        email = this[Users.email],
        passwordHash = this[Users.passwordHash],
        unlockedLevel = this[Users.unlockedLevel],
        createdAt = this[Users.createdAt],
    )
}
