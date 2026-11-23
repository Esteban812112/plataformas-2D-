package com.rushbound

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.rushbound.model.Users
import com.rushbound.support.TestPostgres
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import java.time.Instant
import java.util.Date
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class AuthRoutesTest : BackendTest() {
    @Test
    fun registerCreatesLevelOneAndDoesNotReturnThePassword() = withApp {
        val response = register("Player@Example.com", "password123")
        assertEquals(HttpStatusCode.Created, response.status)
        val body = response.bodyAsText()
        val auth = response.authBody()
        assertEquals("player@example.com", auth.user.email)
        assertEquals(1, auth.user.unlockedLevel)
        assertTrue(auth.token.isNotBlank())
        assertTrue(auth.user.createdAt.contains("T"))
        assertFalse(body.contains("password123"))
        assertFalse(body.contains("passwordHash"))

        val database = com.rushbound.config.DatabaseFactory.connect(TestPostgres.config)
        val storedHash = transaction(database) {
            Users.selectAll().where { Users.email eq "player@example.com" }.single()[Users.passwordHash]
        }
        assertNotEquals("password123", storedHash)
        assertTrue(storedHash.startsWith("\$2a\$"))
    }

    @Test
    fun registerRejectsDuplicateEmailInvalidEmailAndShortPassword() = withApp {
        assertEquals(HttpStatusCode.Created, register("ada@rushbound.test").status)

        val duplicate = register("Ada@rushbound.test", "another-password")
        assertEquals(HttpStatusCode.Conflict, duplicate.status)
        assertEquals("An account with this email already exists.", duplicate.errorBody().error)

        val invalidEmail = client.post("/auth/register") {
            contentType(ContentType.Application.Json)
            setBody("""{"email":"not-an-email","password":"password123"}""")
        }
        assertEquals(HttpStatusCode.BadRequest, invalidEmail.status)

        val shortPassword = register("new@rushbound.test", "short")
        assertEquals(HttpStatusCode.BadRequest, shortPassword.status)

        val malformed = client.post("/auth/register") {
            contentType(ContentType.Application.Json)
            setBody("""{"email":"ada@rushbound.test"}""")
        }
        assertEquals(HttpStatusCode.BadRequest, malformed.status)
    }

    @Test
    fun loginAcceptsTheRegisteredPasswordAndRejectsEverythingElse() = withApp {
        register("login@rushbound.test", "password123")

        val success = login("Login@rushbound.test", "password123")
        assertEquals(HttpStatusCode.OK, success.status)
        assertEquals(1, success.authBody().user.unlockedLevel)

        val wrongPassword = login("login@rushbound.test", "wrong-password")
        assertEquals(HttpStatusCode.Unauthorized, wrongPassword.status)
        assertEquals("Invalid email or password.", wrongPassword.errorBody().error)

        val unknown = login("missing@rushbound.test", "password123")
        assertEquals(HttpStatusCode.Unauthorized, unknown.status)
        assertEquals("Invalid email or password.", unknown.errorBody().error)

        val invalidShape = login("not-an-email", "password123")
        assertEquals(HttpStatusCode.Unauthorized, invalidShape.status)
    }

    @Test
    fun privateRoutesRequireAValidTokenForThatUser() = withApp {
        val first = register("one@rushbound.test").authBody()
        val second = register("two@rushbound.test").authBody()

        val missing = client.get("/users/me")
        assertEquals(HttpStatusCode.Unauthorized, missing.status)

        val garbage = client.get("/users/me") {
            header(HttpHeaders.Authorization, "Bearer not-a-token")
        }
        assertEquals(HttpStatusCode.Unauthorized, garbage.status)

        val wrongSignature = client.get("/users/me") {
            header(HttpHeaders.Authorization, "Bearer ${forgedToken(first.user.id)}")
        }
        assertEquals(HttpStatusCode.Unauthorized, wrongSignature.status)

        val expired = client.get("/users/me") {
            header(HttpHeaders.Authorization, "Bearer ${expiredToken(first.user.id)}")
        }
        assertEquals(HttpStatusCode.Unauthorized, expired.status)

        val me = client.get("/users/me") {
            header(HttpHeaders.Authorization, "Bearer ${first.token}")
        }
        assertEquals(HttpStatusCode.OK, me.status)
        assertEquals(first.user.id, me.userBody().id)
        assertEquals("one@rushbound.test", me.userBody().email)

        val other = client.get("/users/me") {
            header(HttpHeaders.Authorization, "Bearer ${second.token}")
        }
        assertEquals("two@rushbound.test", other.userBody().email)
        assertNotEquals(first.user.id, other.userBody().id)

        val unauthenticatedLevel = client.put("/users/me/level") {
            contentType(ContentType.Application.Json)
            setBody("""{"level":2}""")
        }
        assertEquals(HttpStatusCode.Unauthorized, unauthenticatedLevel.status)
    }

    private fun forgedToken(userId: String): String =
        JWT.create()
            .withIssuer("rushbound-test")
            .withAudience("rushbound-test")
            .withSubject(userId)
            .withExpiresAt(Date.from(Instant.now().plusSeconds(3600)))
            .sign(Algorithm.HMAC256("a-different-secret-that-is-long-enough!!"))

    private fun expiredToken(userId: String): String =
        JWT.create()
            .withIssuer("rushbound-test")
            .withAudience("rushbound-test")
            .withSubject(userId)
            .withExpiresAt(Date.from(Instant.now().minusSeconds(60)))
            .sign(Algorithm.HMAC256(TestPostgres.config.jwtSecret))
}
