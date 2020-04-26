import {sleepAsync} from "./utils"
import { IAppData, IDataStore, IAppLogic, IServiceAdmin, ISubscriptionDetails } from "./interfaces"
import { AdminSignInPageController, SubscriptionPageController, UsersPageController } from "./controllers"
import { AdminSignInPageUI, SubscriptionPageUI, UsersPageUI, } from "./pages"
// import themeChanger from "./themechanger"

const STOREKEY = "AppData"
class DataStore implements IDataStore {
  saveSubscriptionNumberAndPIN(subscriptionNumber?: string, pin?: string) {
    const data = this.getAppData()
    data.pin = pin
    data.subscriptionNumber = subscriptionNumber
    this.saveAppData(data)
  }
  saveAppData(data: IAppData) {
    localStorage.setItem(STOREKEY, JSON.stringify(data))
  }
  getAppData(): IAppData {
    const v = localStorage.getItem(STOREKEY)
    if (v) {
      const o = JSON.parse(v)
      if (o) return o as IAppData
    }
    return {}
  }
}

/*
When app is loaded, check if there is saved subscription number and user, if there is reload it

When user presses sign in, it tries to connect to firebase service, via authentication 
to find if the service isactive and the PIN is ok, or just use FB authentication.

When page is initialized we create an object from a controller class.
We need two interfaces, one for the screen for commands to show data
An event handler for the application controller to receive events from the page.
These two interfaces formally define the contract between the communication protocol between the UI
and the app logic/controller.
Every UI object is a message dispatcher that is registered its listeners with JQ for the appropriate object.
*/
export class AppLogic implements IAppLogic {
  // private _adminSignIn?: AdminSignInPageUI
  // set adminSignIn(v: AdminSignInPageUI) { this._adminSignIn = v }
  // get adminSignIn(): AdminSignInPageUI { if (this._adminSignIn) return this._adminSignIn; else throw new Error("No AdminSignInPageUI") }
  dataStore: IDataStore = new DataStore()
  serviceAdminApi: IServiceAdmin = new DemoServiceAdminImpl()
  subscriptionDetails: ISubscriptionDetails = {}
  theme: string = "b"
  constructor() {
    this.initTizenHWKeyHandler(this)
    $(document).on("pageinit", (e) => this.onPageInit(e))
    //see https://api.jquerymobile.com/1.4/pagebeforeshow/ It is deprecated and not available in 1.5
    $(document).on("pagebeforeshow", (e) => this.onPageShow(e))
  }
  onPageShow(e: JQuery.TriggeredEvent<Document, undefined, Document, Document>) {
    if (e.target instanceof HTMLElement) {
      const pg = $("#" + e.target.id)
      //@ts-ignore
      if (pg.page("option", "theme") != this.theme) {
        //@ts-ignore //TODO Page theme color swatch is set automatically, see https://api.jquerymobile.com/1.4/page/#option-theme
        pg.page("option", "theme", this.theme)
      }
    }
  }
  onPageInit(e: JQuery.TriggeredEvent<Document, undefined, Document, Document>) {
    if (e.target instanceof HTMLElement) {
      switch (e.target.id) {
        case "adminSignIn":
          new AdminSignInPageUI(e.target, new AdminSignInPageController(this))
          break
        case "subscription":
          new SubscriptionPageUI(e.target, new SubscriptionPageController(this))
          break
        case "users":
          new UsersPageUI(e.target, new UsersPageController(this))
          break
      }
    }
  }
  get areWeOnTizen(): boolean { return window.hasOwnProperty("tizen"); }
  exitApp(): void {
    if (this.isItOkToExit) {
      try {
        //@ts-ignore //TODO to be fixed when have Tizen type definitions
        tizen.application.getCurrentApplication().exit();
      } catch (ignore) {
      }
    }
  }
  get isItOkToExit(): boolean { return true }
  private initTizenHWKeyHandler(al: IAppLogic) {
    // console.log("initTizenHWKeyHandler:", `Are We on Tizen ${al.areWeOnTizen}`)
    if (al.areWeOnTizen) {
      document.addEventListener('tizenhwkey', function (e) {
        //@ts-ignore //TODO to be fixed later
        if (e.keyName == "back" && al.isItOkToExit) al.exitApp()
      });
    }
  }
  get userToBeDeleted():string | null {
    return sessionStorage.getItem("userToBeDeleted")
  }
  set userToBeDeleted(u:string | null) {
    if(u) sessionStorage.setItem("userToBeDeleted",u)
  }
}

class DemoServiceAdminImpl implements IServiceAdmin {
  data: ISubscriptionDetails = {
    licenses: 6,
    users: ["john", "manager", "otto", "jw", "pb"],
    profiles: [
      { name: "Test", https: false, hostName: "botond-pc", apiName: "api", portNumber: 56000, companyDB: "SBODemoUS", diApiUser: "manager", diUserPassword: "123" },
      { name: "Prod", https: false, hostName: "botond-pc", apiName: "api", portNumber: 56000, companyDB: "SBODemoUS", diApiUser: "manager", diUserPassword: "123" },
    ]
  }
  async deleteUserAsync(user:string):Promise<ISubscriptionDetails>{
    if(this.data.users) this.data.users = this.data.users.filter((e) => e != user)
    await sleepAsync(2000)
    return this.data
  }

  async signInAsync(subscriptionNumber: string, pin: string): Promise<ISubscriptionDetails> {
    if (subscriptionNumber.includes("9") && pin) {
      //HTTPS doesn't work on emulator :(, at least not on Mac, but works fine on real device 
      const url = "https://reqres.in/api/users?delay=3"
      try {
        const r = await $.ajax({ method: "GET", url })
        //TODO This is an in-line type definition for fun
        this.data.users = r.data.map((e: { last_name: string }) => e.last_name)
        return this.data          
      } catch (error) {
        return { error: { errorCode: error.status, errorText: `Ajax error ${error.statusText} for URL ${url}` } }        
      }
    } else {
      return { error: { errorCode: 1001, errorText: `Invalid subscription number ${subscriptionNumber} Has no digit 9 or no PIN` } }
    }
  }
}