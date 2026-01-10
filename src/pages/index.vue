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
  <div class="h-screen flex flex-col bg-gray-50 p-4 md:p-6">
    <div class="flex-shrink-0">
      <h1 class="text-2xl md:text-4xl font-bold text-center mb-4">
        Piano Notentrainer
      </h1>

      <div v-if="!isConnected" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p class="font-bold">
          MIDI-Gerät nicht verbunden
        </p>
        <p>Bitte schließe dein Piano an und erlaube den MIDI-Zugriff.</p>
      </div>

      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>
    </div>

    <div class="flex-1 flex flex-col min-h-0 mb-4 overflow-hidden">
      <div class="bg-white rounded-lg shadow-lg p-4 md:p-6 flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <div class="w-full h-full max-w-full max-h-full flex items-center justify-center">
          <StaffDisplay :notes="noteQueue" :active-notes="activeNotes" />
        </div>
      </div>
    </div>

    <div class="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow-lg p-4 gap-4">
      <div class="flex gap-4 text-sm md:text-base">
        <div>
          <span class="font-semibold">Richtig:</span> {{ correctCount }} / {{ totalCount }}
        </div>
        <div>
          <span class="font-semibold">Genauigkeit:</span> {{ accuracy }}%
        </div>
      </div>
      <div class="flex flex-wrap gap-2 justify-center">
        <button
          :class="audioEnabled ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-400 hover:bg-gray-500'"
          class="text-white font-bold py-2 px-4 rounded text-sm"
          @click="toggleAudio"
        >
          {{ audioEnabled ? '🔊 Ton An' : '🔇 Ton Aus' }}
        </button>
        <button
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
          @click="showStats = true"
        >
          Statistiken
        </button>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm"
          @click="reset"
        >
          Zurücksetzen
        </button>
      </div>
    </div>

    <div class="fixed bottom-2 right-2 text-xs text-gray-400">
      {{ buildTime }}
    </div>

    <StatsModal :show="showStats" @close="showStats = false" />
  </div>
</template>
