package com.rushbound.config

import java.nio.file.Files
import java.nio.file.Path

/**
 * Environment variables win over a local .env file. The file is optional and
 * is never required in production.
 */
internal object Environment {
    private val fileValues: Map<String, String> = loadDotEnv()

    fun get(key: String): String? = System.getenv(key)?.takeIf { it.isNotBlank() } ?: fileValues[key]

    private fun loadDotEnv(): Map<String, String> {
        val workingDirectory = Path.of(System.getProperty("user.dir"))
        val candidates = listOf(
            workingDirectory.resolve(".env"),
            workingDirectory.resolve("backend").resolve(".env"),
        )
        val file = candidates.firstOrNull { Files.isRegularFile(it) } ?: return emptyMap()
        val values = linkedMapOf<String, String>()
        Files.readAllLines(file).forEach { rawLine ->
            val line = rawLine.trim()
            if (line.isEmpty() || line.startsWith("#")) return@forEach
            val separator = line.indexOf('=')
            if (separator <= 0) return@forEach
            val key = line.substring(0, separator).trim()
            var value = line.substring(separator + 1).trim()
            if (value.length >= 2 &&
                ((value.startsWith("\"") && value.endsWith("\"")) ||
                    (value.startsWith("'") && value.endsWith("'")))
            ) {
                value = value.substring(1, value.length - 1)
            }
            if (key.isNotEmpty()) values[key] = value
        }
        return values
    }
}
