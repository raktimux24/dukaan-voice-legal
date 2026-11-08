/** Fit the paper inside its actual viewport, after panel padding and borders. */
export function fitDocumentScale(availableWidth:number,paperWidth:number,paperHeight:number,compact=false){
  const widthScale=Math.min(1,Math.max(0,availableWidth)/paperWidth);
  return compact?Math.min(widthScale,210/paperHeight):widthScale;
}
