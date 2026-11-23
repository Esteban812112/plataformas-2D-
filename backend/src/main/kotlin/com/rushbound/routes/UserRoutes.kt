package com.rushbound.routes

import com.rushbound.dto.UpdateLevelRequest
import com.rushbound.service.UnauthorizedException
import com.rushbound.service.UserService
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.put
import kotlin.uuid.Uuid

fun Route.userRoutes(userService: UserService) {
    authenticate("auth-jwt") {
        get("/users/me") {
            call.respond(userService.getProfile(call.authenticatedUserId()))
        }
        put("/users/me/level") {
            val request = call.receive<UpdateLevelRequest>()
            call.respond(userService.advanceLevel(call.authenticatedUserId(), request.level))
        }
    }
}

private fun io.ktor.server.application.ApplicationCall.authenticatedUserId(): Uuid {
    val principal = principal<JWTPrincipal>()
        ?: throw UnauthorizedException("Authentication is required.")
    return try {
        Uuid.parse(principal.payload.subject)
    } catch (_: IllegalArgumentException) {
        throw UnauthorizedException("Authentication is required.")
    }
}
