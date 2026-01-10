<script setup lang="ts">
import { onMounted, ref } from 'vue'
import StaffDisplay from '../components/StaffDisplay.vue'
import StatsModal from '../components/StatsModal.vue'
import { useAudio } from '../composables/useAudio'
import { useMidi } from '../composables/useMidi'
import { useNoteTraining } from '../composables/useNoteTraining'

declare const __BUILD_TIME__: string

const { isConnected, error, onNotePressed, activeNotes } = useMidi()
const { noteQueue, correctCount, totalCount, accuracy, checkNote, reset } = useNoteTraining()
const { isEnabled: audioEnabled, playNote, toggleAudio } = useAudio()

const showStats = ref(false)
const buildTime = new Date(__BUILD_TIME__).toLocaleString('de-DE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

onMounted(() => {
  reset()

  onNotePressed((midiNote) => {
    playNote(midiNote)
    checkNote(midiNote)
  })
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
    <div class="max-w-full w-full px-4">
      <h1 class="text-4xl font-bold text-center mb-8">
        Piano Notentrainer
      </h1>

      <div v-if="!isConnected" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        <p class="font-bold">
          MIDI-Gerät nicht verbunden
        </p>
        <p>Bitte schließe dein Piano an und erlaube den MIDI-Zugriff.</p>
      </div>

      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8 mb-6">
        <StaffDisplay :notes="noteQueue" :active-notes="activeNotes" />
      </div>

      <div class="flex justify-between items-center bg-white rounded-lg shadow-lg p-6">
        <div class="text-lg">
          <span class="font-semibold">Richtig:</span> {{ correctCount }} / {{ totalCount }}
        </div>
        <div class="text-lg">
          <span class="font-semibold">Genauigkeit:</span> {{ accuracy }}%
        </div>
        <div class="flex gap-3">
          <button
            :class="audioEnabled ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-400 hover:bg-gray-500'"
            class="text-white font-bold py-2 px-6 rounded"
            @click="toggleAudio"
          >
            {{ audioEnabled ? '🔊 Ton An' : '🔇 Ton Aus' }}
          </button>
          <button
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
            @click="showStats = true"
          >
            Statistiken
          </button>
          <button
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            @click="reset"
          >
            Zurücksetzen
          </button>
        </div>
      </div>
    </div>

    <div class="fixed bottom-2 right-2 text-xs text-gray-400">
      {{ buildTime }}
    </div>

    <StatsModal :show="showStats" @close="showStats = false" />
  </div>
</template>
