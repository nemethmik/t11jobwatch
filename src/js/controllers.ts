import {
  IAppData, IAdminSignInPageUI, IAdminSignInPageController, IAppLogic,
  ISubscriptioPageController, ISubscriptionPageUI,
  IUsersPageController, IUsersPageUI,
} from "./interfaces"
export class Controller<UI> {
  readonly al: IAppLogic
  constructor(al: IAppLogic) { this.al = al }
  private _ui?: UI
  set ui(v: UI) { this._ui = v }
  get ui(): UI { if (this._ui) return this._ui; else throw new Error("UI not defined for controller") }
}

export class AdminSignInPageController extends Controller<IAdminSignInPageUI> implements IAdminSignInPageController {
  constructor(al: IAppLogic) { super(al) }
  onExit(): void {
    this.al.exitApp()
  }
  async onSignInAsync(subscriptionNumber?: string, pin?: string): Promise<boolean> {
    this.al.dataStore.saveSubscriptionNumberAndPIN(subscriptionNumber, pin)
    if (subscriptionNumber && pin) {
      this.al.subscriptionDetails = await this.al.serviceAdminApi.signInAsync(subscriptionNumber, pin)
      if (this.al.subscriptionDetails.error) {
        this.ui.showMessageOnPanel(this.al.subscriptionDetails.error.errorText)
        return false
      } else {
        //The details are in the app logic for next screen
        return true
      }
    } else {
      this.ui.showMessageOnPanel(`No subscription number (${subscriptionNumber}) or PIN (${pin}) defined`)
      return false
    }
  }
  onPageShow() {
    const appData: IAppData = this.al.dataStore.getAppData()
    // Retrieve saved subscription number and PIN from local store
    if (appData.subscriptionNumber) this.ui.setSubscriptionNumber(appData.subscriptionNumber)
    if (!this.al.areWeOnTizen) this.ui.hideExit()
    console.log("Admin SignIn Page shown")
  }
  onTheme(th: string): void {
    this.al.theme = th
    this.ui.setTheme(th)
  }
}

export class SubscriptionPageController extends Controller<ISubscriptionPageUI> implements ISubscriptioPageController {
  constructor(al: IAppLogic) { super(al) }
  onPageShow() {
    this.ui.showSubscriptionDetails(this.al.subscriptionDetails)
    console.log("Subscription Page shown")
  }
}

export class UsersPageController extends Controller<IUsersPageUI> implements IUsersPageController {
  constructor(al: IAppLogic) { super(al) }
  onPageShow() {
    this.ui.showUsers(this.al.subscriptionDetails.users)
  }
  onDeleteUserClicked(user:string):void {
    this.al.userToBeDeleted = user
    this.ui.showDeleteUserConfirmation(user)
  }
  //@ts-ignore //TODO To implement user deletion
  async onDeleteUserConfirmedAsync(user:string){
    const details = await this.al.serviceAdminApi.deleteUserAsync(user)
    this.ui.showUsers(details.users) //To show the results of the deletion or other intermittent database changes
  }
}