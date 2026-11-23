package com.rushbound.config

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.rushbound.dto.ErrorResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.auth.authentication
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.response.respond

fun Application.configureSecurity(config: AppConfig) {
    val verifier = JWT.require(Algorithm.HMAC256(config.jwtSecret))
        .withIssuer(config.jwtIssuer)
        .withAudience(config.jwtAudience)
        .build()
    authentication {
        jwt("auth-jwt") {
            realm = "rushbound"
            verifier(verifier)
            validate { credential ->
                val subject = credential.payload.subject
                if (subject.isNullOrBlank()) null else JWTPrincipal(credential.payload)
            }
            challenge { _, _ ->
                call.respond(HttpStatusCode.Unauthorized, ErrorResponse("Authentication is required."))
            }
        }
    }
}
