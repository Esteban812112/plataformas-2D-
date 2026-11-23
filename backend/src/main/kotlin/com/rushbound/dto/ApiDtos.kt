package com.rushbound.dto

import com.rushbound.model.UserAccount
import kotlinx.serialization.Serializable
import java.time.format.DateTimeFormatter

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

@Serializable
data class UpdateLevelRequest(
    val level: Int,
)

@Serializable
data class UserResponse(
    val id: String,
    val email: String,
    val unlockedLevel: Int,
    val createdAt: String,
)

@Serializable
data class AuthResponse(
    val token: String,
    val user: UserResponse,
)

@Serializable
data class ErrorResponse(
    val error: String,
)

fun UserAccount.toResponse(): UserResponse = UserResponse(
    id = id.toString(),
    email = email,
    unlockedLevel = unlockedLevel,
    createdAt = createdAt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
)
