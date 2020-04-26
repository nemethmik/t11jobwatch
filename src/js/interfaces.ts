export type IAppData = {
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
  userToBeDeleted?:string | null,
}

export interface IController<UI> {
  ui:UI,
  readonly al: IAppLogic,
}
export interface IPageUI {
  changeTheme(theme:string):void,
}
export interface IAdminSignInPageController extends IController<IAdminSignInPageUI> {
  onSignInAsync(subscriptionNumber?: string, pin?: string): Promise<boolean>,
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

export interface IUsersPageUI extends IPageUI {
  showUsers(userList?:string[]):void,
  showDeleteUserConfirmation(user:string):void,
}
export interface IUsersPageController extends IController<IUsersPageUI>{
  onPageShow():void,
  onDeleteUserClicked(user:string):void,
  onDeleteUserConfirmedAsync(user:string):Promise<void>,
}

export interface IServiceAdmin {
  signInAsync(subscriptionNumber:string,pin:string):Promise<ISubscriptionDetails>,
  deleteUserAsync(user:string):Promise<ISubscriptionDetails>,
}
export type ISubscriptionDetails = {
  error?:IServiceError,
  licenses?:number,
  users?:string[],
  profiles?:IProfileDetails[],
}
export type IProfileDetails = {
  name:string,
  https:boolean,
  hostName:string,
  apiName:string,
  portNumber:number,
  companyDB:string,
  diApiUser:string,
  diUserPassword:string,
}
export type IServiceError = {
  errorCode:number,
  errorText:string,
}
