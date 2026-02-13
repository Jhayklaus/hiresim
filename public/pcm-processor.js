class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;
    
    const channelData = input[0]; // Mono audio
    if (!channelData) return true;

    // Send raw float32 data to main thread for encoding/processing
    // We could do downsampling here, but let's keep it simple for now
    this.port.postMessage(channelData);
    
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
