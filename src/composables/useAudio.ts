import { ref } from 'vue'

const audioContext = ref<AudioContext | null>(null)
const isEnabled = ref(true)

function initAudio() {
  audioContext.value ??= new AudioContext()
}

function playNote(midiNote: number, duration: number = 0.3) {
  if (!isEnabled.value) {
    return
  }

  initAudio()

  if (!audioContext.value) {
    return
  }

  const frequency = 440 * (2 ** ((midiNote - 69) / 12))

  const oscillator = audioContext.value.createOscillator()
  const gainNode = audioContext.value.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.value.destination)

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  const now = audioContext.value.currentTime
  gainNode.gain.setValueAtTime(0.3, now)
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

  oscillator.start(now)
  oscillator.stop(now + duration)
}

function toggleAudio() {
  isEnabled.value = !isEnabled.value
}

export function useAudio() {
  return {
    isEnabled,
    playNote,
    toggleAudio,
  }
}
