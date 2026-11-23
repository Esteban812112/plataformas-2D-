package com.rushbound.utils

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.rushbound.config.AppConfig
import java.time.Instant
import java.util.Date
import kotlin.uuid.Uuid

class JwtService(config: AppConfig) {
    private val issuer = config.jwtIssuer
    private val audience = config.jwtAudience
    private val expirationSeconds = config.jwtExpirationSeconds
    private val algorithm = Algorithm.HMAC256(config.jwtSecret)

    fun issue(userId: Uuid, email: String): String =
        JWT.create()
            .withIssuer(issuer)
            .withAudience(audience)
            .withSubject(userId.toString())
            .withClaim("email", email)
            .withIssuedAt(Date.from(Instant.now()))
            .withExpiresAt(Date.from(Instant.now().plusSeconds(expirationSeconds)))
            .sign(algorithm)
}
