import type {KeyboardEvent} from 'react';
/** Keep Tab navigation inside the modal on browsers that hand boundary focus to chrome. */
export function productPhotoDialogFocus(event:KeyboardEvent<HTMLDialogElement>){
 if(event.key!=='Tab')return;
 const dialog=event.currentTarget,buttons=[...dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])')].filter(button=>button.getClientRects().length>0);
 const first=buttons[0],last=buttons.at(-1),active=dialog.ownerDocument.activeElement;
 if(!first||!last)return;
 if(event.shiftKey&&active===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&active===last){event.preventDefault();first.focus();}
}
