//==================== UTILITY FUNCTIONS =================================
export function openJQMPanel(panelId:string) {
  const p:JQuery<HTMLElement> = $(panelId)
  //@ts-ignore //TODO The panel() is not declared, unfortunately, in JQM types, but works fine
  p.panel("open")
}
export function changePage(pageId:string,options?:ChangePageOptions):void {
  $.mobile.changePage(pageId,options)
}
export function setHTMLElementText(id:string, s:string) {
  const e = $(id)
  if(e.length) e.text(s)
  else throw new Error(`No element found with ID ${id}`)
}
export function getHTMLElementVal(id:string):string | undefined {
  const e = $(id)
  if(e.length) return e.val()?.toString()
  else throw new Error(`No element found with ID ${id}`)
}
export function setHTMLElementVal(id:string, s:string):void {
  const e = $(id)
  if(e.length) e.val(s)
  else throw new Error(`No element found with ID ${id}`)
}
export function sleepAsync(ms:number):Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}