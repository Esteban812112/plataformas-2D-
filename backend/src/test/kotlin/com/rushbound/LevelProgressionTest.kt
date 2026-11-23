package com.rushbound

import com.rushbound.config.DatabaseFactory
import com.rushbound.model.Users
import com.rushbound.repository.UserRepository
import com.rushbound.service.ConflictException
import com.rushbound.service.UserService
import com.rushbound.support.TestPostgres
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.transactions.transaction
import java.time.OffsetDateTime
import java.time.ZoneOffset
import kotlin.uuid.Uuid
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

class LevelProgressionTest : BackendTest() {
    @Test
    fun aUserCanUnlockOnlyTheNextLevel() = withApp {
        val auth = register("levels@rushbound.test").authBody()

        val jump = client.put("/users/me/level") {
            header(HttpHeaders.Authorization, "Bearer ${auth.token}")
            contentType(ContentType.Application.Json)
            setBody("""{"level":3}""")
        }
        assertEquals(HttpStatusCode.Conflict, jump.status)
        assertTrue(jump.errorBody().error.contains("Current unlocked level is 1"))

        val lower = client.put("/users/me/level") {
            header(HttpHeaders.Authorization, "Bearer ${auth.token}")
            contentType(ContentType.Application.Json)
            setBody("""{"level":1}""")
        }
        assertEquals(HttpStatusCode.Conflict, lower.status)

        val belowRange = client.put("/users/me/level") {
            header(HttpHeaders.Authorization, "Bearer ${auth.token}")
            contentType(ContentType.Application.Json)
            setBody("""{"level":0}""")
        }
        assertEquals(HttpStatusCode.BadRequest, belowRange.status)

        val aboveRange = client.put("/users/me/level") {
            header(HttpHeaders.Authorization, "Bearer ${auth.token}")
            contentType(ContentType.Application.Json)
            setBody("""{"level":11}""")
        }
        assertEquals(HttpStatusCode.BadRequest, aboveRange.status)

        val notANumber = client.put("/users/me/level") {
            header(HttpHeaders.Authorization, "Bearer ${auth.token}")
            contentType(ContentType.Application.Json)
            setBody("""{"level":"abc"}""")
        }
        assertEquals(HttpStatusCode.BadRequest, notANumber.status)

        val advanced = client.put("/users/me/level") {
            header(HttpHeaders.Authorization, "Bearer ${auth.token}")
            contentType(ContentType.Application.Json)
            setBody("""{"level":2}""")
        }
        assertEquals(HttpStatusCode.OK, advanced.status)
        assertEquals(2, advanced.userBody().unlockedLevel)

        val profile = client.get("/users/me") {
            header(HttpHeaders.Authorization, "Bearer ${auth.token}")
        }
        assertEquals(2, profile.userBody().unlockedLevel)
    }

    @Test
    fun oneUserCannotChangeAnotherUsersLevel() = withApp {
        val first = register("first@rushbound.test").authBody()
        val second = register("second@rushbound.test").authBody()

        val advanced = client.put("/users/me/level") {
            header(HttpHeaders.Authorization, "Bearer ${first.token}")
            contentType(ContentType.Application.Json)
            setBody("""{"level":2}""")
        }
        assertEquals(HttpStatusCode.OK, advanced.status)
        assertEquals(first.user.id, advanced.userBody().id)

        val secondProfile = client.get("/users/me") {
            header(HttpHeaders.Authorization, "Bearer ${second.token}")
        }
        assertEquals(1, secondProfile.userBody().unlockedLevel)
        assertEquals(second.user.id, secondProfile.userBody().id)
    }

    @Test
    fun levelTenIsTheLastLevelThatCanBeUnlocked() = withApp {
        val auth = register("final@rushbound.test").authBody()
        for (level in 2..10) {
            val response = client.put("/users/me/level") {
                header(HttpHeaders.Authorization, "Bearer ${auth.token}")
                contentType(ContentType.Application.Json)
                setBody("""{"level":$level}""")
            }
            assertEquals(HttpStatusCode.OK, response.status, "Failed while unlocking level $level")
            assertEquals(level, response.userBody().unlockedLevel)
        }
        val pastEnd = client.put("/users/me/level") {
            header(HttpHeaders.Authorization, "Bearer ${auth.token}")
            contentType(ContentType.Application.Json)
            setBody("""{"level":11}""")
        }
        assertEquals(HttpStatusCode.BadRequest, pastEnd.status)
        val sameLevel = client.put("/users/me/level") {
            header(HttpHeaders.Authorization, "Bearer ${auth.token}")
            contentType(ContentType.Application.Json)
            setBody("""{"level":10}""")
        }
        assertEquals(HttpStatusCode.Conflict, sameLevel.status)
    }

    @Test
    fun theDatabaseRejectsALevelOutsideTheAllowedRange() {
        val database = DatabaseFactory.connect(TestPostgres.config)
        val failure = runCatching {
            transaction(database) {
                Users.insert {
                    it[id] = Uuid.random()
                    it[email] = "constraint@rushbound.test"
                    it[passwordHash] = "not-a-real-hash"
                    it[unlockedLevel] = 11
                    it[createdAt] = OffsetDateTime.now(ZoneOffset.UTC)
                }
            }
        }
        assertTrue(failure.isFailure)
    }

    @Test
    fun concurrentUnlocksOfTheSameLevelAllowOnlyOne() {
        val database = DatabaseFactory.connect(TestPostgres.config)
        val service = UserService(database, UserRepository())
        val userId = Uuid.random()
        transaction(database) {
            Users.insert {
                it[id] = userId
                it[email] = "race@rushbound.test"
                it[passwordHash] = "not-a-real-hash"
                it[unlockedLevel] = 1
                it[createdAt] = OffsetDateTime.now(ZoneOffset.UTC)
            }
        }

        val start = CountDownLatch(1)
        val done = CountDownLatch(2)
        val outcomes = ConcurrentLinkedQueue<String>()
        repeat(2) {
            Thread {
                start.await()
                try {
                    service.advanceLevel(userId, 2)
                    outcomes.add("ok")
                } catch (_: ConflictException) {
                    outcomes.add("conflict")
                } finally {
                    done.countDown()
                }
            }.start()
        }
        start.countDown()
        assertTrue(done.await(20, TimeUnit.SECONDS))
        assertEquals(listOf("conflict", "ok"), outcomes.sorted())
        assertEquals(2, service.getProfile(userId).unlockedLevel)
        assertFailsWith<ConflictException> {
            service.advanceLevel(userId, 2)
        }
    }
}
