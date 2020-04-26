(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const controllers_1 = require("./controllers");
const pages_1 = require("./pages");
// import themeChanger from "./themechanger"
const STOREKEY = "AppData";
class DataStore {
    saveSubscriptionNumberAndPIN(subscriptionNumber, pin) {
        const data = this.getAppData();
        data.pin = pin;
        data.subscriptionNumber = subscriptionNumber;
        this.saveAppData(data);
    }
    saveAppData(data) {
        localStorage.setItem(STOREKEY, JSON.stringify(data));
    }
    getAppData() {
        const v = localStorage.getItem(STOREKEY);
        if (v) {
            const o = JSON.parse(v);
            if (o)
                return o;
        }
        return {};
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
class AppLogic {
    constructor() {
        // private _adminSignIn?: AdminSignInPageUI
        // set adminSignIn(v: AdminSignInPageUI) { this._adminSignIn = v }
        // get adminSignIn(): AdminSignInPageUI { if (this._adminSignIn) return this._adminSignIn; else throw new Error("No AdminSignInPageUI") }
        this.dataStore = new DataStore();
        this.serviceAdminApi = new DemoServiceAdminImpl();
        this.subscriptionDetails = {};
        this.theme = "b";
        this.initTizenHWKeyHandler(this);
        $(document).on("pageinit", (e) => this.onPageInit(e));
        //see https://api.jquerymobile.com/1.4/pagebeforeshow/ It is deprecated and not available in 1.5
        $(document).on("pagebeforeshow", (e) => this.onPageShow(e));
    }
    onPageShow(e) {
        if (e.target instanceof HTMLElement) {
            const pg = $("#" + e.target.id);
            //@ts-ignore
            if (pg.page("option", "theme") != this.theme) {
                //@ts-ignore //TODO Page theme color swatch is set automatically, see https://api.jquerymobile.com/1.4/page/#option-theme
                pg.page("option", "theme", this.theme);
            }
        }
    }
    onPageInit(e) {
        if (e.target instanceof HTMLElement) {
            switch (e.target.id) {
                case "adminSignIn":
                    new pages_1.AdminSignInPageUI(e.target, new controllers_1.AdminSignInPageController(this));
                    break;
                case "subscription":
                    new pages_1.SubscriptionPageUI(e.target, new controllers_1.SubscriptionPageController(this));
                    break;
                case "users":
                    new pages_1.UsersPageUI(e.target, new controllers_1.UsersPageController(this));
                    break;
            }
        }
    }
    get areWeOnTizen() { return window.hasOwnProperty("tizen"); }
    exitApp() {
        if (this.isItOkToExit) {
            try {
                //@ts-ignore //TODO to be fixed when have Tizen type definitions
                tizen.application.getCurrentApplication().exit();
            }
            catch (ignore) {
            }
        }
    }
    get isItOkToExit() { return true; }
    initTizenHWKeyHandler(al) {
        // console.log("initTizenHWKeyHandler:", `Are We on Tizen ${al.areWeOnTizen}`)
        if (al.areWeOnTizen) {
            document.addEventListener('tizenhwkey', function (e) {
                //@ts-ignore //TODO to be fixed later
                if (e.keyName == "back" && al.isItOkToExit)
                    al.exitApp();
            });
        }
    }
    get userToBeDeleted() {
        return sessionStorage.getItem("userToBeDeleted");
    }
    set userToBeDeleted(u) {
        if (u)
            sessionStorage.setItem("userToBeDeleted", u);
    }
}
exports.AppLogic = AppLogic;
class DemoServiceAdminImpl {
    constructor() {
        this.data = {
            licenses: 6,
            users: ["john", "manager", "otto", "jw", "pb"],
            profiles: [
                { name: "Test", https: false, hostName: "botond-pc", apiName: "api", portNumber: 56000, companyDB: "SBODemoUS", diApiUser: "manager", diUserPassword: "123" },
                { name: "Prod", https: false, hostName: "botond-pc", apiName: "api", portNumber: 56000, companyDB: "SBODemoUS", diApiUser: "manager", diUserPassword: "123" },
            ]
        };
    }
    async deleteUserAsync(user) {
        if (this.data.users)
            this.data.users = this.data.users.filter((e) => e != user);
        await utils_1.sleepAsync(2000);
        return this.data;
    }
    async signInAsync(subscriptionNumber, pin) {
        if (subscriptionNumber.includes("9") && pin) {
            //HTTPS doesn't work on emulator :(, at least not on Mac, but works fine on real device 
            const url = "https://reqres.in/api/users?delay=3";
            try {
                const r = await $.ajax({ method: "GET", url });
                this.data.users = r.data.map((e) => e.last_name);
                return this.data;
            }
            catch (error) {
                return { error: { errorCode: error.status, errorText: `Ajax error ${error.statusText} for URL ${url}` } };
            }
        }
        else {
            return { error: { errorCode: 1001, errorText: `Invalid subscription number ${subscriptionNumber} Has no digit 9 or no PIN` } };
        }
    }
}

},{"./controllers":2,"./pages":4,"./utils":5}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Controller {
    constructor(al) { this.al = al; }
    set ui(v) { this._ui = v; }
    get ui() { if (this._ui)
        return this._ui;
    else
        throw new Error("UI not defined for controller"); }
}
exports.Controller = Controller;
class AdminSignInPageController extends Controller {
    constructor(al) { super(al); }
    onExit() {
        this.al.exitApp();
    }
    async onSignInAsync(subscriptionNumber, pin) {
        this.al.dataStore.saveSubscriptionNumberAndPIN(subscriptionNumber, pin);
        if (subscriptionNumber && pin) {
            this.al.subscriptionDetails = await this.al.serviceAdminApi.signInAsync(subscriptionNumber, pin);
            if (this.al.subscriptionDetails.error) {
                this.ui.showMessageOnPanel(this.al.subscriptionDetails.error.errorText);
                return false;
            }
            else {
                //The details are in the app logic for next screen
                return true;
            }
        }
        else {
            this.ui.showMessageOnPanel(`No subscription number (${subscriptionNumber}) or PIN (${pin}) defined`);
            return false;
        }
    }
    onPageShow() {
        const appData = this.al.dataStore.getAppData();
        // Retrieve saved subscription number and PIN from local store
        if (appData.subscriptionNumber)
            this.ui.setSubscriptionNumber(appData.subscriptionNumber);
        if (!this.al.areWeOnTizen)
            this.ui.hideExit();
        console.log("Admin SignIn Page shown");
    }
    onTheme(th) {
        this.al.theme = th;
        this.ui.setTheme(th);
    }
}
exports.AdminSignInPageController = AdminSignInPageController;
class SubscriptionPageController extends Controller {
    constructor(al) { super(al); }
    onPageShow() {
        this.ui.showSubscriptionDetails(this.al.subscriptionDetails);
        console.log("Subscription Page shown");
    }
}
exports.SubscriptionPageController = SubscriptionPageController;
class UsersPageController extends Controller {
    constructor(al) { super(al); }
    onPageShow() {
        this.ui.showUsers(this.al.subscriptionDetails.users);
    }
    onDeleteUserClicked(user) {
        this.al.userToBeDeleted = user;
        this.ui.showDeleteUserConfirmation(user);
    }
    //@ts-ignore //TODO To implement user deletion
    async onDeleteUserConfirmedAsync(user) {
        const details = await this.al.serviceAdminApi.deleteUserAsync(user);
        this.ui.showUsers(details.users); //To show the results of the deletion or other intermittent database changes
    }
}
exports.UsersPageController = UsersPageController;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const applogic_1 = require("./applogic");
new applogic_1.AppLogic();

},{"./applogic":1}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class PageUI {
    constructor(page, ctrl) {
        this._page = page;
        this._ctrl = ctrl;
        this._ctrl.ui = this; // This is terribly important to pass the UI object to the controller
    }
    get page() { return this._page; }
    get ctrl() { if (this._ctrl)
        return this._ctrl;
    else
        throw new Error("No Controller defined for UI object"); }
    setTheme(theme) {
        //@ts-ignore //TODO see https://api.jquerymobile.com/1.4/page/#option-theme
        $("#" + this.page.id).page("option", "theme", theme);
    }
    showLoadingIndicator() {
        $.mobile.loading("show", { text: "Loading...", textVisible: true, theme: "b", });
    }
    hideLoadingIndicator() { $.mobile.loading("hide"); }
}
exports.PageUI = PageUI;
class AdminSignInPageUI extends PageUI {
    constructor(page, ctrl) {
        super(page, ctrl);
        $("#signIn").on("click", async (e) => {
            // This function can be declared async but the browser handler will not block
            // the execution of the code. So when working with async calls
            // The navigation to the next page has to be done manually
            e.preventDefault(); // This is another way to block default HTML handling
            try {
                this.showLoadingIndicator();
                if (await this.ctrl.onSignInAsync(utils_1.getHTMLElementVal("#subscriptionNumber"), utils_1.getHTMLElementVal("#pin"))) {
                    // <a href="#subscription" data-transition="slide" data-role="button" id="signIn">Sign In</a>
                    utils_1.changePage("#subscription", { transition: "slide" });
                }
            }
            finally {
                this.hideLoadingIndicator();
            }
        });
        $(page).on("pagebeforeshow", () => {
            this.ctrl.onPageShow();
        });
        $("#exit").on("click", ( /*e*/) => {
            //e.preventDefault() // This is another way to block default HTML handling
            return this.ctrl.onExit();
        });
        $("#themeA").on("click", () => { this.ctrl.onTheme("a"); });
        $("#themeB").on("click", () => { this.ctrl.onTheme("b"); });
        $("#themeC").on("click", () => { this.ctrl.onTheme("c"); });
        console.log("AdminSignInPageUI constructed");
    }
    setSubscriptionNumber(n) {
        utils_1.setHTMLElementVal("#subscriptionNumber", n);
    }
    showMessageOnPanel(msg) {
        utils_1.setHTMLElementText("#adminSignInMessage", msg);
        // $.mobile.changePage("#adminSignInPanel") // This won't work with panels see https://api.jquerymobile.com/panel/
        utils_1.openJQMPanel("#adminSignInPanel");
        //$( "#mypanel" ).trigger( "updatelayout" ) //Maybe this is required, too
    }
    hideExit() {
        $("#exit").hide();
    }
}
exports.AdminSignInPageUI = AdminSignInPageUI;
class SubscriptionPageUI extends PageUI {
    constructor(page, ctrl) {
        super(page, ctrl);
        $(page).on("pagebeforeshow", () => {
            this.ctrl.onPageShow();
        });
    }
    showSubscriptionDetails(details) {
        var _a, _b;
        utils_1.setHTMLElementText("#numberOflicenses", "" + details.licenses);
        utils_1.setHTMLElementText("#numberOfUsers", "" + ((_a = details.users) === null || _a === void 0 ? void 0 : _a.length));
        utils_1.setHTMLElementText("#numberOfProfiles", "" + ((_b = details.profiles) === null || _b === void 0 ? void 0 : _b.length));
    }
}
exports.SubscriptionPageUI = SubscriptionPageUI;
class UsersPageUI extends PageUI {
    constructor(page, ctrl) {
        super(page, ctrl);
        $(page).on("pagebeforeshow", () => { this.ctrl.onPageShow(); });
        $("#userList").on("click", (e) => {
            console.log("user list click for ", e);
            // $("#userToDelete").text(e.target.text)
            //@ts-ignore //TODO We are sure it works since we have defined data-user-id for each users added to the list
            // $("#userToDelete").text(e.target.dataset.userId)
            this.ctrl.onDeleteUserClicked(e.target.dataset.userId);
        });
        $("#userDeletionConfirmed").on("click", async ( /*e*/) => {
            // e.preventDefault() // No need to block default HTML handling, it's fine that the confirmation panel is automatically closed
            try {
                this.showLoadingIndicator();
                if (this.ctrl.al.userToBeDeleted) {
                    await this.ctrl.onDeleteUserConfirmedAsync(this.ctrl.al.userToBeDeleted);
                }
            }
            finally {
                this.hideLoadingIndicator();
            }
        });
    }
    showUsers(userList) {
        const usersHtml = userList.reduce((a, u) => a += `
    <li data-icon="delete"><a href="#deleteUser" data-rel="popup" data-position-to="window" data-transition="pop"
          data-user-id="${u}">${u}</a>
    </li>      
    `, "");
        $("#userList").html(usersHtml).listview("refresh");
    }
    showDeleteUserConfirmation(user) {
        $("#userToDelete").text(user);
        //The confirmation dialog is automatically opened since the LI elements all have the href=#deleteUser
    }
}
exports.UsersPageUI = UsersPageUI;

},{"./utils":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//==================== UTILITY FUNCTIONS =================================
function openJQMPanel(panelId) {
    const p = $(panelId);
    //@ts-ignore //TODO The panel() is not declared, unfortunately, in JQM types, but works fine
    p.panel("open");
}
exports.openJQMPanel = openJQMPanel;
function changePage(pageId, options) {
    $.mobile.changePage(pageId, options);
}
exports.changePage = changePage;
function setHTMLElementText(id, s) {
    const e = $(id);
    if (e.length)
        e.text(s);
    else
        throw new Error(`No element found with ID ${id}`);
}
exports.setHTMLElementText = setHTMLElementText;
function getHTMLElementVal(id) {
    var _a;
    const e = $(id);
    if (e.length)
        return (_a = e.val()) === null || _a === void 0 ? void 0 : _a.toString();
    else
        throw new Error(`No element found with ID ${id}`);
}
exports.getHTMLElementVal = getHTMLElementVal;
function setHTMLElementVal(id, s) {
    const e = $(id);
    if (e.length)
        e.val(s);
    else
        throw new Error(`No element found with ID ${id}`);
}
exports.setHTMLElementVal = setHTMLElementVal;
function sleepAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleepAsync = sleepAsync;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwbG9naWMudHMiLCJzcmMvanMvY29udHJvbGxlcnMudHMiLCJzcmMvanMvbWFpbi50cyIsInNyYy9qcy9wYWdlcy50cyIsInNyYy9qcy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsbUNBQWtDO0FBRWxDLCtDQUEwRztBQUMxRyxtQ0FBNkU7QUFDN0UsNENBQTRDO0FBRTVDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQTtBQUMxQixNQUFNLFNBQVM7SUFDYiw0QkFBNEIsQ0FBQyxrQkFBMkIsRUFBRSxHQUFZO1FBQ3BFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQTtRQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3hCLENBQUM7SUFDRCxXQUFXLENBQUMsSUFBYztRQUN4QixZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDdEQsQ0FBQztJQUNELFVBQVU7UUFDUixNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3hDLElBQUksQ0FBQyxFQUFFO1lBQ0wsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUN2QixJQUFJLENBQUM7Z0JBQUUsT0FBTyxDQUFhLENBQUE7U0FDNUI7UUFDRCxPQUFPLEVBQUUsQ0FBQTtJQUNYLENBQUM7Q0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7RUFZRTtBQUNGLE1BQWEsUUFBUTtJQVFuQjtRQVBBLDJDQUEyQztRQUMzQyxrRUFBa0U7UUFDbEUseUlB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QUMsRUFBUztJQUNsQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFGRCxnQ0FFQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7c2xlZXBBc3luY30gZnJvbSBcIi4vdXRpbHNcIlxuaW1wb3J0IHsgSUFwcERhdGEsIElEYXRhU3RvcmUsIElBcHBMb2dpYywgSVNlcnZpY2VBZG1pbiwgSVN1YnNjcmlwdGlvbkRldGFpbHMgfSBmcm9tIFwiLi9pbnRlcmZhY2VzXCJcbmltcG9ydCB7IEFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIsIFN1YnNjcmlwdGlvblBhZ2VDb250cm9sbGVyLCBVc2Vyc1BhZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vY29udHJvbGxlcnNcIlxuaW1wb3J0IHsgQWRtaW5TaWduSW5QYWdlVUksIFN1YnNjcmlwdGlvblBhZ2VVSSwgVXNlcnNQYWdlVUksIH0gZnJvbSBcIi4vcGFnZXNcIlxuLy8gaW1wb3J0IHRoZW1lQ2hhbmdlciBmcm9tIFwiLi90aGVtZWNoYW5nZXJcIlxuXG5jb25zdCBTVE9SRUtFWSA9IFwiQXBwRGF0YVwiXG5jbGFzcyBEYXRhU3RvcmUgaW1wbGVtZW50cyBJRGF0YVN0b3JlIHtcbiAgc2F2ZVN1YnNjcmlwdGlvbk51bWJlckFuZFBJTihzdWJzY3JpcHRpb25OdW1iZXI/OiBzdHJpbmcsIHBpbj86IHN0cmluZykge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldEFwcERhdGEoKVxuICAgIGRhdGEucGluID0gcGluXG4gICAgZGF0YS5zdWJzY3JpcHRpb25OdW1iZXIgPSBzdWJzY3JpcHRpb25OdW1iZXJcbiAgICB0aGlzLnNhdmVBcHBEYXRhKGRhdGEpXG4gIH1cbiAgc2F2ZUFwcERhdGEoZGF0YTogSUFwcERhdGEpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTVE9SRUtFWSwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gIH1cbiAgZ2V0QXBwRGF0YSgpOiBJQXBwRGF0YSB7XG4gICAgY29uc3QgdiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNUT1JFS0VZKVxuICAgIGlmICh2KSB7XG4gICAgICBjb25zdCBvID0gSlNPTi5wYXJzZSh2KVxuICAgICAgaWYgKG8pIHJldHVybiBvIGFzIElBcHBEYXRhXG4gICAgfVxuICAgIHJldHVybiB7fVxuICB9XG59XG5cbi8qXG5XaGVuIGFwcCBpcyBsb2FkZWQsIGNoZWNrIGlmIHRoZXJlIGlzIHNhdmVkIHN1YnNjcmlwdGlvbiBudW1iZXIgYW5kIHVzZXIsIGlmIHRoZXJlIGlzIHJlbG9hZCBpdFxuXG5XaGVuIHVzZXIgcHJlc3NlcyBzaWduIGluLCBpdCB0cmllcyB0byBjb25uZWN0IHRvIGZpcmViYXNlIHNlcnZpY2UsIHZpYSBhdXRoZW50aWNhdGlvbiBcbnRvIGZpbmQgaWYgdGhlIHNlcnZpY2UgaXNhY3RpdmUgYW5kIHRoZSBQSU4gaXMgb2ssIG9yIGp1c3QgdXNlIEZCIGF1dGhlbnRpY2F0aW9uLlxuXG5XaGVuIHBhZ2UgaXMgaW5pdGlhbGl6ZWQgd2UgY3JlYXRlIGFuIG9iamVjdCBmcm9tIGEgY29udHJvbGxlciBjbGFzcy5cbldlIG5lZWQgdHdvIGludGVyZmFjZXMsIG9uZSBmb3IgdGhlIHNjcmVlbiBmb3IgY29tbWFuZHMgdG8gc2hvdyBkYXRhXG5BbiBldmVudCBoYW5kbGVyIGZvciB0aGUgYXBwbGljYXRpb24gY29udHJvbGxlciB0byByZWNlaXZlIGV2ZW50cyBmcm9tIHRoZSBwYWdlLlxuVGhlc2UgdHdvIGludGVyZmFjZXMgZm9ybWFsbHkgZGVmaW5lIHRoZSBjb250cmFjdCBiZXR3ZWVuIHRoZSBjb21tdW5pY2F0aW9uIHByb3RvY29sIGJldHdlZW4gdGhlIFVJXG5hbmQgdGhlIGFwcCBsb2dpYy9jb250cm9sbGVyLlxuRXZlcnkgVUkgb2JqZWN0IGlzIGEgbWVzc2FnZSBkaXNwYXRjaGVyIHRoYXQgaXMgcmVnaXN0ZXJlZCBpdHMgbGlzdGVuZXJzIHdpdGggSlEgZm9yIHRoZSBhcHByb3ByaWF0ZSBvYmplY3QuXG4qL1xuZXhwb3J0IGNsYXNzIEFwcExvZ2ljIGltcGxlbWVudHMgSUFwcExvZ2ljIHtcbiAgLy8gcHJpdmF0ZSBfYWRtaW5TaWduSW4/OiBBZG1pblNpZ25JblBhZ2VVSVxuICAvLyBzZXQgYWRtaW5TaWduSW4odjogQWRtaW5TaWduSW5QYWdlVUkpIHsgdGhpcy5fYWRtaW5TaWduSW4gPSB2IH1cbiAgLy8gZ2V0IGFkbWluU2lnbkluKCk6IEFkbWluU2lnbkluUGFnZVVJIHsgaWYgKHRoaXMuX2FkbWluU2lnbkluKSByZXR1cm4gdGhpcy5fYWRtaW5TaWduSW47IGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiTm8gQWRtaW5TaWduSW5QYWdlVUlcIikgfVxuICBkYXRhU3RvcmU6IElEYXRhU3RvcmUgPSBuZXcgRGF0YVN0b3JlKClcbiAgc2VydmljZUFkbWluQXBpOiBJU2VydmljZUFkbWluID0gbmV3IERlbW9TZXJ2aWNlQWRtaW5JbXBsKClcbiAgc3Vic2NyaXB0aW9uRGV0YWlsczogSVN1YnNjcmlwdGlvbkRldGFpbHMgPSB7fVxuICB0aGVtZTogc3RyaW5nID0gXCJiXCJcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0VGl6ZW5IV0tleUhhbmRsZXIodGhpcylcbiAgICAkKGRvY3VtZW50KS5vbihcInBhZ2Vpbml0XCIsIChlKSA9PiB0aGlzLm9uUGFnZUluaXQoZSkpXG4gICAgLy9zZWUgaHR0cHM6Ly9hcGkuanF1ZXJ5bW9iaWxlLmNvbS8xLjQvcGFnZWJlZm9yZXNob3cvIEl0IGlzIGRlcHJlY2F0ZWQgYW5kIG5vdCBhdmFpbGFibGUgaW4gMS41XG4gICAgJChkb2N1bWVudCkub24oXCJwYWdlYmVmb3Jlc2hvd1wiLCAoZSkgPT4gdGhpcy5vblBhZ2VTaG93KGUpKVxuICB9XG4gIG9uUGFnZVNob3coZTogSlF1ZXJ5LlRyaWdnZXJlZEV2ZW50PERvY3VtZW50LCB1bmRlZmluZWQsIERvY3VtZW50LCBEb2N1bWVudD4pIHtcbiAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgY29uc3QgcGcgPSAkKFwiI1wiICsgZS50YXJnZXQuaWQpXG4gICAgICAvL0B0cy1pZ25vcmVcbiAgICAgIGlmIChwZy5wYWdlKFwib3B0aW9uXCIsIFwidGhlbWVcIikgIT0gdGhpcy50aGVtZSkge1xuICAgICAgICAvL0B0cy1pZ25vcmUgLy9UT0RPIFBhZ2UgdGhlbWUgY29sb3Igc3dhdGNoIGlzIHNldCBhdXRvbWF0aWNhbGx5LCBzZWUgaHR0cHM6Ly9hcGkuanF1ZXJ5bW9iaWxlLmNvbS8xLjQvcGFnZS8jb3B0aW9uLXRoZW1lXG4gICAgICAgIHBnLnBhZ2UoXCJvcHRpb25cIiwgXCJ0aGVtZVwiLCB0aGlzLnRoZW1lKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBvblBhZ2VJbml0KGU6IEpRdWVyeS5UcmlnZ2VyZWRFdmVudDxEb2N1bWVudCwgdW5kZWZpbmVkLCBEb2N1bWVudCwgRG9jdW1lbnQ+KSB7XG4gICAgaWYgKGUudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgIHN3aXRjaCAoZS50YXJnZXQuaWQpIHtcbiAgICAgICAgY2FzZSBcImFkbWluU2lnbkluXCI6XG4gICAgICAgICAgbmV3IEFkbWluU2lnbkluUGFnZVVJKGUudGFyZ2V0LCBuZXcgQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlcih0aGlzKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIFwic3Vic2NyaXB0aW9uXCI6XG4gICAgICAgICAgbmV3IFN1YnNjcmlwdGlvblBhZ2VVSShlLnRhcmdldCwgbmV3IFN1YnNjcmlwdGlvblBhZ2VDb250cm9sbGVyKHRoaXMpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJ1c2Vyc1wiOlxuICAgICAgICAgIG5ldyBVc2Vyc1BhZ2VVSShlLnRhcmdldCwgbmV3IFVzZXJzUGFnZUNvbnRyb2xsZXIodGhpcykpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGFyZVdlT25UaXplbigpOiBib29sZWFuIHsgcmV0dXJuIHdpbmRvdy5oYXNPd25Qcm9wZXJ0eShcInRpemVuXCIpOyB9XG4gIGV4aXRBcHAoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNJdE9rVG9FeGl0KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvL0B0cy1pZ25vcmUgLy9UT0RPIHRvIGJlIGZpeGVkIHdoZW4gaGF2ZSBUaXplbiB0eXBlIGRlZmluaXRpb25zXG4gICAgICAgIHRpemVuLmFwcGxpY2F0aW9uLmdldEN1cnJlbnRBcHBsaWNhdGlvbigpLmV4aXQoKTtcbiAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgaXNJdE9rVG9FeGl0KCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZSB9XG4gIHByaXZhdGUgaW5pdFRpemVuSFdLZXlIYW5kbGVyKGFsOiBJQXBwTG9naWMpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImluaXRUaXplbkhXS2V5SGFuZGxlcjpcIiwgYEFyZSBXZSBvbiBUaXplbiAke2FsLmFyZVdlT25UaXplbn1gKVxuICAgIGlmIChhbC5hcmVXZU9uVGl6ZW4pIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RpemVuaHdrZXknLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAvL0B0cy1pZ25vcmUgLy9UT0RPIHRvIGJlIGZpeGVkIGxhdGVyXG4gICAgICAgIGlmIChlLmtleU5hbWUgPT0gXCJiYWNrXCIgJiYgYWwuaXNJdE9rVG9FeGl0KSBhbC5leGl0QXBwKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBnZXQgdXNlclRvQmVEZWxldGVkKCk6c3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJ1c2VyVG9CZURlbGV0ZWRcIilcbiAgfVxuICBzZXQgdXNlclRvQmVEZWxldGVkKHU6c3RyaW5nIHwgbnVsbCkge1xuICAgIGlmKHUpIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJ1c2VyVG9CZURlbGV0ZWRcIix1KVxuICB9XG59XG5cbmNsYXNzIERlbW9TZXJ2aWNlQWRtaW5JbXBsIGltcGxlbWVudHMgSVNlcnZpY2VBZG1pbiB7XG4gIGRhdGE6IElTdWJzY3JpcHRpb25EZXRhaWxzID0ge1xuICAgIGxpY2Vuc2VzOiA2LFxuICAgIHVzZXJzOiBbXCJqb2huXCIsIFwibWFuYWdlclwiLCBcIm90dG9cIiwgXCJqd1wiLCBcInBiXCJdLFxuICAgIHByb2ZpbGVzOiBbXG4gICAgICB7IG5hbWU6IFwiVGVzdFwiLCBodHRwczogZmFsc2UsIGhvc3ROYW1lOiBcImJvdG9uZC1wY1wiLCBhcGlOYW1lOiBcImFwaVwiLCBwb3J0TnVtYmVyOiA1NjAwMCwgY29tcGFueURCOiBcIlNCT0RlbW9VU1wiLCBkaUFwaVVzZXI6IFwibWFuYWdlclwiLCBkaVVzZXJQYXNzd29yZDogXCIxMjNcIiB9LFxuICAgICAgeyBuYW1lOiBcIlByb2RcIiwgaHR0cHM6IGZhbHNlLCBob3N0TmFtZTogXCJib3RvbmQtcGNcIiwgYXBpTmFtZTogXCJhcGlcIiwgcG9ydE51bWJlcjogNTYwMDAsIGNvbXBhbnlEQjogXCJTQk9EZW1vVVNcIiwgZGlBcGlVc2VyOiBcIm1hbmFnZXJcIiwgZGlVc2VyUGFzc3dvcmQ6IFwiMTIzXCIgfSxcbiAgICBdXG4gIH1cbiAgYXN5bmMgZGVsZXRlVXNlckFzeW5jKHVzZXI6c3RyaW5nKTpQcm9taXNlPElTdWJzY3JpcHRpb25EZXRhaWxzPntcbiAgICBpZih0aGlzLmRhdGEudXNlcnMpIHRoaXMuZGF0YS51c2VycyA9IHRoaXMuZGF0YS51c2Vycy5maWx0ZXIoKGUpID0+IGUgIT0gdXNlcilcbiAgICBhd2FpdCBzbGVlcEFzeW5jKDIwMDApXG4gICAgcmV0dXJuIHRoaXMuZGF0YVxuICB9XG5cbiAgYXN5bmMgc2lnbkluQXN5bmMoc3Vic2NyaXB0aW9uTnVtYmVyOiBzdHJpbmcsIHBpbjogc3RyaW5nKTogUHJvbWlzZTxJU3Vic2NyaXB0aW9uRGV0YWlscz4ge1xuICAgIGlmIChzdWJzY3JpcHRpb25OdW1iZXIuaW5jbHVkZXMoXCI5XCIpICYmIHBpbikge1xuICAgICAgLy9IVFRQUyBkb2Vzbid0IHdvcmsgb24gZW11bGF0b3IgOigsIGF0IGxlYXN0IG5vdCBvbiBNYWMsIGJ1dCB3b3JrcyBmaW5lIG9uIHJlYWwgZGV2aWNlIFxuICAgICAgY29uc3QgdXJsID0gXCJodHRwczovL3JlcXJlcy5pbi9hcGkvdXNlcnM/ZGVsYXk9M1wiXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByID0gYXdhaXQgJC5hamF4KHsgbWV0aG9kOiBcIkdFVFwiLCB1cmwgfSlcbiAgICAgICAgdGhpcy5kYXRhLnVzZXJzID0gci5kYXRhLm1hcCgoZTogeyBsYXN0X25hbWU6IHN0cmluZyB9KSA9PiBlLmxhc3RfbmFtZSlcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YSAgICAgICAgICBcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7IGVycm9yOiB7IGVycm9yQ29kZTogZXJyb3Iuc3RhdHVzLCBlcnJvclRleHQ6IGBBamF4IGVycm9yICR7ZXJyb3Iuc3RhdHVzVGV4dH0gZm9yIFVSTCAke3VybH1gIH0gfSAgICAgICAgXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7IGVycm9yOiB7IGVycm9yQ29kZTogMTAwMSwgZXJyb3JUZXh0OiBgSW52YWxpZCBzdWJzY3JpcHRpb24gbnVtYmVyICR7c3Vic2NyaXB0aW9uTnVtYmVyfSBIYXMgbm8gZGlnaXQgOSBvciBubyBQSU5gIH0gfVxuICAgIH1cbiAgfVxufSIsImltcG9ydCB7XG4gIElBcHBEYXRhLCBJQWRtaW5TaWduSW5QYWdlVUksIElBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyLCBJQXBwTG9naWMsXG4gIElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyLCBJU3Vic2NyaXB0aW9uUGFnZVVJLFxuICBJVXNlcnNQYWdlQ29udHJvbGxlciwgSVVzZXJzUGFnZVVJLFxufSBmcm9tIFwiLi9pbnRlcmZhY2VzXCJcbmV4cG9ydCBjbGFzcyBDb250cm9sbGVyPFVJPiB7XG4gIHJlYWRvbmx5IGFsOiBJQXBwTG9naWNcbiAgY29uc3RydWN0b3IoYWw6IElBcHBMb2dpYykgeyB0aGlzLmFsID0gYWwgfVxuICBwcml2YXRlIF91aT86IFVJXG4gIHNldCB1aSh2OiBVSSkgeyB0aGlzLl91aSA9IHYgfVxuICBnZXQgdWkoKTogVUkgeyBpZiAodGhpcy5fdWkpIHJldHVybiB0aGlzLl91aTsgZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJVSSBub3QgZGVmaW5lZCBmb3IgY29udHJvbGxlclwiKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlcjxJQWRtaW5TaWduSW5QYWdlVUk+IGltcGxlbWVudHMgSUFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3RvcihhbDogSUFwcExvZ2ljKSB7IHN1cGVyKGFsKSB9XG4gIG9uRXhpdCgpOiB2b2lkIHtcbiAgICB0aGlzLmFsLmV4aXRBcHAoKVxuICB9XG4gIGFzeW5jIG9uU2lnbkluQXN5bmMoc3Vic2NyaXB0aW9uTnVtYmVyPzogc3RyaW5nLCBwaW4/OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aGlzLmFsLmRhdGFTdG9yZS5zYXZlU3Vic2NyaXB0aW9uTnVtYmVyQW5kUElOKHN1YnNjcmlwdGlvbk51bWJlciwgcGluKVxuICAgIGlmIChzdWJzY3JpcHRpb25OdW1iZXIgJiYgcGluKSB7XG4gICAgICB0aGlzLmFsLnN1YnNjcmlwdGlvbkRldGFpbHMgPSBhd2FpdCB0aGlzLmFsLnNlcnZpY2VBZG1pbkFwaS5zaWduSW5Bc3luYyhzdWJzY3JpcHRpb25OdW1iZXIsIHBpbilcbiAgICAgIGlmICh0aGlzLmFsLnN1YnNjcmlwdGlvbkRldGFpbHMuZXJyb3IpIHtcbiAgICAgICAgdGhpcy51aS5zaG93TWVzc2FnZU9uUGFuZWwodGhpcy5hbC5zdWJzY3JpcHRpb25EZXRhaWxzLmVycm9yLmVycm9yVGV4dClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL1RoZSBkZXRhaWxzIGFyZSBpbiB0aGUgYXBwIGxvZ2ljIGZvciBuZXh0IHNjcmVlblxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVpLnNob3dNZXNzYWdlT25QYW5lbChgTm8gc3Vic2NyaXB0aW9uIG51bWJlciAoJHtzdWJzY3JpcHRpb25OdW1iZXJ9KSBvciBQSU4gKCR7cGlufSkgZGVmaW5lZGApXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgb25QYWdlU2hvdygpIHtcbiAgICBjb25zdCBhcHBEYXRhOiBJQXBwRGF0YSA9IHRoaXMuYWwuZGF0YVN0b3JlLmdldEFwcERhdGEoKVxuICAgIC8vIFJldHJpZXZlIHNhdmVkIHN1YnNjcmlwdGlvbiBudW1iZXIgYW5kIFBJTiBmcm9tIGxvY2FsIHN0b3JlXG4gICAgaWYgKGFwcERhdGEuc3Vic2NyaXB0aW9uTnVtYmVyKSB0aGlzLnVpLnNldFN1YnNjcmlwdGlvbk51bWJlcihhcHBEYXRhLnN1YnNjcmlwdGlvbk51bWJlcilcbiAgICBpZiAoIXRoaXMuYWwuYXJlV2VPblRpemVuKSB0aGlzLnVpLmhpZGVFeGl0KClcbiAgICBjb25zb2xlLmxvZyhcIkFkbWluIFNpZ25JbiBQYWdlIHNob3duXCIpXG4gIH1cbiAgb25UaGVtZSh0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5hbC50aGVtZSA9IHRoXG4gICAgdGhpcy51aS5zZXRUaGVtZSh0aClcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3Vic2NyaXB0aW9uUGFnZUNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyPElTdWJzY3JpcHRpb25QYWdlVUk+IGltcGxlbWVudHMgSVN1YnNjcmlwdGlvUGFnZUNvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3RvcihhbDogSUFwcExvZ2ljKSB7IHN1cGVyKGFsKSB9XG4gIG9uUGFnZVNob3coKSB7XG4gICAgdGhpcy51aS5zaG93U3Vic2NyaXB0aW9uRGV0YWlscyh0aGlzLmFsLnN1YnNjcmlwdGlvbkRldGFpbHMpXG4gICAgY29uc29sZS5sb2coXCJTdWJzY3JpcHRpb24gUGFnZSBzaG93blwiKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVc2Vyc1BhZ2VDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlcjxJVXNlcnNQYWdlVUk+IGltcGxlbWVudHMgSVVzZXJzUGFnZUNvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3RvcihhbDogSUFwcExvZ2ljKSB7IHN1cGVyKGFsKSB9XG4gIG9uUGFnZVNob3coKSB7XG4gICAgdGhpcy51aS5zaG93VXNlcnModGhpcy5hbC5zdWJzY3JpcHRpb25EZXRhaWxzLnVzZXJzKVxuICB9XG4gIG9uRGVsZXRlVXNlckNsaWNrZWQodXNlcjpzdHJpbmcpOnZvaWQge1xuICAgIHRoaXMuYWwudXNlclRvQmVEZWxldGVkID0gdXNlclxuICAgIHRoaXMudWkuc2hvd0RlbGV0ZVVzZXJDb25maXJtYXRpb24odXNlcilcbiAgfVxuICAvL0B0cy1pZ25vcmUgLy9UT0RPIFRvIGltcGxlbWVudCB1c2VyIGRlbGV0aW9uXG4gIGFzeW5jIG9uRGVsZXRlVXNlckNvbmZpcm1lZEFzeW5jKHVzZXI6c3RyaW5nKXtcbiAgICBjb25zdCBkZXRhaWxzID0gYXdhaXQgdGhpcy5hbC5zZXJ2aWNlQWRtaW5BcGkuZGVsZXRlVXNlckFzeW5jKHVzZXIpXG4gICAgdGhpcy51aS5zaG93VXNlcnMoZGV0YWlscy51c2VycykgLy9UbyBzaG93IHRoZSByZXN1bHRzIG9mIHRoZSBkZWxldGlvbiBvciBvdGhlciBpbnRlcm1pdHRlbnQgZGF0YWJhc2UgY2hhbmdlc1xuICB9XG59IiwiaW1wb3J0IHtBcHBMb2dpY30gZnJvbSBcIi4vYXBwbG9naWNcIlxubmV3IEFwcExvZ2ljKClcbiIsImltcG9ydCB7b3BlbkpRTVBhbmVsLCBjaGFuZ2VQYWdlLFxuICBzZXRIVE1MRWxlbWVudFRleHQsIGdldEhUTUxFbGVtZW50VmFsLCBzZXRIVE1MRWxlbWVudFZhbCwgfSBmcm9tIFwiLi91dGlsc1wiXG5pbXBvcnQge1xuICBJQWRtaW5TaWduSW5QYWdlVUksIElBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyLCBJQ29udHJvbGxlciwgSVBhZ2VVSSxcbiAgSVN1YnNjcmlwdGlvbkRldGFpbHMsIElTdWJzY3JpcHRpb25QYWdlVUksIElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyLFxuICBJVXNlcnNQYWdlQ29udHJvbGxlciwgSVVzZXJzUGFnZVVJLFxufSBmcm9tIFwiLi9pbnRlcmZhY2VzXCJcblxuZXhwb3J0IGNsYXNzIFBhZ2VVSTxDVFIgZXh0ZW5kcyBJQ29udHJvbGxlcjxJUGFnZVVJPj4gaW1wbGVtZW50cyBJUGFnZVVJIHtcbiAgcHJpdmF0ZSByZWFkb25seSBfcGFnZTogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSByZWFkb25seSBfY3RybDogQ1RSXG4gIGdldCBwYWdlKCk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIHRoaXMuX3BhZ2UgfVxuICBnZXQgY3RybCgpOiBDVFIgeyBpZiAodGhpcy5fY3RybCkgcmV0dXJuIHRoaXMuX2N0cmw7IGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiTm8gQ29udHJvbGxlciBkZWZpbmVkIGZvciBVSSBvYmplY3RcIikgfVxuICBjb25zdHJ1Y3RvcihwYWdlOiBIVE1MRWxlbWVudCwgY3RybDogQ1RSKSB7XG4gICAgdGhpcy5fcGFnZSA9IHBhZ2VcbiAgICB0aGlzLl9jdHJsID0gY3RybFxuICAgIHRoaXMuX2N0cmwudWkgPSB0aGlzIC8vIFRoaXMgaXMgdGVycmlibHkgaW1wb3J0YW50IHRvIHBhc3MgdGhlIFVJIG9iamVjdCB0byB0aGUgY29udHJvbGxlclxuICB9XG4gIHNldFRoZW1lKHRoZW1lOiBzdHJpbmcpIHtcbiAgICAvL0B0cy1pZ25vcmUgLy9UT0RPIHNlZSBodHRwczovL2FwaS5qcXVlcnltb2JpbGUuY29tLzEuNC9wYWdlLyNvcHRpb24tdGhlbWVcbiAgICAkKFwiI1wiICsgdGhpcy5wYWdlLmlkKS5wYWdlKFwib3B0aW9uXCIsIFwidGhlbWVcIiwgdGhlbWUpXG4gIH1cbiAgc2hvd0xvYWRpbmdJbmRpY2F0b3IoKSB7XG4gICAgJC5tb2JpbGUubG9hZGluZyhcInNob3dcIiwgeyB0ZXh0OiBcIkxvYWRpbmcuLi5cIiwgdGV4dFZpc2libGU6IHRydWUsIHRoZW1lOiBcImJcIiwgfSk7XG4gIH1cbiAgaGlkZUxvYWRpbmdJbmRpY2F0b3IoKSB7ICQubW9iaWxlLmxvYWRpbmcoXCJoaWRlXCIpIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFkbWluU2lnbkluUGFnZVVJIGV4dGVuZHMgUGFnZVVJPElBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyPiBpbXBsZW1lbnRzIElBZG1pblNpZ25JblBhZ2VVSSB7XG4gIGNvbnN0cnVjdG9yKHBhZ2U6IEhUTUxFbGVtZW50LCBjdHJsOiBJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlcikge1xuICAgIHN1cGVyKHBhZ2UsIGN0cmwpXG4gICAgJChcIiNzaWduSW5cIikub24oXCJjbGlja1wiLCBhc3luYyAoZSkgPT4ge1xuICAgICAgLy8gVGhpcyBmdW5jdGlvbiBjYW4gYmUgZGVjbGFyZWQgYXN5bmMgYnV0IHRoZSBicm93c2VyIGhhbmRsZXIgd2lsbCBub3QgYmxvY2tcbiAgICAgIC8vIHRoZSBleGVjdXRpb24gb2YgdGhlIGNvZGUuIFNvIHdoZW4gd29ya2luZyB3aXRoIGFzeW5jIGNhbGxzXG4gICAgICAvLyBUaGUgbmF2aWdhdGlvbiB0byB0aGUgbmV4dCBwYWdlIGhhcyB0byBiZSBkb25lIG1hbnVhbGx5XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCkgLy8gVGhpcyBpcyBhbm90aGVyIHdheSB0byBibG9jayBkZWZhdWx0IEhUTUwgaGFuZGxpbmdcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuc2hvd0xvYWRpbmdJbmRpY2F0b3IoKVxuICAgICAgICBpZiAoYXdhaXQgdGhpcy5jdHJsLm9uU2lnbkluQXN5bmMoXG4gICAgICAgICAgZ2V0SFRNTEVsZW1lbnRWYWwoXCIjc3Vic2NyaXB0aW9uTnVtYmVyXCIpLFxuICAgICAgICAgIGdldEhUTUxFbGVtZW50VmFsKFwiI3BpblwiKSkpIHtcbiAgICAgICAgICAvLyA8YSBocmVmPVwiI3N1YnNjcmlwdGlvblwiIGRhdGEtdHJhbnNpdGlvbj1cInNsaWRlXCIgZGF0YS1yb2xlPVwiYnV0dG9uXCIgaWQ9XCJzaWduSW5cIj5TaWduIEluPC9hPlxuICAgICAgICAgIGNoYW5nZVBhZ2UoXCIjc3Vic2NyaXB0aW9uXCIsIHsgdHJhbnNpdGlvbjogXCJzbGlkZVwiIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKVxuICAgICAgfVxuICAgIH0pXG4gICAgJChwYWdlKS5vbihcInBhZ2ViZWZvcmVzaG93XCIsICgpID0+IHsgLy9EZXByZWNhdGVkIGFzIG9mIDEuNC4wLCBIbW1tXG4gICAgICB0aGlzLmN0cmwub25QYWdlU2hvdygpXG4gICAgfSlcbiAgICAkKFwiI2V4aXRcIikub24oXCJjbGlja1wiLCAoLyplKi8pID0+IHtcbiAgICAgIC8vZS5wcmV2ZW50RGVmYXVsdCgpIC8vIFRoaXMgaXMgYW5vdGhlciB3YXkgdG8gYmxvY2sgZGVmYXVsdCBIVE1MIGhhbmRsaW5nXG4gICAgICByZXR1cm4gdGhpcy5jdHJsLm9uRXhpdCgpXG4gICAgfSlcbiAgICAkKFwiI3RoZW1lQVwiKS5vbihcImNsaWNrXCIsICgpID0+IHsgdGhpcy5jdHJsLm9uVGhlbWUoXCJhXCIpIH0pXG4gICAgJChcIiN0aGVtZUJcIikub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuY3RybC5vblRoZW1lKFwiYlwiKSB9KVxuICAgICQoXCIjdGhlbWVDXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4geyB0aGlzLmN0cmwub25UaGVtZShcImNcIikgfSlcbiAgICBjb25zb2xlLmxvZyhcIkFkbWluU2lnbkluUGFnZVVJIGNvbnN0cnVjdGVkXCIpXG4gIH1cbiAgc2V0U3Vic2NyaXB0aW9uTnVtYmVyKG46IHN0cmluZykge1xuICAgIHNldEhUTUxFbGVtZW50VmFsKFwiI3N1YnNjcmlwdGlvbk51bWJlclwiLCBuKVxuICB9XG4gIHNob3dNZXNzYWdlT25QYW5lbChtc2c6IHN0cmluZykge1xuICAgIHNldEhUTUxFbGVtZW50VGV4dChcIiNhZG1pblNpZ25Jbk1lc3NhZ2VcIiwgbXNnKVxuICAgIC8vICQubW9iaWxlLmNoYW5nZVBhZ2UoXCIjYWRtaW5TaWduSW5QYW5lbFwiKSAvLyBUaGlzIHdvbid0IHdvcmsgd2l0aCBwYW5lbHMgc2VlIGh0dHBzOi8vYXBpLmpxdWVyeW1vYmlsZS5jb20vcGFuZWwvXG4gICAgb3BlbkpRTVBhbmVsKFwiI2FkbWluU2lnbkluUGFuZWxcIilcbiAgICAvLyQoIFwiI215cGFuZWxcIiApLnRyaWdnZXIoIFwidXBkYXRlbGF5b3V0XCIgKSAvL01heWJlIHRoaXMgaXMgcmVxdWlyZWQsIHRvb1xuICB9XG4gIGhpZGVFeGl0KCk6IHZvaWQge1xuICAgICQoXCIjZXhpdFwiKS5oaWRlKClcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3Vic2NyaXB0aW9uUGFnZVVJIGV4dGVuZHMgUGFnZVVJPElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyPiBpbXBsZW1lbnRzIElTdWJzY3JpcHRpb25QYWdlVUkge1xuICBjb25zdHJ1Y3RvcihwYWdlOiBIVE1MRWxlbWVudCwgY3RybDogSVN1YnNjcmlwdGlvUGFnZUNvbnRyb2xsZXIpIHtcbiAgICBzdXBlcihwYWdlLCBjdHJsKVxuICAgICQocGFnZSkub24oXCJwYWdlYmVmb3Jlc2hvd1wiLCAoKSA9PiB7IC8vRGVwcmVjYXRlZCBhcyBvZiAxLjQuMCwgSG1tbVxuICAgICAgdGhpcy5jdHJsLm9uUGFnZVNob3coKVxuICAgIH0pXG4gIH1cbiAgc2hvd1N1YnNjcmlwdGlvbkRldGFpbHMoZGV0YWlsczogSVN1YnNjcmlwdGlvbkRldGFpbHMpOiB2b2lkIHtcbiAgICBzZXRIVE1MRWxlbWVudFRleHQoXCIjbnVtYmVyT2ZsaWNlbnNlc1wiLCBcIlwiICsgZGV0YWlscy5saWNlbnNlcylcbiAgICBzZXRIVE1MRWxlbWVudFRleHQoXCIjbnVtYmVyT2ZVc2Vyc1wiLCBcIlwiICsgZGV0YWlscy51c2Vycz8ubGVuZ3RoKVxuICAgIHNldEhUTUxFbGVtZW50VGV4dChcIiNudW1iZXJPZlByb2ZpbGVzXCIsIFwiXCIgKyBkZXRhaWxzLnByb2ZpbGVzPy5sZW5ndGgpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVzZXJzUGFnZVVJIGV4dGVuZHMgUGFnZVVJPElVc2Vyc1BhZ2VDb250cm9sbGVyPiBpbXBsZW1lbnRzIElVc2Vyc1BhZ2VVSSB7XG4gIGNvbnN0cnVjdG9yKHBhZ2U6IEhUTUxFbGVtZW50LCBjdHJsOiBJVXNlcnNQYWdlQ29udHJvbGxlcikge1xuICAgIHN1cGVyKHBhZ2UsIGN0cmwpXG4gICAgJChwYWdlKS5vbihcInBhZ2ViZWZvcmVzaG93XCIsICgpID0+IHsgdGhpcy5jdHJsLm9uUGFnZVNob3coKSB9KVxuICAgICQoXCIjdXNlckxpc3RcIikub24oXCJjbGlja1wiLCAoZSkgPT4geyAvL0Fsd2F5cyB1c2UgZmF0IGFycm93IHRvIGdldCBwcm9wZXIgdGhpcyBoYW5kbGluZ1xuICAgICAgY29uc29sZS5sb2coXCJ1c2VyIGxpc3QgY2xpY2sgZm9yIFwiLCBlKVxuICAgICAgLy8gJChcIiN1c2VyVG9EZWxldGVcIikudGV4dChlLnRhcmdldC50ZXh0KVxuICAgICAgLy9AdHMtaWdub3JlIC8vVE9ETyBXZSBhcmUgc3VyZSBpdCB3b3JrcyBzaW5jZSB3ZSBoYXZlIGRlZmluZWQgZGF0YS11c2VyLWlkIGZvciBlYWNoIHVzZXJzIGFkZGVkIHRvIHRoZSBsaXN0XG4gICAgICAvLyAkKFwiI3VzZXJUb0RlbGV0ZVwiKS50ZXh0KGUudGFyZ2V0LmRhdGFzZXQudXNlcklkKVxuICAgICAgdGhpcy5jdHJsLm9uRGVsZXRlVXNlckNsaWNrZWQoZS50YXJnZXQuZGF0YXNldC51c2VySWQpXG4gICAgfSlcbiAgICAkKFwiI3VzZXJEZWxldGlvbkNvbmZpcm1lZFwiKS5vbihcImNsaWNrXCIsIGFzeW5jICgvKmUqLykgPT4geyAvL0Fsd2F5cyB1c2UgZmF0IGFycm93IHRvIGdldCBwcm9wZXIgdGhpcyBoYW5kbGluZ1xuICAgICAgLy8gZS5wcmV2ZW50RGVmYXVsdCgpIC8vIE5vIG5lZWQgdG8gYmxvY2sgZGVmYXVsdCBIVE1MIGhhbmRsaW5nLCBpdCdzIGZpbmUgdGhhdCB0aGUgY29uZmlybWF0aW9uIHBhbmVsIGlzIGF1dG9tYXRpY2FsbHkgY2xvc2VkXG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnNob3dMb2FkaW5nSW5kaWNhdG9yKClcbiAgICAgICAgaWYgKHRoaXMuY3RybC5hbC51c2VyVG9CZURlbGV0ZWQpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmN0cmwub25EZWxldGVVc2VyQ29uZmlybWVkQXN5bmModGhpcy5jdHJsLmFsLnVzZXJUb0JlRGVsZXRlZClcbiAgICAgICAgfVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgdGhpcy5oaWRlTG9hZGluZ0luZGljYXRvcigpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBzaG93VXNlcnModXNlckxpc3Q6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgY29uc3QgdXNlcnNIdG1sID0gdXNlckxpc3QucmVkdWNlKChhLCB1KSA9PiBhICs9IGBcbiAgICA8bGkgZGF0YS1pY29uPVwiZGVsZXRlXCI+PGEgaHJlZj1cIiNkZWxldGVVc2VyXCIgZGF0YS1yZWw9XCJwb3B1cFwiIGRhdGEtcG9zaXRpb24tdG89XCJ3aW5kb3dcIiBkYXRhLXRyYW5zaXRpb249XCJwb3BcIlxuICAgICAgICAgIGRhdGEtdXNlci1pZD1cIiR7dX1cIj4ke3V9PC9hPlxuICAgIDwvbGk+ICAgICAgXG4gICAgYCwgXCJcIilcbiAgICAkKFwiI3VzZXJMaXN0XCIpLmh0bWwodXNlcnNIdG1sKS5saXN0dmlldyhcInJlZnJlc2hcIilcbiAgfVxuICBzaG93RGVsZXRlVXNlckNvbmZpcm1hdGlvbih1c2VyOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAkKFwiI3VzZXJUb0RlbGV0ZVwiKS50ZXh0KHVzZXIpXG4gICAgLy9UaGUgY29uZmlybWF0aW9uIGRpYWxvZyBpcyBhdXRvbWF0aWNhbGx5IG9wZW5lZCBzaW5jZSB0aGUgTEkgZWxlbWVudHMgYWxsIGhhdmUgdGhlIGhyZWY9I2RlbGV0ZVVzZXJcbiAgfVxuXG59XG4iLCIvLz09PT09PT09PT09PT09PT09PT09IFVUSUxJVFkgRlVOQ1RJT05TID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5KUU1QYW5lbChwYW5lbElkOnN0cmluZykge1xuICBjb25zdCBwOkpRdWVyeTxIVE1MRWxlbWVudD4gPSAkKHBhbmVsSWQpXG4gIC8vQHRzLWlnbm9yZSAvL1RPRE8gVGhlIHBhbmVsKCkgaXMgbm90IGRlY2xhcmVkLCB1bmZvcnR1bmF0ZWx5LCBpbiBKUU0gdHlwZXMsIGJ1dCB3b3JrcyBmaW5lXG4gIHAucGFuZWwoXCJvcGVuXCIpXG59XG5leHBvcnQgZnVuY3Rpb24gY2hhbmdlUGFnZShwYWdlSWQ6c3RyaW5nLG9wdGlvbnM/OkNoYW5nZVBhZ2VPcHRpb25zKTp2b2lkIHtcbiAgJC5tb2JpbGUuY2hhbmdlUGFnZShwYWdlSWQsb3B0aW9ucylcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRIVE1MRWxlbWVudFRleHQoaWQ6c3RyaW5nLCBzOnN0cmluZykge1xuICBjb25zdCBlID0gJChpZClcbiAgaWYoZS5sZW5ndGgpIGUudGV4dChzKVxuICBlbHNlIHRocm93IG5ldyBFcnJvcihgTm8gZWxlbWVudCBmb3VuZCB3aXRoIElEICR7aWR9YClcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRIVE1MRWxlbWVudFZhbChpZDpzdHJpbmcpOnN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGUgPSAkKGlkKVxuICBpZihlLmxlbmd0aCkgcmV0dXJuIGUudmFsKCk/LnRvU3RyaW5nKClcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoYE5vIGVsZW1lbnQgZm91bmQgd2l0aCBJRCAke2lkfWApXG59XG5leHBvcnQgZnVuY3Rpb24gc2V0SFRNTEVsZW1lbnRWYWwoaWQ6c3RyaW5nLCBzOnN0cmluZyk6dm9pZCB7XG4gIGNvbnN0IGUgPSAkKGlkKVxuICBpZihlLmxlbmd0aCkgZS52YWwocylcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoYE5vIGVsZW1lbnQgZm91bmQgd2l0aCBJRCAke2lkfWApXG59XG5leHBvcnQgZnVuY3Rpb24gc2xlZXBBc3luYyhtczpudW1iZXIpOlByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59Il19
