package com.rushbound.support

import com.rushbound.config.AppConfig
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres
import java.net.ServerSocket

object TestPostgres {
    private val port: Int = ServerSocket(0).use { it.localPort }

    val postgres: EmbeddedPostgres by lazy {
        EmbeddedPostgres.builder()
            .setPort(port)
            .start()
            .also { instance ->
                Runtime.getRuntime().addShutdownHook(
                    Thread {
                        runCatching { instance.close() }
                    },
                )
            }
    }

    val config: AppConfig by lazy {
        postgres
        AppConfig(
            port = 8081,
            jdbcUrl = "jdbc:postgresql://localhost:$port/postgres",
            dbUser = "postgres",
            dbPassword = "postgres",
            dbPoolSize = 10,
            jwtSecret = "test-only-jwt-secret-not-for-production-use",
            jwtIssuer = "rushbound-test",
            jwtAudience = "rushbound-test",
            jwtExpirationSeconds = 3600,
            bcryptCost = 4,
        )
    }
}
