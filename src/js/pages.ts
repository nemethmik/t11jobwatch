import {IAdminSignInPageUI,IAdminSignInPageController,openJQMPanel,
  setHTMLElementText,getHTMLElementVal,setHTMLElementVal,IController,IPageUI,
  ISubscriptionDetails,ISubscriptionPageUI,ISubscriptioPageController} from "./interfaces"

export class PageUI<CTR extends IController<IPageUI>> {
  private readonly _page: HTMLElement
  private readonly _ctrl: CTR
  get page(): HTMLElement { return this._page }
  get ctrl():CTR {if(this._ctrl) return this._ctrl; else throw new Error("No Controller defined for UI object")}
  constructor(page: HTMLElement, ctrl: CTR) {
    this._page = page
    this._ctrl = ctrl
    this._ctrl.ui = this // This is terribly important to pass the UI object to the controller
  }
}  

export class AdminSignInPageUI extends PageUI<IAdminSignInPageController>  implements IAdminSignInPageUI{
  constructor(page: HTMLElement, ctrl: IAdminSignInPageController) {
    super(page,ctrl)
    $("#signIn").on("click", (/*e*/) => {
      //e.preventDefault() // This is another way to block default HTML handling
      return this.ctrl.onSignIn(
        getHTMLElementVal("#subscriptionNumber"), 
        getHTMLElementVal("#pin")) 
    })
    $(page).on("pagebeforeshow",() => { //Deprecated as of 1.4.0, Hmmm
      this.ctrl.onPageShow()
    })
    $("#exit").on("click", (/*e*/) => {
      //e.preventDefault() // This is another way to block default HTML handling
      return this.ctrl.onExit() 
    })
    $("#themeA").on("click", () => {this.ctrl.onTheme("a")})
    $("#themeB").on("click", () => {this.ctrl.onTheme("b")})
    $("#themeC").on("click", () => {this.ctrl.onTheme("c")})
    console.log("AdminSignInPageUI constructed")
  }
  setSubscriptionNumber(n:string) {
    setHTMLElementVal("#subscriptionNumber",n)
  }
  showMessageOnPanel(msg:string) {
    setHTMLElementText("#adminSignInMessage",msg)
    // $.mobile.changePage("#adminSignInPanel") // This won't work with panels see https://api.jquerymobile.com/panel/
    openJQMPanel("#adminSignInPanel")
    //$( "#mypanel" ).trigger( "updatelayout" ) //Maybe this is required, too
  }
  hideExit():void {
    $("#exit").hide()
  }
}

export class SubscriptionPageUI extends PageUI<ISubscriptioPageController> implements ISubscriptionPageUI{
  constructor(page: HTMLElement, ctrl: ISubscriptioPageController) {
    super(page,ctrl)
    $(page).on("pagebeforeshow",() => { //Deprecated as of 1.4.0, Hmmm
      this.ctrl.onPageShow()
    })
  }
  showSubscriptionDetails(details:ISubscriptionDetails):void{
    setHTMLElementText("#numberOflicenses","" + details.licenses)
    setHTMLElementText("#numberOfUsers","" + details.users?.length)
    setHTMLElementText("#numberOfProfiles","" + details.profiles?.length)
  }
}

