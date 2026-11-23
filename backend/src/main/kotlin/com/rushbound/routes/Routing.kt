package com.rushbound.routes

import com.rushbound.service.AuthService
import com.rushbound.service.UserService
import io.ktor.server.application.Application
import io.ktor.server.routing.routing

fun Application.configureRouting(authService: AuthService, userService: UserService) {
    routing {
        authRoutes(authService)
        userRoutes(userService)
    }
}
