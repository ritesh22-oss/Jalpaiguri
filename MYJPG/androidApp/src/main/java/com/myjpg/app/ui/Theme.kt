package com.myjpg.app.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val PrimaryBlue = Color(0xFF1E3A8A)
val SecondaryBlue = Color(0xFF2563EB)
val LightBlueBg = Color(0xFFF0F6FF)
val CardBorderBlue = Color(0xFFDBEFE)
val AccentGold = Color(0xFFD97706)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    onPrimary = Color.White,
    primaryContainer = LightBlueBg,
    onPrimaryContainer = PrimaryBlue,
    secondary = SecondaryBlue,
    onSecondary = Color.White,
    background = Color(0xFFF8FAFC),
    onBackground = Color(0xFF0F172A),
    surface = Color.White,
    onSurface = Color(0xFF0F172A)
)

private val DarkColorScheme = darkColorScheme(
    primary = SecondaryBlue,
    onPrimary = Color.White,
    secondary = LightBlueBg,
    background = Color(0xFF0F172A),
    surface = Color(0xFF1E293B)
)

@Composable
fun MYJPGTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colors,
        content = content
    )
}
