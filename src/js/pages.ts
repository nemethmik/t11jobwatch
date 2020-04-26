import {openJQMPanel, changePage,
  setHTMLElementText, getHTMLElementVal, setHTMLElementVal, } from "./utils"
import {updateThemeOnActivePage} from "./themechanger"
import {
  IAdminSignInPageUI, IAdminSignInPageController, IController, IPageUI,
  ISubscriptionDetails, ISubscriptionPageUI, ISubscriptioPageController,
  IUsersPageController, IUsersPageUI,
} from "./interfaces"

export class PageUI<CTR extends IController<IPageUI>> implements IPageUI {
  private readonly _page: HTMLElement
  private readonly _ctrl: CTR
  get page(): HTMLElement { return this._page }
  get ctrl(): CTR { if (this._ctrl) return this._ctrl; else throw new Error("No Controller defined for UI object") }
  constructor(page: HTMLElement, ctrl: CTR) {
    this._page = page
    this._ctrl = ctrl
    this._ctrl.ui = this // This is terribly important to pass the UI object to the controller
  }
  changeTheme(theme: string) {
    //ts-ignore //TODO see https://api.jquerymobile.com/1.4/page/#option-theme
    // $("#" + this.page.id).page("option", "theme", theme)
    updateThemeOnActivePage(theme)
  }
  showLoadingIndicator() {
    $.mobile.loading("show", { text: "Loading...", textVisible: true, theme: "b", });
  }
  hideLoadingIndicator() { $.mobile.loading("hide") }
}

export class AdminSignInPageUI extends PageUI<IAdminSignInPageController> implements IAdminSignInPageUI {
  constructor(page: HTMLElement, ctrl: IAdminSignInPageController) {
    super(page, ctrl)
    $("#signIn").on("click", async (e) => {
      // This function can be declared async but the browser handler will not block
      // the execution of the code. So when working with async calls
      // The navigation to the next page has to be done manually
      e.preventDefault() // This is another way to block default HTML handling
      try {
        this.showLoadingIndicator()
        if (await this.ctrl.onSignInAsync(
          getHTMLElementVal("#subscriptionNumber"),
          getHTMLElementVal("#pin"))) {
          // <a href="#subscription" data-transition="slide" data-role="button" id="signIn">Sign In</a>
          changePage("#subscription", { transition: "slide" })
        }
      } finally {
        this.hideLoadingIndicator()
      }
    })
    $(page).on("pagebeforeshow", () => { //Deprecated as of 1.4.0, Hmmm
      this.ctrl.onPageShow()
    })
    $("#exit").on("click", (/*e*/) => {
      //e.preventDefault() // This is another way to block default HTML handling
      return this.ctrl.onExit()
    })
    $("#themeA").on("click", () => { this.ctrl.onTheme("a") })
    $("#themeB").on("click", () => { this.ctrl.onTheme("b") })
    $("#themeC").on("click", () => { this.ctrl.onTheme("c") })
    console.log("AdminSignInPageUI constructed")
  }
  setSubscriptionNumber(n: string) {
    setHTMLElementVal("#subscriptionNumber", n)
  }
  showMessageOnPanel(msg: string) {
    setHTMLElementText("#adminSignInMessage", msg)
    // $.mobile.changePage("#adminSignInPanel") // This won't work with panels see https://api.jquerymobile.com/panel/
    openJQMPanel("#adminSignInPanel")
    //$( "#mypanel" ).trigger( "updatelayout" ) //Maybe this is required, too
  }
  hideExit(): void {
    $("#exit").hide()
  }
}

export class SubscriptionPageUI extends PageUI<ISubscriptioPageController> implements ISubscriptionPageUI {
  constructor(page: HTMLElement, ctrl: ISubscriptioPageController) {
    super(page, ctrl)
    $(page).on("pagebeforeshow", () => { //Deprecated as of 1.4.0, Hmmm
      this.ctrl.onPageShow()
    })
  }
  showSubscriptionDetails(details: ISubscriptionDetails): void {
    setHTMLElementText("#numberOflicenses", "" + details.licenses)
    setHTMLElementText("#numberOfUsers", "" + details.users?.length)
    setHTMLElementText("#numberOfProfiles", "" + details.profiles?.length)
  }
}

export class UsersPageUI extends PageUI<IUsersPageController> implements IUsersPageUI {
  constructor(page: HTMLElement, ctrl: IUsersPageController) {
    super(page, ctrl)
    $(page).on("pagebeforeshow", () => { this.ctrl.onPageShow() })
    $("#userList").on("click", (e) => { //Always use fat arrow to get proper this handling
      console.log("user list click for ", e)
      // $("#userToDelete").text(e.target.text)
      //@ts-ignore //TODO We are sure it works since we have defined data-user-id for each users added to the list
      // $("#userToDelete").text(e.target.dataset.userId)
      this.ctrl.onDeleteUserClicked(e.target.dataset.userId)
    })
    $("#userDeletionConfirmed").on("click", async (/*e*/) => { //Always use fat arrow to get proper this handling
      // e.preventDefault() // No need to block default HTML handling, it's fine that the confirmation panel is automatically closed
      try {
        this.showLoadingIndicator()
        if (this.ctrl.al.userToBeDeleted) {
          await this.ctrl.onDeleteUserConfirmedAsync(this.ctrl.al.userToBeDeleted)
        }
      } finally {
        this.hideLoadingIndicator()
      }
    })
  }
  showUsers(userList: string[]): void {
    const usersHtml = userList.reduce((a, u) => a += `
    <li data-icon="delete"><a href="#deleteUser" data-rel="popup" data-position-to="window" data-transition="pop"
          data-user-id="${u}">${u}</a>
    </li>      
    `, "")
    $("#userList").html(usersHtml).listview("refresh")
  }
  showDeleteUserConfirmation(user: string): void {
    $("#userToDelete").text(user)
    //The confirmation dialog is automatically opened since the LI elements all have the href=#deleteUser
  }

}
