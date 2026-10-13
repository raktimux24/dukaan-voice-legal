export type RecordedAudio = {audio: string; fileName: string};
export function recordingFileName(mime: string) {
  if (mime.includes('webm')) return 'recording.webm';
  if (mime.includes('ogg')) return 'recording.ogg';
  if (mime.includes('mp4')) return 'recording.m4a';
  if (mime.includes('wav')) return 'recording.wav';
  throw Error('unsupported_audio');
}
export async function blobAudio(blob: Blob): Promise<RecordedAudio> {
  if (!blob.size || blob.size > 10 * 1024 * 1024) throw Error('invalid_audio');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i=0; i<bytes.length; i+=8192) binary += String.fromCharCode(...bytes.subarray(i,i+8192));
  return {audio: btoa(binary), fileName: recordingFileName(blob.type)};
}
/** Each capture owns its stream; cancellation also invalidates pending permission requests. */
export class BrowserAudioCapture {
  private recorder?: MediaRecorder;
  private stream?: MediaStream;
  private timer?: ReturnType<typeof setTimeout>;
  private generation = 0;
  async start(onComplete: (audio: RecordedAudio) => void, onError: (error: unknown) => void) {
    this.cancel();
    const generation = this.generation;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw Error('unsupported_audio');
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    if (generation !== this.generation) { stream.getTracks().forEach(track=>track.stop()); return false; }
    this.stream=stream;
    try {
      const mime = ['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(value=>MediaRecorder.isTypeSupported(value));
      if (!mime) throw Error('unsupported_audio');
      const recorder = new MediaRecorder(stream, {mimeType:mime});
      this.recorder=recorder;
      const chunks: Blob[]=[];
      recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
      recorder.onerror=()=>{if(generation===this.generation){this.cancel();onError(Error('recording_failed'));}};
      recorder.onstop=()=>{
        clearTimeout(this.timer);stream.getTracks().forEach(track=>track.stop());
        if(generation!==this.generation)return;
        this.recorder=undefined;this.stream=undefined;
        void blobAudio(new Blob(chunks,{type:recorder.mimeType})).then(audio=>{if(generation===this.generation)onComplete(audio);}).catch(error=>{if(generation===this.generation)onError(error);});
      };
      recorder.start();
      this.timer=setTimeout(()=>this.stop(),30_000);
      return true;
    } catch(error) {this.cancel();throw error;}
  }
  stop() {if(this.recorder?.state==='recording')this.recorder.stop();}
  cancel() {
    this.generation++;clearTimeout(this.timer);
    if(this.recorder && this.recorder.state!=='inactive')this.recorder.stop();
    this.stream?.getTracks().forEach(track=>track.stop());
    this.recorder=undefined;this.stream=undefined;
  }
}
