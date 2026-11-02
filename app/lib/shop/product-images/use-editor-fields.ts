import {useEffect,useRef,useState} from 'react';
import type {createProductImageEditor,ImageEditorState} from './editor';
import type {EditorFields} from './editor-recovery';
/** Restore fields before observing edits, so a blank mount cannot overwrite a recovered draft. */
export function useProductEditorFields<T>(media:{editor:ReturnType<typeof createProductImageEditor<T>>|null;state:ImageEditorState<T>|null},fields:EditorFields,restore:(fields:EditorFields)=>void){
 const observed=useRef<typeof media.editor>(null),serialized=JSON.stringify(fields);
 const [value,setValue]=useState<{editor:typeof media.editor;error:boolean}|null>(null);
 useEffect(()=>{
  if(!media.editor||!media.state?.loaded)return;
  if(observed.current!==media.editor){
   observed.current=media.editor;
   try{if(media.state.fields)restore(media.state.fields);else media.editor.setFields(JSON.parse(serialized));setValue({editor:media.editor,error:false});}
   catch{setValue({editor:media.editor,error:true});}
   return;
  }
  media.editor.setFields(JSON.parse(serialized));
 },[media.editor,media.state?.loaded,serialized]);
 return {ready:!!media.editor&&value?.editor===media.editor&&!value.error,error:!!media.editor&&value?.editor===media.editor&&value.error};
}
