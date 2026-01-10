import { useLocalStorage } from '@vueuse/core'

interface NoteStats {
  correct: number
  total: number
}

interface ProgressData {
  [midiNote: number]: NoteStats
}

export function useProgress() {
  const progress = useLocalStorage<ProgressData>('piano-trainer-progress', {})

  const recordAttempt = (midiNote: number, isCorrect: boolean) => {
    if (!progress.value[midiNote]) {
      progress.value[midiNote] = { correct: 0, total: 0 }
    }

    progress.value[midiNote].total++
    if (isCorrect) {
      progress.value[midiNote].correct++
    }
  }

  const getSuccessRate = (midiNote: number): number => {
    const stats = progress.value[midiNote]
    if (!stats || stats.total === 0)
      return 0
    return stats.correct / stats.total
  }

  const getErrorWeight = (midiNote: number): number => {
    const successRate = getSuccessRate(midiNote)
    const stats = progress.value[midiNote]

    if (!stats || stats.total === 0)
      return 1

    // Exponential weighting: penalize good performance more strongly
    // successRate 1.0 (100%) → weight 0.1 (very low)
    // successRate 0.9 (90%) → weight 0.25
    // successRate 0.8 (80%) → weight 0.5
    // successRate 0.5 (50%) → weight 3
    // successRate 0.3 (30%) → weight 10
    // successRate 0.0 (0%) → weight 20
    const errorRate = 1 - successRate
    return Math.max(0.1, (errorRate * 4) ** 2)
  }

  const resetProgress = () => {
    progress.value = {}
  }

  return {
    progress,
    recordAttempt,
    getSuccessRate,
    getErrorWeight,
    resetProgress,
  }
}
