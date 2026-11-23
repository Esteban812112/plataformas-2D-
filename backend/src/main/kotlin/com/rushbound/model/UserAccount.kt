package com.rushbound.model

import java.time.OffsetDateTime
import kotlin.uuid.Uuid

data class UserAccount(
    val id: Uuid,
    val email: String,
    val passwordHash: String,
    val unlockedLevel: Int,
    val createdAt: OffsetDateTime,
)
