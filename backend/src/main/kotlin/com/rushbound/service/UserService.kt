package com.rushbound.service

import com.rushbound.dto.UserResponse
import com.rushbound.dto.toResponse
import com.rushbound.repository.UserRepository
import com.rushbound.utils.LevelPolicy
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import kotlin.uuid.Uuid

class UserService(
    private val database: Database,
    private val users: UserRepository,
) {
    fun getProfile(userId: Uuid): UserResponse = transaction(database) {
        users.findById(userId)?.toResponse()
            ?: throw UnauthorizedException("Authentication is required.")
    }

    fun advanceLevel(userId: Uuid, requestedLevel: Int): UserResponse {
        if (requestedLevel !in LevelPolicy.MIN..LevelPolicy.MAX) {
            throw ValidationException("Level must be an integer between 1 and 10.")
        }
        return transaction(database) {
            // SELECT ... FOR UPDATE holds the row until this transaction commits,
            // so two overlapping unlocks cannot both observe the same current level.
            val current = users.findByIdForUpdate(userId)
                ?: throw UnauthorizedException("Authentication is required.")
            if (requestedLevel != current.unlockedLevel + 1) {
                throw ConflictException(
                    "You can only unlock the next level. Current unlocked level is ${current.unlockedLevel}.",
                )
            }
            users.updateUnlockedLevel(userId, requestedLevel)
            current.copy(unlockedLevel = requestedLevel).toResponse()
        }
    }
}
