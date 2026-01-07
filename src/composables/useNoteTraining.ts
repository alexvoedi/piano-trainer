import { computed, ref } from 'vue'
import { useProgress } from './useProgress'

type Accidental = '' | '#' | 'b'

interface Note {
  midiNote: number
  noteName: string
  octave: number
  accidental: Accidental
  staffLine: number
  clef: 'treble' | 'bass'
}

export function useNoteTraining() {
  const noteQueue = ref<Note[]>([])
  const correctCount = ref(0)
  const totalCount = ref(0)

  const { recordAttempt, getErrorWeight } = useProgress()

  const minMidi = 24
  const maxMidi = 96

  // Map MIDI note index to possible representations
  const noteRepresentations: Record<number, Array<{ name: string, accidental: Accidental }>> = {
    0: [{ name: 'C', accidental: '' }],
    1: [{ name: 'C', accidental: '#' }, { name: 'D', accidental: 'b' }],
    2: [{ name: 'D', accidental: '' }],
    3: [{ name: 'D', accidental: '#' }, { name: 'E', accidental: 'b' }],
    4: [{ name: 'E', accidental: '' }],
    5: [{ name: 'F', accidental: '' }],
    6: [{ name: 'F', accidental: '#' }, { name: 'G', accidental: 'b' }],
    7: [{ name: 'G', accidental: '' }],
    8: [{ name: 'G', accidental: '#' }, { name: 'A', accidental: 'b' }],
    9: [{ name: 'A', accidental: '' }],
    10: [{ name: 'A', accidental: '#' }, { name: 'B', accidental: 'b' }],
    11: [{ name: 'B', accidental: '' }],
  }

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

    // Randomly choose between sharp and flat representation for black keys
    const possibleRepresentations = noteRepresentations[noteIndex]
    const randomRep = possibleRepresentations[Math.floor(Math.random() * possibleRepresentations.length)]
    const noteName = randomRep.name
    const accidental = randomRep.accidental

    const clef = midiNote >= 60 ? 'treble' : 'bass'
    const staffLine = getStaffPosition(midiNote, clef)

    return {
      midiNote,
      noteName,
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
