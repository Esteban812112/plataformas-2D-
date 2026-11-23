package com.rushbound.config

data class AppConfig(
    val port: Int,
    val jdbcUrl: String,
    val dbUser: String,
    val dbPassword: String,
    val dbPoolSize: Int,
    val jwtSecret: String,
    val jwtIssuer: String,
    val jwtAudience: String,
    val jwtExpirationSeconds: Long,
    val bcryptCost: Int,
    val corsAllowedOrigins: List<String> = DEFAULT_CORS_ORIGINS,
) {
    companion object {
        fun fromEnv(): AppConfig {
            val jdbcUrl = Environment.get("DATABASE_URL")
                ?: error("Missing environment variable DATABASE_URL")
            require(jdbcUrl.startsWith("jdbc:postgresql:")) {
                "DATABASE_URL must be a PostgreSQL JDBC URL."
            }
            val jwtSecret = Environment.get("JWT_SECRET")
                ?: error("Missing environment variable JWT_SECRET")
            require(jwtSecret.length >= 32) {
                "JWT_SECRET must be at least 32 characters."
            }
            val bcryptCost = optionalInt("BCRYPT_COST", 12)
            require(bcryptCost in 4..31) { "BCRYPT_COST must be between 4 and 31." }
            val expiration = optionalLong("JWT_EXPIRATION_SECONDS", 86_400)
            require(expiration in 60..604_800) {
                "JWT_EXPIRATION_SECONDS must be between 60 and 604800."
            }
            val port = optionalInt("PORT", 8082)
            require(port in 1..65535) { "PORT must be between 1 and 65535." }
            val pool = optionalInt("DB_POOL_SIZE", 10)
            require(pool in 1..50) { "DB_POOL_SIZE must be between 1 and 50." }
            return AppConfig(
                port = port,
                jdbcUrl = jdbcUrl,
                dbUser = Environment.get("DATABASE_USER")
                    ?: error("Missing environment variable DATABASE_USER"),
                dbPassword = Environment.get("DATABASE_PASSWORD")
                    ?: error("Missing environment variable DATABASE_PASSWORD"),
                dbPoolSize = pool,
                jwtSecret = jwtSecret,
                jwtIssuer = Environment.get("JWT_ISSUER") ?: "rushbound",
                jwtAudience = Environment.get("JWT_AUDIENCE") ?: "rushbound-api",
                jwtExpirationSeconds = expiration,
                bcryptCost = bcryptCost,
                corsAllowedOrigins = parseOrigins(Environment.get("CORS_ALLOWED_ORIGINS")),
            )
        }

        val DEFAULT_CORS_ORIGINS = listOf("http://localhost:8081", "http://localhost:19006")

        private fun parseOrigins(raw: String?): List<String> {
            if (raw == null) return DEFAULT_CORS_ORIGINS
            val origins = raw.split(',').map { it.trim() }.filter { it.isNotEmpty() }
            require(origins.all { it.startsWith("http://") || it.startsWith("https://") }) {
                "CORS_ALLOWED_ORIGINS must be a comma-separated list of http(s) origins."
            }
            return origins
        }

        private fun optionalInt(key: String, default: Int): Int {
            val raw = Environment.get(key) ?: return default
            return raw.toIntOrNull() ?: error("$key must be an integer.")
        }

        private fun optionalLong(key: String, default: Long): Long {
            val raw = Environment.get(key) ?: return default
            return raw.toLongOrNull() ?: error("$key must be an integer.")
        }
    }
}
