import { KokoroTTS } from 'kokoro-js';
import { env } from '@huggingface/transformers';
env.allowLocalModels=false;
env.backends.onnx.wasm.wasmPaths='/assets/natural-voice/';
env.backends.onnx.wasm.numThreads=1;
let model,queue=Promise.resolve(),latest=0;
async function run(data){
  const {id,text,voice}=data;
  try{
    if(id<latest)return;
    model ||= KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{
      dtype:'q8',device:'wasm',progress_callback:p=>self.postMessage({id,type:'progress',progress:p.progress,status:p.status})
    }).catch(e=>{model=null;throw e});
    const tts=await model;
    const audio=await tts.generate(text,{voice:voice==='uk'?'bf_emma':'af_heart',speed:1});
    const blob=audio.toBlob();
    self.postMessage({id,type:'audio',blob});
  }catch(e){self.postMessage({id,type:'error',message:'Natural voice could not load. Try again or choose device voice.'})}
}
self.onmessage=({data})=>{if(data.cancel){latest=data.cancel;return}queue=queue.then(()=>run(data));};
