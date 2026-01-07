<script setup lang="ts">
import { computed } from 'vue'
import { useProgress } from '../composables/useProgress'

interface Props {
  show: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const { progress, resetProgress } = useProgress()

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const stats = computed(() => {
  return Object.entries(progress.value)
    .map(([midi, data]) => {
      const midiNote = Number(midi)
      const noteIndex = midiNote % 12
      const octave = Math.floor(midiNote / 12) - 1
      const noteName = noteNames[noteIndex]
      const successRate = data.total > 0 ? (data.correct / data.total) * 100 : 0

      return {
        midiNote,
        noteName: `${noteName}${octave}`,
        correct: data.correct,
        total: data.total,
        successRate,
      }
    })
    .sort((a, b) => a.midiNote - b.midiNote)
})

const totalStats = computed(() => {
  const total = stats.value.reduce((sum, s) => sum + s.total, 0)
  const correct = stats.value.reduce((sum, s) => sum + s.correct, 0)
  const successRate = total > 0 ? (correct / total) * 100 : 0

  return { total, correct, successRate }
})

function handleReset() {
  resetProgress()
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" @click.stop>
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold">
            Statistiken
          </h2>
          <button class="text-gray-500 hover:text-gray-700 text-2xl" @click="emit('close')">
            ×
          </button>
        </div>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">
            Gesamt
          </h3>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div class="text-sm text-gray-600">
                Versuche
              </div>
              <div class="text-2xl font-bold">
                {{ totalStats.total }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600">
                Richtig
              </div>
              <div class="text-2xl font-bold text-green-600">
                {{ totalStats.correct }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600">
                Erfolgsquote
              </div>
              <div class="text-2xl font-bold">
                {{ totalStats.successRate.toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>

        <div v-if="stats.length > 0">
          <h3 class="text-lg font-semibold mb-4">
            Pro Note
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="stat in stats" :key="stat.midiNote" class="border border-gray-200 rounded-lg p-3">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-lg">{{ stat.noteName }}</span>
                <span class="text-sm" :class="stat.successRate >= 80 ? 'text-green-600' : stat.successRate >= 50 ? 'text-yellow-600' : 'text-red-600'">
                  {{ stat.successRate.toFixed(1) }}%
                </span>
              </div>
              <div class="text-sm text-gray-600">
                {{ stat.correct }} / {{ stat.total }} richtig
              </div>
              <div class="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="stat.successRate >= 80 ? 'bg-green-500' : stat.successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                  :style="{ width: `${stat.successRate}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-500 py-8">
          Noch keine Statistiken vorhanden. Spiele ein paar Noten!
        </div>
      </div>

      <div class="p-6 border-t border-gray-200 flex justify-between">
        <button
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
          @click="handleReset"
        >
          Statistiken zurücksetzen
        </button>
        <button
          class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
          @click="emit('close')"
        >
          Schließen
        </button>
      </div>
    </div>
  </div>
</template>
