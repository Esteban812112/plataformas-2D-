package com.rushbound.config

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.cors.routing.CORS
import java.net.URI

/**
 * Lets the Expo web app (a different origin) call the API from the browser.
 * Only the origins listed in CORS_ALLOWED_ORIGINS are allowed.
 */
fun Application.configureCors(config: AppConfig) {
    install(CORS) {
        config.corsAllowedOrigins.forEach { origin ->
            val uri = URI(origin)
            val hostWithPort = if (uri.port == -1) uri.host else "${uri.host}:${uri.port}"
            allowHost(hostWithPort, schemes = listOf(uri.scheme))
        }
        allowMethod(HttpMethod.Put)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
    }
}
