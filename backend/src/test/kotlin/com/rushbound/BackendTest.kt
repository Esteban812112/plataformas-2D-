package com.rushbound

import com.rushbound.config.DatabaseFactory
import com.rushbound.dto.AuthResponse
import com.rushbound.dto.ErrorResponse
import com.rushbound.dto.UserResponse
import com.rushbound.support.TestPostgres
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.server.testing.ApplicationTestBuilder
import io.ktor.server.testing.testApplication
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import kotlin.test.BeforeTest
abstract class BackendTest {
    protected val json = Json { ignoreUnknownKeys = false }

    @BeforeTest
    fun resetDatabase() {
        val database = DatabaseFactory.connect(TestPostgres.config)
        transaction(database) {
            exec("DELETE FROM users")
        }
    }

    protected fun withApp(block: suspend ApplicationTestBuilder.() -> Unit) {
        testApplication {
            application { module(TestPostgres.config) }
            block()
        }
    }

    protected suspend fun ApplicationTestBuilder.register(
        email: String,
        password: String = "password123",
    ): HttpResponse = client.post("/auth/register") {
        contentType(ContentType.Application.Json)
        setBody("""{"email":"$email","password":"$password"}""")
    }

    protected suspend fun ApplicationTestBuilder.login(
        email: String,
        password: String,
    ): HttpResponse = client.post("/auth/login") {
        contentType(ContentType.Application.Json)
        setBody("""{"email":"$email","password":"$password"}""")
    }

    protected suspend fun HttpResponse.authBody(): AuthResponse =
        json.decodeFromString(AuthResponse.serializer(), bodyAsText())

    protected suspend fun HttpResponse.userBody(): UserResponse =
        json.decodeFromString(UserResponse.serializer(), bodyAsText())

    protected suspend fun HttpResponse.errorBody(): ErrorResponse =
        json.decodeFromString(ErrorResponse.serializer(), bodyAsText())
}
