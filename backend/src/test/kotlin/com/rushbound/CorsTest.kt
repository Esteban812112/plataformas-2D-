package com.rushbound

import io.ktor.client.request.header
import io.ktor.client.request.options
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class CorsTest : BackendTest() {
    @Test
    fun allowsTheExpoWebOriginAndNoOthers() = withApp {
        val allowed = client.options("/users/me/level") {
            header(HttpHeaders.Origin, "http://localhost:8081")
            header(HttpHeaders.AccessControlRequestMethod, "PUT")
            header(HttpHeaders.AccessControlRequestHeaders, "authorization,content-type")
        }
        assertEquals(HttpStatusCode.OK, allowed.status)
        assertEquals("http://localhost:8081", allowed.headers[HttpHeaders.AccessControlAllowOrigin])

        val blocked = client.options("/users/me/level") {
            header(HttpHeaders.Origin, "http://evil.example")
            header(HttpHeaders.AccessControlRequestMethod, "PUT")
        }
        assertNull(blocked.headers[HttpHeaders.AccessControlAllowOrigin])
    }
}
