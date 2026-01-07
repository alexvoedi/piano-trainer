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
  renderer.resize(1200, 450)
  const context = renderer.getContext()
  context.scale(2, 2)

  const trebleStave = new Stave(10, 30, 570)
  trebleStave.addClef('treble')
  trebleStave.setContext(context).draw()

  const bassStave = new Stave(10, 90, 570)
  bassStave.addClef('bass')
  bassStave.setContext(context).draw()

  if (props.notes.length > 0) {
    const allNotes: StaveNote[] = []

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

    new Formatter().joinVoices([voice]).format([voice], 400)

    allNotes.forEach((note) => {
      note.draw()
    })

    if (props.activeNotes.size > 0) {
      const firstNote = allNotes[0]
      const firstNoteX = firstNote.getAbsoluteX()

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
  <div ref="container" />
</template>
