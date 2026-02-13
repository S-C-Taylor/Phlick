package com.phlick.analytics

import android.content.Context
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.ktx.analytics
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Non-blocking analytics and crash reporting. All work runs off the main thread;
 * never blocks gameplay and does not require network or special permissions.
 * Events are batched and sent when the device is online (handled by Firebase).
 */
object PhlickAnalytics {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val analytics: FirebaseAnalytics? by lazy {
        try {
            Firebase.analytics
        } catch (_: Throwable) {
            null
        }
    }

    private val crashlytics: FirebaseCrashlytics? by lazy {
        try {
            FirebaseCrashlytics.getInstance()
        } catch (_: Throwable) {
            null
        }
    }

    /** Log a gameplay or UI event. Fire-and-forget; never blocks. */
    fun logEvent(name: String, params: Map<String, Any>? = null) {
        scope.launch {
            try {
                val fa = analytics ?: return@launch
                val bundle = android.os.Bundle().apply {
                    params?.forEach { (k, v) ->
                        when (v) {
                            is String -> putString(k, v)
                            is Int -> putInt(k, v)
                            is Long -> putLong(k, v)
                            is Double -> putDouble(k, v)
                            is Boolean -> putBoolean(k, v)
                        }
                    }
                }
                fa.logEvent(name, if (bundle.isEmpty) null else bundle)
            } catch (_: Throwable) {
                // Never crash the app; analytics are best-effort
            }
        }
    }

    /** Record a non-fatal exception for debugging. Fire-and-forget; never blocks. */
    fun recordNonFatal(throwable: Throwable) {
        scope.launch {
            try {
                crashlytics?.recordException(throwable)
            } catch (_: Throwable) {
                // Never crash the app
            }
        }
    }

    /** Set the user ID for crash/analytics (optional; e.g. after sign-in). Not used by default. */
    fun setUserId(id: String?) {
        scope.launch {
            try {
                crashlytics?.setUserId(id ?: "")
            } catch (_: Throwable) {}
        }
    }
}
