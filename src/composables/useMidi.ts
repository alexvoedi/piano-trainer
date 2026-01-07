import { onMounted, onUnmounted, ref } from 'vue'

export function useMidi() {
  const midiAccess = ref<MIDIAccess | null>(null)
  const isSupported = ref(false)
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const activeNotes = ref<Set<number>>(new Set())

  const noteCallbacks: ((note: number) => void)[] = []

  const onNotePressed = (callback: (note: number) => void) => {
    noteCallbacks.push(callback)
  }

  const handleMIDIMessage = (message: MIDIMessageEvent) => {
    const data = message.data
    if (!data || data.length < 3)
      return

    const status = data[0]
    const note = data[1]
    const velocity = data[2]
    const command = status >> 4

    if (command === 9 && velocity > 0) {
      activeNotes.value.add(note)
      activeNotes.value = new Set(activeNotes.value)
      noteCallbacks.forEach(cb => cb(note))
    }
    else if (command === 8 || (command === 9 && velocity === 0)) {
      activeNotes.value.delete(note)
      activeNotes.value = new Set(activeNotes.value)
    }
  }

  const connectToMIDI = async () => {
    try {
      const access = await navigator.requestMIDIAccess()
      midiAccess.value = access
      isSupported.value = true

      access.inputs.forEach((input) => {
        input.onmidimessage = handleMIDIMessage
        isConnected.value = true
      })
    }
    catch {
      error.value = 'MIDI not supported or access denied'
      isSupported.value = false
    }
  }

  onMounted(() => {
    connectToMIDI()
  })

  onUnmounted(() => {
    if (midiAccess.value) {
      midiAccess.value.inputs.forEach((input: MIDIInput) => {
        input.onmidimessage = null
      })
    }
  })

  return {
    isSupported,
    isConnected,
    error,
    activeNotes,
    onNotePressed,
    connectToMIDI,
  }
}
