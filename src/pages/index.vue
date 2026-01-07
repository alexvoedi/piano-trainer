<script setup lang="ts">
import { onMounted, ref } from 'vue'
import StaffDisplay from '../components/StaffDisplay.vue'
import StatsModal from '../components/StatsModal.vue'
import { useMidi } from '../composables/useMidi'
import { useNoteTraining } from '../composables/useNoteTraining'

const { isConnected, error, onNotePressed, activeNotes } = useMidi()
const { noteQueue, correctCount, totalCount, accuracy, checkNote, reset } = useNoteTraining()

const showStats = ref(false)

onMounted(() => {
  reset()

  onNotePressed((midiNote) => {
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

    <StatsModal :show="showStats" @close="showStats = false" />
  </div>
</template>
