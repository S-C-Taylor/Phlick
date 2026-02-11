# Phlick – OSRS Prayer Flick Trainer

Android app that trains Old School RuneScape players on the 600ms tick-based prayer protection system.

## How to run

1. Open the project in **Android Studio** (Hedgehog or later recommended).
2. Let Gradle sync (Android Studio will use its bundled Gradle or download the wrapper).
3. Run on an emulator or device (min SDK 26).

## How to play

1. Tap **Start** to begin the tick engine.
2. Two “monsters” (blue = Mage, green = Range) attack every 4 ticks, 1 tick apart (Mage on ticks 0, 4, 8…; Range on 1, 5, 9…).
3. Each monster briefly animates (scale pulse) when its attack starts.
4. Tap **Protect from Magic** or **Protect from Missiles** so the correct prayer is active when that monster’s attack lands.
5. Correct prayer on an attack tick increases your streak; wrong prayer resets it. Maximize your streak.

## Tech stack

- Kotlin, Jetpack Compose, single Activity
- 600ms tick engine (coroutine-based)
- Game state and evaluation in `game/`; UI in `ui/`

## Project structure

- `app/src/main/java/com/phlick/`
  - `MainActivity.kt` – Compose entry
  - `game/` – TickEngine, Prayer, PrayerFlickState, GameStateHolder
  - `ui/` – Theme, MonsterView, PrayerFlickScreen, PrayerFlickViewModel
