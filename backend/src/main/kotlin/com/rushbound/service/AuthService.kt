package com.rushbound.service

import com.rushbound.dto.AuthResponse
import com.rushbound.dto.LoginRequest
import com.rushbound.dto.RegisterRequest
import com.rushbound.dto.toResponse
import com.rushbound.model.UserAccount
import com.rushbound.repository.UserRepository
import com.rushbound.utils.CredentialsValidator
import com.rushbound.utils.JwtService
import com.rushbound.utils.LevelPolicy
import com.rushbound.utils.PasswordHasher
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import org.postgresql.util.PSQLException
import java.time.OffsetDateTime
import java.time.ZoneOffset
import kotlin.uuid.Uuid

class AuthService(
    private val database: Database,
    private val users: UserRepository,
    private val passwords: PasswordHasher,
    private val jwt: JwtService,
) {
    fun register(request: RegisterRequest): AuthResponse {
        val email = CredentialsValidator.normalizeEmail(request.email)
        CredentialsValidator.requirePassword(request.password)
        val account = UserAccount(
            id = Uuid.random(),
            email = email,
            passwordHash = passwords.hash(request.password),
            unlockedLevel = LevelPolicy.MIN,
            createdAt = OffsetDateTime.now(ZoneOffset.UTC),
        )
        try {
            transaction(database) {
                users.insert(account)
            }
        } catch (ex: Exception) {
            if (sqlState(ex) == UNIQUE_VIOLATION) {
                throw ConflictException("An account with this email already exists.")
            }
            throw ex
        }
        return AuthResponse(token = jwt.issue(account.id, account.email), user = account.toResponse())
    }

    fun login(request: LoginRequest): AuthResponse {
        val email = try {
            CredentialsValidator.normalizeEmail(request.email)
        } catch (_: ValidationException) {
            passwords.matches(request.password, null)
            throw UnauthorizedException(INVALID_CREDENTIALS)
        }
        val passwordBytes = request.password.toByteArray(Charsets.UTF_8).size
        if (request.password.isEmpty() || passwordBytes > 72) {
            passwords.matches("invalid-password", null)
            throw UnauthorizedException(INVALID_CREDENTIALS)
        }
        val account = transaction(database) { users.findByEmail(email) }
        if (!passwords.matches(request.password, account?.passwordHash) || account == null) {
            throw UnauthorizedException(INVALID_CREDENTIALS)
        }
        return AuthResponse(token = jwt.issue(account.id, account.email), user = account.toResponse())
    }

    private fun sqlState(error: Throwable): String? =
        generateSequence(error) { it.cause }
            .filterIsInstance<PSQLException>()
            .firstOrNull()
            ?.sqlState

    private companion object {
        const val UNIQUE_VIOLATION = "23505"
        const val INVALID_CREDENTIALS = "Invalid email or password."
    }
}
