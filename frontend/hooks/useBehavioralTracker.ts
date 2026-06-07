import { useRef, useCallback } from 'react'

export interface KeystrokeData {
  key: string
  dwellTime: number     // how long key was held (ms)
  flightTime: number    // time between consecutive keydowns (ms)
  timestamp: number
}

export interface BehavioralProfile {
  keystrokes: KeystrokeData[]
  avgDwellTime: number
  avgFlightTime: number
  typingSpeed: number       // chars per second
  totalDuration: number     // ms
  startTime: number
}

export function useBehavioralTracker() {
  const keyDownTimes = useRef<Map<string, number>>(new Map())
  const lastKeyDownTime = useRef<number | null>(null)
  const keystrokes = useRef<KeystrokeData[]>([])
  const startTime = useRef<number>(Date.now())
  const charCount = useRef<number>(0)

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const now = Date.now()
    if (!keyDownTimes.current.has('__start__')) {
      startTime.current = now
      keyDownTimes.current.set('__start__', now)
    }
    keyDownTimes.current.set(e.key, now)
    lastKeyDownTime.current = now
    charCount.current++
  }, [])

  const onKeyUp = useCallback((e: React.KeyboardEvent) => {
    const now = Date.now()
    const downTime = keyDownTimes.current.get(e.key)
    if (!downTime) return

    const dwellTime = now - downTime
    const flightTime = lastKeyDownTime.current
      ? downTime - lastKeyDownTime.current
      : 0

    keystrokes.current.push({
      key: e.key,
      dwellTime,
      flightTime: Math.max(0, flightTime),
      timestamp: now,
    })

    keyDownTimes.current.delete(e.key)
  }, [])

  const getProfile = useCallback((): BehavioralProfile => {
    const ks = keystrokes.current
    const totalDuration = Date.now() - startTime.current

    const avgDwellTime = ks.length > 0
      ? ks.reduce((s, k) => s + k.dwellTime, 0) / ks.length
      : 0

    const avgFlightTime = ks.length > 1
      ? ks.slice(1).reduce((s, k) => s + k.flightTime, 0) / (ks.length - 1)
      : 0

    const typingSpeed = totalDuration > 0
      ? (charCount.current / totalDuration) * 1000  // chars per second
      : 0

    return {
      keystrokes: ks,
      avgDwellTime,
      avgFlightTime,
      typingSpeed,
      totalDuration,
      startTime: startTime.current,
    }
  }, [])

  const reset = useCallback(() => {
    keyDownTimes.current = new Map()
    lastKeyDownTime.current = null
    keystrokes.current = []
    startTime.current = Date.now()
    charCount.current = 0
  }, [])

  return { onKeyDown, onKeyUp, getProfile, reset }
}
