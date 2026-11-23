package com.rushbound.service

import io.ktor.http.HttpStatusCode

open class ApiException(
    val status: HttpStatusCode,
    override val message: String,
) : RuntimeException(message)

class ValidationException(message: String) : ApiException(HttpStatusCode.BadRequest, message)

class UnauthorizedException(message: String) : ApiException(HttpStatusCode.Unauthorized, message)

class ConflictException(message: String) : ApiException(HttpStatusCode.Conflict, message)
