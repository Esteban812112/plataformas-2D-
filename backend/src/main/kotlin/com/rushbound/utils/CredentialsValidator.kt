package com.rushbound.utils

import com.rushbound.service.ValidationException

object CredentialsValidator {
    private val emailPattern = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")

    fun normalizeEmail(raw: String): String {
        val email = raw.trim().lowercase()
        if (email.length > 255 || !emailPattern.matches(email)) {
            throw ValidationException("Enter a valid email address.")
        }
        return email
    }

    fun requirePassword(password: String) {
        val byteLength = password.toByteArray(Charsets.UTF_8).size
        if (password.length < 8 || byteLength > 72) {
            throw ValidationException("Password must be 8 to 72 characters and at most 72 bytes.")
        }
    }
}
