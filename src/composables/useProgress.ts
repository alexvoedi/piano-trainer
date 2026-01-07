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

    return Math.max(1, (1 - successRate) * 5)
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
