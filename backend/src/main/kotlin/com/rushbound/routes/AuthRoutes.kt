package com.rushbound.routes

import com.rushbound.dto.LoginRequest
import com.rushbound.dto.RegisterRequest
import com.rushbound.service.AuthService
import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route

fun Route.authRoutes(authService: AuthService) {
    route("/auth") {
        post("/register") {
            val request = call.receive<RegisterRequest>()
            call.respond(HttpStatusCode.Created, authService.register(request))
        }
        post("/login") {
            val request = call.receive<LoginRequest>()
            call.respond(authService.login(request))
        }
    }
}
