<script setup lang="ts">
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow'
import { nextTick, onMounted, ref, watch } from 'vue'

interface Note {
  midiNote: number
  noteName: string
  octave: number
  accidental: '' | '#' | 'b'
  staffLine: number
  clef: 'treble' | 'bass'
}

interface Props {
  notes: Note[]
  activeNotes: Set<number>
}

const props = defineProps<Props>()

const container = ref<HTMLDivElement | null>(null)
const svgContainer = ref<SVGElement | null>(null)

function midiToNote(midi: number) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const noteIndex = midi % 12
  const octave = Math.floor(midi / 12) - 1
  const fullName = noteNames[noteIndex]
  const noteName = fullName.replace('#', '')
  const accidental = fullName.includes('#') ? '#' : ''
  return { noteName, accidental, octave }
}

function renderNote() {
  if (!container.value)
    return

  container.value.innerHTML = ''

  const renderer = new Renderer(container.value, Renderer.Backends.SVG)
  renderer.resize(600, 300)
  const context = renderer.getContext()

  const trebleStave = new Stave(10, 60, 570)
  trebleStave.addClef('treble')
  trebleStave.setContext(context).draw()

  const bassStave = new Stave(10, 120, 570)
  bassStave.addClef('bass')
  bassStave.setContext(context).draw()

  // Store reference to SVG for responsiveness
  const svg = container.value.querySelector('svg')
  if (svg) {
    svgContainer.value = svg as SVGElement
    svg.setAttribute('viewBox', '0 0 600 300')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.maxWidth = '100%'
    svg.style.maxHeight = '100%'
    svg.style.objectFit = 'contain'
  }

  if (props.notes.length > 0) {
    const allNotes: StaveNote[] = []
    const notePositions: number[] = []

    props.notes.forEach((note, index) => {
      const noteStr = `${note.noteName}${note.accidental}/${note.octave}`
      const staveNote = new StaveNote({
        keys: [noteStr],
        duration: 'q',
        clef: note.clef,
      })

      if (note.accidental === '#') {
        staveNote.addModifier(new Accidental('#'), 0)
      }
      else if (note.accidental === 'b') {
        staveNote.addModifier(new Accidental('b'), 0)
      }

      if (index === 0) {
        staveNote.setStyle({ fillStyle: '#000', strokeStyle: '#000' })
      }
      else {
        staveNote.setStyle({ fillStyle: '#888', strokeStyle: '#888' })
      }

      const stave = note.clef === 'treble' ? trebleStave : bassStave
      staveNote.setStave(stave)
      allNotes.push(staveNote)
    })

    const voice = new Voice({ numBeats: allNotes.length, beatValue: 4 })
    voice.addTickables(allNotes)

    new Formatter().joinVoices([voice]).format([voice], 450)

    // Store the X positions after formatting but before any shifts
    allNotes.forEach((note) => {
      notePositions.push(note.getAbsoluteX())
    })

    allNotes.forEach((note) => {
      note.draw()
    })

    if (props.activeNotes.size > 0) {
      const firstNoteX = notePositions[0]

      props.activeNotes.forEach((midiNote) => {
        const played = midiToNote(midiNote)
        const playedClef = midiNote >= 60 ? 'treble' : 'bass'
        const playedStave = playedClef === 'treble' ? trebleStave : bassStave
        const playedNoteStr = `${played.noteName}${played.accidental}/${played.octave}`

        const playedStaveNote = new StaveNote({
          keys: [playedNoteStr],
          duration: 'q',
          clef: playedClef,
        })

        if (played.accidental === '#') {
          playedStaveNote.addModifier(new Accidental('#'), 0)
        }
        else if (played.accidental === 'b') {
          playedStaveNote.addModifier(new Accidental('b'), 0)
        }

        playedStaveNote.setStyle({ fillStyle: 'rgba(59, 130, 246, 0.5)', strokeStyle: 'rgba(59, 130, 246, 0.5)' })
        playedStaveNote.setStave(playedStave)

        const playedVoice = new Voice({ numBeats: 1, beatValue: 4 })
        playedVoice.addTickables([playedStaveNote])
        new Formatter().joinVoices([playedVoice]).format([playedVoice], 100)

        const playedNoteX = playedStaveNote.getAbsoluteX()
        playedStaveNote.setXShift(firstNoteX - playedNoteX)

        playedStaveNote.draw()
      })
    }
  }
}

onMounted(async () => {
  await nextTick()
  renderNote()
})

watch([() => props.notes, () => props.activeNotes], () => {
  renderNote()
}, { deep: true })
</script>

<template>
  <div ref="container" class="w-full h-full max-w-full max-h-full flex items-center justify-center" />
</template>
