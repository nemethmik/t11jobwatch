export interface IAppData {
  subscriptionNumber?:string,
  pin?:string,
  theme?:string,
}
export interface IDataStore {
  saveSubscriptionNumberAndPIN(subscriptionNumber?:string,pin?:string):void,
  saveAppData(data:IAppData):void,
  getAppData():IAppData,
}
export interface IAppLogic {
  dataStore:IDataStore,
  serviceAdminApi:IServiceAdmin,
  subscriptionDetails:ISubscriptionDetails,
  areWeOnTizen:boolean,
  theme:string,
  exitApp():void,
}

export interface IController<UI> {
  ui:UI,
}
export interface IPageUI {}
export interface IAdminSignInPageController extends IController<IAdminSignInPageUI> {
  onSignIn(subscriptionNumber?: string, pin?: string): boolean,
  onPageShow():void,
  onExit():void,
  onTheme(th:string):void,
}
export interface IAdminSignInPageUI extends IPageUI {
  setSubscriptionNumber(n:string):void,
  showMessageOnPanel(msg:string):void,
  hideExit():void,
}
export interface ISubscriptionPageUI extends IPageUI {
  showSubscriptionDetails(details:ISubscriptionDetails):void,
}
export interface ISubscriptioPageController extends IController<ISubscriptionPageUI>{
  onPageShow():void,
}

export interface IServiceAdmin {
  signIn(subscriptionNumber:string,pin:string):ISubscriptionDetails,
}
export interface ISubscriptionDetails {
  error?:IServiceError,
  licenses?:number,
  users?:string[],
  profiles?:IProfileDetails[],
}
export interface IProfileDetails {
  name:string,
  https:boolean,
  hostName:string,
  apiName:string,
  portNumber:number,
  companyDB:string,
  diApiUser:string,
  diUserPassword:string,
}
export interface IServiceError {
  errorCode:number,
  errorText:string,
}
//==================== UTILITY FUNCTIONS =================================
export function openJQMPanel(panelId:string) {
  const p:JQuery<HTMLElement> = $(panelId)
  //@ts-ignore //TODO The panel() is not declared, unfortunately, in JQM types, but works fine
  p.panel("open")
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