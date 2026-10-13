import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {BrowserAudioCapture,blobAudio,recordingFileName}=require(process.env.GST_TEST_BUILD+'/browser-audio.js');
assert.equal(recordingFileName('audio/webm;codecs=opus'),'recording.webm');
assert.equal(recordingFileName('audio/mp4'),'recording.m4a');
assert.throws(()=>recordingFileName('video/mpeg'),/unsupported_audio/);
assert.deepEqual(await blobAudio(new Blob(['abc'],{type:'audio/webm'})),{audio:'YWJj',fileName:'recording.webm'});
await assert.rejects(blobAudio(new Blob([],{type:'audio/webm'})),/invalid_audio/);
const savedNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
const savedRecorder=globalThis.MediaRecorder;
const savedTimeout=globalThis.setTimeout,savedClear=globalThis.clearTimeout;
let stopped=0;let instance;let timer;
const stream=()=>({getTracks:()=>[{stop:()=>stopped++}]});
class Recorder {
 static isTypeSupported(mime){return mime.startsWith('audio/webm');}
 constructor(_stream,opts){this.mimeType=opts.mimeType;this.state='inactive';instance=this;}
 start(){this.state='recording';}
 stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['abc'])});this.onstop?.();}
}
const settle=async()=>{await new Promise(resolve=>setImmediate(resolve));};
try {
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async()=>stream()}}});
 globalThis.MediaRecorder=Recorder;
 globalThis.setTimeout=(callback,ms)=>{assert.equal(ms,30000);timer=callback;return 1;};globalThis.clearTimeout=()=>{};
 let output=[],errors=[];
 const capture=new BrowserAudioCapture();
 assert.equal(await capture.start(value=>output.push(value),error=>errors.push(error)),true);
 assert.equal(instance.state,'recording');
 timer();await settle();assert.equal(output.length,1);assert.equal(stopped,1);assert.equal(errors.length,0);
 await capture.start(value=>output.push(value),error=>errors.push(error));capture.cancel();await settle();assert.equal(output.length,1);
 // Navigation while the browser permission prompt is pending releases the late stream.
 let resolvePermission;
 navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>resolvePermission=resolve);
 const pending=capture.start(value=>output.push(value),error=>errors.push(error));capture.cancel();resolvePermission(stream());
 assert.equal(await pending,false);await settle();assert.equal(output.length,1);
 navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('denied','NotAllowedError');};
 await assert.rejects(capture.start(()=>{},()=>{}),error=>error.name==='NotAllowedError');
 console.log('Browser audio: MIME/base64, 30-second stop, cancellation, pending permission cleanup and denial passed.');
}finally{
 if(savedNavigator)Object.defineProperty(globalThis,'navigator',savedNavigator);else delete globalThis.navigator;
 globalThis.MediaRecorder=savedRecorder;globalThis.setTimeout=savedTimeout;globalThis.clearTimeout=savedClear;
}
