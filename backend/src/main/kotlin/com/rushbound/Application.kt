package com.rushbound

import com.rushbound.config.AppConfig
import com.rushbound.config.DatabaseFactory
import com.rushbound.config.configureCors
import com.rushbound.config.configureSecurity
import com.rushbound.config.configureSerialization
import com.rushbound.config.configureStatusPages
import com.rushbound.repository.UserRepository
import com.rushbound.routes.configureRouting
import com.rushbound.service.AuthService
import com.rushbound.service.UserService
import com.rushbound.utils.JwtService
import com.rushbound.utils.PasswordHasher
import io.ktor.server.application.Application
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

fun main() {
    val config = AppConfig.fromEnv()
    embeddedServer(Netty, port = config.port, host = "0.0.0.0", module = { module(config) })
        .start(wait = true)
}

fun Application.module(config: AppConfig = AppConfig.fromEnv()) {
    val database = DatabaseFactory.connect(config)
    val users = UserRepository()
    val authService = AuthService(
        database = database,
        users = users,
        passwords = PasswordHasher(config.bcryptCost),
        jwt = JwtService(config),
    )
    val userService = UserService(database, users)
    configureCors(config)
    configureSerialization()
    configureStatusPages()
    configureSecurity(config)
    configureRouting(authService, userService)
}
