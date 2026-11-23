package com.rushbound.config

import com.rushbound.model.Users
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.SchemaUtils
import org.jetbrains.exposed.v1.jdbc.transactions.transaction

object DatabaseFactory {
    @Volatile
    private var database: Database? = null
    private val lock = Any()

    fun connect(config: AppConfig): Database {
        database?.let { return it }
        synchronized(lock) {
            database?.let { return it }
            val hikari = HikariConfig().apply {
                jdbcUrl = config.jdbcUrl
                username = config.dbUser
                password = config.dbPassword
                driverClassName = "org.postgresql.Driver"
                maximumPoolSize = config.dbPoolSize
                poolName = "rushbound"
                isAutoCommit = false
            }
            val connected = Database.connect(HikariDataSource(hikari))
            transaction(connected) {
                SchemaUtils.create(Users)
                exec(
                    """
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_constraint WHERE conname = 'users_unlocked_level_range'
                        ) THEN
                            ALTER TABLE users
                            ADD CONSTRAINT users_unlocked_level_range
                            CHECK (unlocked_level BETWEEN 1 AND 10);
                        END IF;
                    END
                    $$;
                    """.trimIndent(),
                )
            }
            database = connected
            return connected
        }
    }
}
