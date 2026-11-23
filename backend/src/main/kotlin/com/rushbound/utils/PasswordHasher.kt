package com.rushbound.utils

import at.favre.lib.crypto.bcrypt.BCrypt

class PasswordHasher(private val cost: Int) {
    private val hasher = BCrypt.withDefaults()
    private val verifier = BCrypt.verifyer()
    private val dummyHash: String

    init {
        require(cost in 4..31) { "BCrypt cost must be between 4 and 31." }
        dummyHash = hasher.hashToString(cost, "rushbound-timing-placeholder".toCharArray())
    }

    fun hash(password: String): String = hasher.hashToString(cost, password.toCharArray())

    /**
     * Always runs a BCrypt comparison. Unknown accounts are checked against a
     * dummy hash so the response time does not reveal whether the email exists.
     */
    fun matches(password: String, storedHash: String?): Boolean {
        val candidate = storedHash ?: dummyHash
        val verified = verifier.verify(password.toCharArray(), candidate).verified
        return storedHash != null && verified
    }
}
