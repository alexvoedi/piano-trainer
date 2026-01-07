import { computed, ref } from 'vue'
import { useProgress } from './useProgress'

interface Note {
  midiNote: number
  noteName: string
  octave: number
  accidental: '' | '#' | 'b'
  staffLine: number
  clef: 'treble' | 'bass'
}

export function useNoteTraining() {
  const noteQueue = ref<Note[]>([])
  const correctCount = ref(0)
  const totalCount = ref(0)

  const { recordAttempt, getErrorWeight } = useProgress()

  const minMidi = 36
  const maxMidi = 84

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  const getStaffPosition = (midiNote: number, clef: 'treble' | 'bass'): number => {
    const c4Midi = 60
    const distanceFromC4 = midiNote - c4Midi

    if (clef === 'treble') {
      return -distanceFromC4
    }
    else {
      return -(distanceFromC4 - 12)
    }
  }

  const generateRandomNote = (): Note => {
    const allMidiNotes = []
    for (let midi = minMidi; midi <= maxMidi; midi++) {
      allMidiNotes.push(midi)
    }

    const weights = allMidiNotes.map(midi => getErrorWeight(midi))
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)

    let random = Math.random() * totalWeight
    let selectedMidi = minMidi

    for (let i = 0; i < allMidiNotes.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        selectedMidi = allMidiNotes[i]
        break
      }
    }

    const midiNote = selectedMidi
    const noteIndex = midiNote % 12
    const octave = Math.floor(midiNote / 12) - 1
    const noteName = noteNames[noteIndex]

    const baseNoteName = noteName.replace('#', '')
    const accidental = noteName.includes('#') ? '#' : ''

    const clef = midiNote >= 60 ? 'treble' : 'bass'
    const staffLine = getStaffPosition(midiNote, clef)

    return {
      midiNote,
      noteName: baseNoteName,
      octave,
      accidental,
      staffLine,
      clef,
    }
  }

  const fillQueue = () => {
    while (noteQueue.value.length < 6) {
      noteQueue.value.push(generateRandomNote())
    }
  }

  const nextNote = () => {
    noteQueue.value.shift()
    fillQueue()
  }

  const checkNote = (playedMidiNote: number): boolean => {
    if (noteQueue.value.length === 0)
      return false

    const expectedMidiNote = noteQueue.value[0].midiNote
    totalCount.value++
    const isCorrect = playedMidiNote === expectedMidiNote

    recordAttempt(expectedMidiNote, isCorrect)

    if (isCorrect) {
      correctCount.value++
      nextNote()
    }

    return isCorrect
  }

  const accuracy = computed(() => {
    if (totalCount.value === 0)
      return 0
    return Math.round((correctCount.value / totalCount.value) * 100)
  })

  const reset = () => {
    correctCount.value = 0
    totalCount.value = 0
    noteQueue.value = []
    fillQueue()
  }

  return {
    noteQueue,
    correctCount,
    totalCount,
    accuracy,
    checkNote,
    nextNote,
    reset,
  }
}
