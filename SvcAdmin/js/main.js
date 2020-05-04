(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const themechanger_1 = require("./themechanger");
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
            themechanger_1.updateThemeOnActivePage(this.theme);
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
                //TODO This is an in-line type definition for fun
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

},{"./controllers":2,"./pages":4,"./themechanger":5,"./utils":6}],2:[function(require,module,exports){
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
        // console.log("Admin SignIn Page shown")
    }
    onTheme(th) {
        this.al.theme = th;
        this.ui.changeTheme(th);
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
const themechanger_1 = require("./themechanger");
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
    changeTheme(theme) {
        //ts-ignore //TODO see https://api.jquerymobile.com/1.4/page/#option-theme
        // $("#" + this.page.id).page("option", "theme", theme)
        themechanger_1.updateThemeOnActivePage(theme);
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

},{"./themechanger":5,"./utils":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// from https://stackoverflow.com/a/32652433
function updateThemeOnActivePage(newTheme) {
    let rmbtnClasses = '';
    let rmhfClasses = '';
    let rmbdClassess = '';
    const arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's']; // I had themes from a to s
    //@ts-ignore //TODO index is not used, but I don't want to change it
    $.each(arr, function (index, value) {
        rmbtnClasses = rmbtnClasses + ' ui-btn-up-' + value + ' ui-btn-hover-' + value;
        rmhfClasses = rmhfClasses + ' ui-bar-' + value;
        rmbdClassess = rmbdClassess + ' ui-body-' + value + ' ui-page-theme-' + value;
    });
    // reset all the buttons widgets
    $.mobile.activePage.find('.ui-btn').not('.ui-li-divider').removeClass(rmbtnClasses).addClass('ui-btn-up-' + newTheme).attr('data-theme', newTheme);
    // reset the header/footer widgets
    $.mobile.activePage.find('.ui-header, .ui-footer').removeClass(rmhfClasses).addClass('ui-bar-' + newTheme).attr('data-theme', newTheme);
    // reset the page widget
    $.mobile.activePage.removeClass(rmbdClassess).addClass('ui-body-' + newTheme + ' ui-page-theme-' + newTheme).attr('data-theme', newTheme);
    // target the list divider elements, then iterate through them and
    // change its theme (this is the jQuery Mobile default for
    // list-dividers)
    //@ts-ignore //TODO index and obj are not used
    $.mobile.activePage.find('.ui-li-divider').each(function (index, obj) {
        $(this).removeClass(rmhfClasses).addClass('ui-bar-' + newTheme).attr('data-theme', newTheme);
    });
}
exports.updateThemeOnActivePage = updateThemeOnActivePage;
;

},{}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwbG9naWMudHMiLCJzcmMvanMvY29udHJvbGxlcnMudHMiLCJzcmMvanMvbWFpbi50cyIsInNyYy9qcy9wYWdlcy50cyIsInNyYy9qcy90aGVtZWNoYW5nZXIudHMiLCJzcmMvanMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLG1DQUFrQztBQUNsQyxpREFBc0Q7QUFFdEQsK0NBQTBHO0FBQzFHLG1DQUE2RTtBQUM3RSw0Q0FBNEM7QUFFNUMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFBO0FBQzFCLE1BQU0sU0FBUztJQUNiLDRCQUE0QixDQUFDLGtCQUEyQixFQUFFLEdBQVk7UUFDcEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFBO1FBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDeEIsQ0FBQztJQUNELFdBQVcsQ0FBQyxJQUFjO1FBQ3hCLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUN0RCxDQUFDO0lBQ0QsVUFBVTtRQUNSLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDeEMsSUFBSSxDQUFDLEVBQUU7WUFDTCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3ZCLElBQUksQ0FBQztnQkFBRSxPQUFPLENBQWEsQ0FBQTtTQUM1QjtRQUNELE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7Ozs7OztFQVlFO0FBQ0YsTUFBYSxRQUFRO0lB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O1FBQUUsYUFBTyxDQUFDLENBQUMsR0FBRyxFQUFFLDBDQUFFLFFBQVEsR0FBRTs7UUFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUN4RCxDQUFDO0FBSkQsOENBSUM7QUFDRCxTQUFnQixpQkFBaUIsQ0FBQyxFQUFTLEVBQUUsQ0FBUTtJQUNuRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDZixJQUFHLENBQUMsQ0FBQyxNQUFNO1FBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7UUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUN4RCxDQUFDO0FBSkQsOENBSUM7QUFDRCxTQUFnQixVQUFVLENBQUMsRUFBUztJQUNsQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFGRCxnQ0FFQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7c2xlZXBBc3luY30gZnJvbSBcIi4vdXRpbHNcIlxuaW1wb3J0IHt1cGRhdGVUaGVtZU9uQWN0aXZlUGFnZX0gZnJvbSBcIi4vdGhlbWVjaGFuZ2VyXCJcbmltcG9ydCB7IElBcHBEYXRhLCBJRGF0YVN0b3JlLCBJQXBwTG9naWMsIElTZXJ2aWNlQWRtaW4sIElTdWJzY3JpcHRpb25EZXRhaWxzIH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiXG5pbXBvcnQgeyBBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyLCBTdWJzY3JpcHRpb25QYWdlQ29udHJvbGxlciwgVXNlcnNQYWdlQ29udHJvbGxlciB9IGZyb20gXCIuL2NvbnRyb2xsZXJzXCJcbmltcG9ydCB7IEFkbWluU2lnbkluUGFnZVVJLCBTdWJzY3JpcHRpb25QYWdlVUksIFVzZXJzUGFnZVVJLCB9IGZyb20gXCIuL3BhZ2VzXCJcbi8vIGltcG9ydCB0aGVtZUNoYW5nZXIgZnJvbSBcIi4vdGhlbWVjaGFuZ2VyXCJcblxuY29uc3QgU1RPUkVLRVkgPSBcIkFwcERhdGFcIlxuY2xhc3MgRGF0YVN0b3JlIGltcGxlbWVudHMgSURhdGFTdG9yZSB7XG4gIHNhdmVTdWJzY3JpcHRpb25OdW1iZXJBbmRQSU4oc3Vic2NyaXB0aW9uTnVtYmVyPzogc3RyaW5nLCBwaW4/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5nZXRBcHBEYXRhKClcbiAgICBkYXRhLnBpbiA9IHBpblxuICAgIGRhdGEuc3Vic2NyaXB0aW9uTnVtYmVyID0gc3Vic2NyaXB0aW9uTnVtYmVyXG4gICAgdGhpcy5zYXZlQXBwRGF0YShkYXRhKVxuICB9XG4gIHNhdmVBcHBEYXRhKGRhdGE6IElBcHBEYXRhKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oU1RPUkVLRVksIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICB9XG4gIGdldEFwcERhdGEoKTogSUFwcERhdGEge1xuICAgIGNvbnN0IHYgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTVE9SRUtFWSlcbiAgICBpZiAodikge1xuICAgICAgY29uc3QgbyA9IEpTT04ucGFyc2UodilcbiAgICAgIGlmIChvKSByZXR1cm4gbyBhcyBJQXBwRGF0YVxuICAgIH1cbiAgICByZXR1cm4ge31cbiAgfVxufVxuXG4vKlxuV2hlbiBhcHAgaXMgbG9hZGVkLCBjaGVjayBpZiB0aGVyZSBpcyBzYXZlZCBzdWJzY3JpcHRpb24gbnVtYmVyIGFuZCB1c2VyLCBpZiB0aGVyZSBpcyByZWxvYWQgaXRcblxuV2hlbiB1c2VyIHByZXNzZXMgc2lnbiBpbiwgaXQgdHJpZXMgdG8gY29ubmVjdCB0byBmaXJlYmFzZSBzZXJ2aWNlLCB2aWEgYXV0aGVudGljYXRpb24gXG50byBmaW5kIGlmIHRoZSBzZXJ2aWNlIGlzYWN0aXZlIGFuZCB0aGUgUElOIGlzIG9rLCBvciBqdXN0IHVzZSBGQiBhdXRoZW50aWNhdGlvbi5cblxuV2hlbiBwYWdlIGlzIGluaXRpYWxpemVkIHdlIGNyZWF0ZSBhbiBvYmplY3QgZnJvbSBhIGNvbnRyb2xsZXIgY2xhc3MuXG5XZSBuZWVkIHR3byBpbnRlcmZhY2VzLCBvbmUgZm9yIHRoZSBzY3JlZW4gZm9yIGNvbW1hbmRzIHRvIHNob3cgZGF0YVxuQW4gZXZlbnQgaGFuZGxlciBmb3IgdGhlIGFwcGxpY2F0aW9uIGNvbnRyb2xsZXIgdG8gcmVjZWl2ZSBldmVudHMgZnJvbSB0aGUgcGFnZS5cblRoZXNlIHR3byBpbnRlcmZhY2VzIGZvcm1hbGx5IGRlZmluZSB0aGUgY29udHJhY3QgYmV0d2VlbiB0aGUgY29tbXVuaWNhdGlvbiBwcm90b2NvbCBiZXR3ZWVuIHRoZSBVSVxuYW5kIHRoZSBhcHAgbG9naWMvY29udHJvbGxlci5cbkV2ZXJ5IFVJIG9iamVjdCBpcyBhIG1lc3NhZ2UgZGlzcGF0Y2hlciB0aGF0IGlzIHJlZ2lzdGVyZWQgaXRzIGxpc3RlbmVycyB3aXRoIEpRIGZvciB0aGUgYXBwcm9wcmlhdGUgb2JqZWN0LlxuKi9cbmV4cG9ydCBjbGFzcyBBcHBMb2dpYyBpbXBsZW1lbnRzIElBcHBMb2dpYyB7XG4gIC8vIHByaXZhdGUgX2FkbWluU2lnbkluPzogQWRtaW5TaWduSW5QYWdlVUlcbiAgLy8gc2V0IGFkbWluU2lnbkluKHY6IEFkbWluU2lnbkluUGFnZVVJKSB7IHRoaXMuX2FkbWluU2lnbkluID0gdiB9XG4gIC8vIGdldCBhZG1pblNpZ25JbigpOiBBZG1pblNpZ25JblBhZ2VVSSB7IGlmICh0aGlzLl9hZG1pblNpZ25JbikgcmV0dXJuIHRoaXMuX2FkbWluU2lnbkluOyBlbHNlIHRocm93IG5ldyBFcnJvcihcIk5vIEFkbWluU2lnbkluUGFnZVVJXCIpIH1cbiAgZGF0YVN0b3JlOiBJRGF0YVN0b3JlID0gbmV3IERhdGFTdG9yZSgpXG4gIHNlcnZpY2VBZG1pbkFwaTogSVNlcnZpY2VBZG1pbiA9IG5ldyBEZW1vU2VydmljZUFkbWluSW1wbCgpXG4gIHN1YnNjcmlwdGlvbkRldGFpbHM6IElTdWJzY3JpcHRpb25EZXRhaWxzID0ge31cbiAgdGhlbWU6IHN0cmluZyA9IFwiYlwiXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdFRpemVuSFdLZXlIYW5kbGVyKHRoaXMpXG4gICAgJChkb2N1bWVudCkub24oXCJwYWdlaW5pdFwiLCAoZSkgPT4gdGhpcy5vblBhZ2VJbml0KGUpKVxuICAgIC8vc2VlIGh0dHBzOi8vYXBpLmpxdWVyeW1vYmlsZS5jb20vMS40L3BhZ2ViZWZvcmVzaG93LyBJdCBpcyBkZXByZWNhdGVkIGFuZCBub3QgYXZhaWxhYmxlIGluIDEuNVxuICAgICQoZG9jdW1lbnQpLm9uKFwicGFnZWJlZm9yZXNob3dcIiwgKGUpID0+IHRoaXMub25QYWdlU2hvdyhlKSlcbiAgfVxuICBvblBhZ2VTaG93KGU6IEpRdWVyeS5UcmlnZ2VyZWRFdmVudDxEb2N1bWVudCwgdW5kZWZpbmVkLCBEb2N1bWVudCwgRG9jdW1lbnQ+KSB7XG4gICAgaWYgKGUudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgIHVwZGF0ZVRoZW1lT25BY3RpdmVQYWdlKHRoaXMudGhlbWUpXG4gICAgfVxuICB9XG4gIG9uUGFnZUluaXQoZTogSlF1ZXJ5LlRyaWdnZXJlZEV2ZW50PERvY3VtZW50LCB1bmRlZmluZWQsIERvY3VtZW50LCBEb2N1bWVudD4pIHtcbiAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgc3dpdGNoIChlLnRhcmdldC5pZCkge1xuICAgICAgICBjYXNlIFwiYWRtaW5TaWduSW5cIjpcbiAgICAgICAgICBuZXcgQWRtaW5TaWduSW5QYWdlVUkoZS50YXJnZXQsIG5ldyBBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyKHRoaXMpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJzdWJzY3JpcHRpb25cIjpcbiAgICAgICAgICBuZXcgU3Vic2NyaXB0aW9uUGFnZVVJKGUudGFyZ2V0LCBuZXcgU3Vic2NyaXB0aW9uUGFnZUNvbnRyb2xsZXIodGhpcykpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcInVzZXJzXCI6XG4gICAgICAgICAgbmV3IFVzZXJzUGFnZVVJKGUudGFyZ2V0LCBuZXcgVXNlcnNQYWdlQ29udHJvbGxlcih0aGlzKSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgYXJlV2VPblRpemVuKCk6IGJvb2xlYW4geyByZXR1cm4gd2luZG93Lmhhc093blByb3BlcnR5KFwidGl6ZW5cIik7IH1cbiAgZXhpdEFwcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0l0T2tUb0V4aXQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vQHRzLWlnbm9yZSAvL1RPRE8gdG8gYmUgZml4ZWQgd2hlbiBoYXZlIFRpemVuIHR5cGUgZGVmaW5pdGlvbnNcbiAgICAgICAgdGl6ZW4uYXBwbGljYXRpb24uZ2V0Q3VycmVudEFwcGxpY2F0aW9uKCkuZXhpdCgpO1xuICAgICAgfSBjYXRjaCAoaWdub3JlKSB7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGdldCBpc0l0T2tUb0V4aXQoKTogYm9vbGVhbiB7IHJldHVybiB0cnVlIH1cbiAgcHJpdmF0ZSBpbml0VGl6ZW5IV0tleUhhbmRsZXIoYWw6IElBcHBMb2dpYykge1xuICAgIC8vIGNvbnNvbGUubG9nKFwiaW5pdFRpemVuSFdLZXlIYW5kbGVyOlwiLCBgQXJlIFdlIG9uIFRpemVuICR7YWwuYXJlV2VPblRpemVufWApXG4gICAgaWYgKGFsLmFyZVdlT25UaXplbikge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGl6ZW5od2tleScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIC8vQHRzLWlnbm9yZSAvL1RPRE8gdG8gYmUgZml4ZWQgbGF0ZXJcbiAgICAgICAgaWYgKGUua2V5TmFtZSA9PSBcImJhY2tcIiAmJiBhbC5pc0l0T2tUb0V4aXQpIGFsLmV4aXRBcHAoKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIGdldCB1c2VyVG9CZURlbGV0ZWQoKTpzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcInVzZXJUb0JlRGVsZXRlZFwiKVxuICB9XG4gIHNldCB1c2VyVG9CZURlbGV0ZWQodTpzdHJpbmcgfCBudWxsKSB7XG4gICAgaWYodSkgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcInVzZXJUb0JlRGVsZXRlZFwiLHUpXG4gIH1cbn1cblxuY2xhc3MgRGVtb1NlcnZpY2VBZG1pbkltcGwgaW1wbGVtZW50cyBJU2VydmljZUFkbWluIHtcbiAgZGF0YTogSVN1YnNjcmlwdGlvbkRldGFpbHMgPSB7XG4gICAgbGljZW5zZXM6IDYsXG4gICAgdXNlcnM6IFtcImpvaG5cIiwgXCJtYW5hZ2VyXCIsIFwib3R0b1wiLCBcImp3XCIsIFwicGJcIl0sXG4gICAgcHJvZmlsZXM6IFtcbiAgICAgIHsgbmFtZTogXCJUZXN0XCIsIGh0dHBzOiBmYWxzZSwgaG9zdE5hbWU6IFwiYm90b25kLXBjXCIsIGFwaU5hbWU6IFwiYXBpXCIsIHBvcnROdW1iZXI6IDU2MDAwLCBjb21wYW55REI6IFwiU0JPRGVtb1VTXCIsIGRpQXBpVXNlcjogXCJtYW5hZ2VyXCIsIGRpVXNlclBhc3N3b3JkOiBcIjEyM1wiIH0sXG4gICAgICB7IG5hbWU6IFwiUHJvZFwiLCBodHRwczogZmFsc2UsIGhvc3ROYW1lOiBcImJvdG9uZC1wY1wiLCBhcGlOYW1lOiBcImFwaVwiLCBwb3J0TnVtYmVyOiA1NjAwMCwgY29tcGFueURCOiBcIlNCT0RlbW9VU1wiLCBkaUFwaVVzZXI6IFwibWFuYWdlclwiLCBkaVVzZXJQYXNzd29yZDogXCIxMjNcIiB9LFxuICAgIF1cbiAgfVxuICBhc3luYyBkZWxldGVVc2VyQXN5bmModXNlcjpzdHJpbmcpOlByb21pc2U8SVN1YnNjcmlwdGlvbkRldGFpbHM+e1xuICAgIGlmKHRoaXMuZGF0YS51c2VycykgdGhpcy5kYXRhLnVzZXJzID0gdGhpcy5kYXRhLnVzZXJzLmZpbHRlcigoZSkgPT4gZSAhPSB1c2VyKVxuICAgIGF3YWl0IHNsZWVwQXN5bmMoMjAwMClcbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cblxuICBhc3luYyBzaWduSW5Bc3luYyhzdWJzY3JpcHRpb25OdW1iZXI6IHN0cmluZywgcGluOiBzdHJpbmcpOiBQcm9taXNlPElTdWJzY3JpcHRpb25EZXRhaWxzPiB7XG4gICAgaWYgKHN1YnNjcmlwdGlvbk51bWJlci5pbmNsdWRlcyhcIjlcIikgJiYgcGluKSB7XG4gICAgICAvL0hUVFBTIGRvZXNuJ3Qgd29yayBvbiBlbXVsYXRvciA6KCwgYXQgbGVhc3Qgbm90IG9uIE1hYywgYnV0IHdvcmtzIGZpbmUgb24gcmVhbCBkZXZpY2UgXG4gICAgICBjb25zdCB1cmwgPSBcImh0dHBzOi8vcmVxcmVzLmluL2FwaS91c2Vycz9kZWxheT0zXCJcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHIgPSBhd2FpdCAkLmFqYXgoeyBtZXRob2Q6IFwiR0VUXCIsIHVybCB9KVxuICAgICAgICAvL1RPRE8gVGhpcyBpcyBhbiBpbi1saW5lIHR5cGUgZGVmaW5pdGlvbiBmb3IgZnVuXG4gICAgICAgIHRoaXMuZGF0YS51c2VycyA9IHIuZGF0YS5tYXAoKGU6IHsgbGFzdF9uYW1lOiBzdHJpbmcgfSkgPT4gZS5sYXN0X25hbWUpXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEgICAgICAgICAgXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4geyBlcnJvcjogeyBlcnJvckNvZGU6IGVycm9yLnN0YXR1cywgZXJyb3JUZXh0OiBgQWpheCBlcnJvciAke2Vycm9yLnN0YXR1c1RleHR9IGZvciBVUkwgJHt1cmx9YCB9IH0gICAgICAgIFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyBlcnJvcjogeyBlcnJvckNvZGU6IDEwMDEsIGVycm9yVGV4dDogYEludmFsaWQgc3Vic2NyaXB0aW9uIG51bWJlciAke3N1YnNjcmlwdGlvbk51bWJlcn0gSGFzIG5vIGRpZ2l0IDkgb3Igbm8gUElOYCB9IH1cbiAgICB9XG4gIH1cbn0iLCJpbXBvcnQge1xuICBJQXBwRGF0YSwgSUFkbWluU2lnbkluUGFnZVVJLCBJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlciwgSUFwcExvZ2ljLFxuICBJU3Vic2NyaXB0aW9QYWdlQ29udHJvbGxlciwgSVN1YnNjcmlwdGlvblBhZ2VVSSxcbiAgSVVzZXJzUGFnZUNvbnRyb2xsZXIsIElVc2Vyc1BhZ2VVSSxcbn0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlcjxVST4ge1xuICByZWFkb25seSBhbDogSUFwcExvZ2ljXG4gIGNvbnN0cnVjdG9yKGFsOiBJQXBwTG9naWMpIHsgdGhpcy5hbCA9IGFsIH1cbiAgcHJpdmF0ZSBfdWk/OiBVSVxuICBzZXQgdWkodjogVUkpIHsgdGhpcy5fdWkgPSB2IH1cbiAgZ2V0IHVpKCk6IFVJIHsgaWYgKHRoaXMuX3VpKSByZXR1cm4gdGhpcy5fdWk7IGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiVUkgbm90IGRlZmluZWQgZm9yIGNvbnRyb2xsZXJcIikgfVxufVxuXG5leHBvcnQgY2xhc3MgQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXI8SUFkbWluU2lnbkluUGFnZVVJPiBpbXBsZW1lbnRzIElBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IoYWw6IElBcHBMb2dpYykgeyBzdXBlcihhbCkgfVxuICBvbkV4aXQoKTogdm9pZCB7XG4gICAgdGhpcy5hbC5leGl0QXBwKClcbiAgfVxuICBhc3luYyBvblNpZ25JbkFzeW5jKHN1YnNjcmlwdGlvbk51bWJlcj86IHN0cmluZywgcGluPzogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdGhpcy5hbC5kYXRhU3RvcmUuc2F2ZVN1YnNjcmlwdGlvbk51bWJlckFuZFBJTihzdWJzY3JpcHRpb25OdW1iZXIsIHBpbilcbiAgICBpZiAoc3Vic2NyaXB0aW9uTnVtYmVyICYmIHBpbikge1xuICAgICAgdGhpcy5hbC5zdWJzY3JpcHRpb25EZXRhaWxzID0gYXdhaXQgdGhpcy5hbC5zZXJ2aWNlQWRtaW5BcGkuc2lnbkluQXN5bmMoc3Vic2NyaXB0aW9uTnVtYmVyLCBwaW4pXG4gICAgICBpZiAodGhpcy5hbC5zdWJzY3JpcHRpb25EZXRhaWxzLmVycm9yKSB7XG4gICAgICAgIHRoaXMudWkuc2hvd01lc3NhZ2VPblBhbmVsKHRoaXMuYWwuc3Vic2NyaXB0aW9uRGV0YWlscy5lcnJvci5lcnJvclRleHQpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9UaGUgZGV0YWlscyBhcmUgaW4gdGhlIGFwcCBsb2dpYyBmb3IgbmV4dCBzY3JlZW5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51aS5zaG93TWVzc2FnZU9uUGFuZWwoYE5vIHN1YnNjcmlwdGlvbiBudW1iZXIgKCR7c3Vic2NyaXB0aW9uTnVtYmVyfSkgb3IgUElOICgke3Bpbn0pIGRlZmluZWRgKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIG9uUGFnZVNob3coKSB7XG4gICAgY29uc3QgYXBwRGF0YTogSUFwcERhdGEgPSB0aGlzLmFsLmRhdGFTdG9yZS5nZXRBcHBEYXRhKClcbiAgICAvLyBSZXRyaWV2ZSBzYXZlZCBzdWJzY3JpcHRpb24gbnVtYmVyIGFuZCBQSU4gZnJvbSBsb2NhbCBzdG9yZVxuICAgIGlmIChhcHBEYXRhLnN1YnNjcmlwdGlvbk51bWJlcikgdGhpcy51aS5zZXRTdWJzY3JpcHRpb25OdW1iZXIoYXBwRGF0YS5zdWJzY3JpcHRpb25OdW1iZXIpXG4gICAgaWYgKCF0aGlzLmFsLmFyZVdlT25UaXplbikgdGhpcy51aS5oaWRlRXhpdCgpXG4gICAgLy8gY29uc29sZS5sb2coXCJBZG1pbiBTaWduSW4gUGFnZSBzaG93blwiKVxuICB9XG4gIG9uVGhlbWUodGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuYWwudGhlbWUgPSB0aFxuICAgIHRoaXMudWkuY2hhbmdlVGhlbWUodGgpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN1YnNjcmlwdGlvblBhZ2VDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlcjxJU3Vic2NyaXB0aW9uUGFnZVVJPiBpbXBsZW1lbnRzIElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IoYWw6IElBcHBMb2dpYykgeyBzdXBlcihhbCkgfVxuICBvblBhZ2VTaG93KCkge1xuICAgIHRoaXMudWkuc2hvd1N1YnNjcmlwdGlvbkRldGFpbHModGhpcy5hbC5zdWJzY3JpcHRpb25EZXRhaWxzKVxuICAgIGNvbnNvbGUubG9nKFwiU3Vic2NyaXB0aW9uIFBhZ2Ugc2hvd25cIilcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVXNlcnNQYWdlQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXI8SVVzZXJzUGFnZVVJPiBpbXBsZW1lbnRzIElVc2Vyc1BhZ2VDb250cm9sbGVyIHtcbiAgY29uc3RydWN0b3IoYWw6IElBcHBMb2dpYykgeyBzdXBlcihhbCkgfVxuICBvblBhZ2VTaG93KCkge1xuICAgIHRoaXMudWkuc2hvd1VzZXJzKHRoaXMuYWwuc3Vic2NyaXB0aW9uRGV0YWlscy51c2VycylcbiAgfVxuICBvbkRlbGV0ZVVzZXJDbGlja2VkKHVzZXI6c3RyaW5nKTp2b2lkIHtcbiAgICB0aGlzLmFsLnVzZXJUb0JlRGVsZXRlZCA9IHVzZXJcbiAgICB0aGlzLnVpLnNob3dEZWxldGVVc2VyQ29uZmlybWF0aW9uKHVzZXIpXG4gIH1cbiAgLy9AdHMtaWdub3JlIC8vVE9ETyBUbyBpbXBsZW1lbnQgdXNlciBkZWxldGlvblxuICBhc3luYyBvbkRlbGV0ZVVzZXJDb25maXJtZWRBc3luYyh1c2VyOnN0cmluZyl7XG4gICAgY29uc3QgZGV0YWlscyA9IGF3YWl0IHRoaXMuYWwuc2VydmljZUFkbWluQXBpLmRlbGV0ZVVzZXJBc3luYyh1c2VyKVxuICAgIHRoaXMudWkuc2hvd1VzZXJzKGRldGFpbHMudXNlcnMpIC8vVG8gc2hvdyB0aGUgcmVzdWx0cyBvZiB0aGUgZGVsZXRpb24gb3Igb3RoZXIgaW50ZXJtaXR0ZW50IGRhdGFiYXNlIGNoYW5nZXNcbiAgfVxufSIsImltcG9ydCB7QXBwTG9naWN9IGZyb20gXCIuL2FwcGxvZ2ljXCJcbm5ldyBBcHBMb2dpYygpXG4iLCJpbXBvcnQge29wZW5KUU1QYW5lbCwgY2hhbmdlUGFnZSxcbiAgc2V0SFRNTEVsZW1lbnRUZXh0LCBnZXRIVE1MRWxlbWVudFZhbCwgc2V0SFRNTEVsZW1lbnRWYWwsIH0gZnJvbSBcIi4vdXRpbHNcIlxuaW1wb3J0IHt1cGRhdGVUaGVtZU9uQWN0aXZlUGFnZX0gZnJvbSBcIi4vdGhlbWVjaGFuZ2VyXCJcbmltcG9ydCB7XG4gIElBZG1pblNpZ25JblBhZ2VVSSwgSUFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIsIElDb250cm9sbGVyLCBJUGFnZVVJLFxuICBJU3Vic2NyaXB0aW9uRGV0YWlscywgSVN1YnNjcmlwdGlvblBhZ2VVSSwgSVN1YnNjcmlwdGlvUGFnZUNvbnRyb2xsZXIsXG4gIElVc2Vyc1BhZ2VDb250cm9sbGVyLCBJVXNlcnNQYWdlVUksXG59IGZyb20gXCIuL2ludGVyZmFjZXNcIlxuXG5leHBvcnQgY2xhc3MgUGFnZVVJPENUUiBleHRlbmRzIElDb250cm9sbGVyPElQYWdlVUk+PiBpbXBsZW1lbnRzIElQYWdlVUkge1xuICBwcml2YXRlIHJlYWRvbmx5IF9wYWdlOiBIVE1MRWxlbWVudFxuICBwcml2YXRlIHJlYWRvbmx5IF9jdHJsOiBDVFJcbiAgZ2V0IHBhZ2UoKTogSFRNTEVsZW1lbnQgeyByZXR1cm4gdGhpcy5fcGFnZSB9XG4gIGdldCBjdHJsKCk6IENUUiB7IGlmICh0aGlzLl9jdHJsKSByZXR1cm4gdGhpcy5fY3RybDsgZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJObyBDb250cm9sbGVyIGRlZmluZWQgZm9yIFVJIG9iamVjdFwiKSB9XG4gIGNvbnN0cnVjdG9yKHBhZ2U6IEhUTUxFbGVtZW50LCBjdHJsOiBDVFIpIHtcbiAgICB0aGlzLl9wYWdlID0gcGFnZVxuICAgIHRoaXMuX2N0cmwgPSBjdHJsXG4gICAgdGhpcy5fY3RybC51aSA9IHRoaXMgLy8gVGhpcyBpcyB0ZXJyaWJseSBpbXBvcnRhbnQgdG8gcGFzcyB0aGUgVUkgb2JqZWN0IHRvIHRoZSBjb250cm9sbGVyXG4gIH1cbiAgY2hhbmdlVGhlbWUodGhlbWU6IHN0cmluZykge1xuICAgIC8vdHMtaWdub3JlIC8vVE9ETyBzZWUgaHR0cHM6Ly9hcGkuanF1ZXJ5bW9iaWxlLmNvbS8xLjQvcGFnZS8jb3B0aW9uLXRoZW1lXG4gICAgLy8gJChcIiNcIiArIHRoaXMucGFnZS5pZCkucGFnZShcIm9wdGlvblwiLCBcInRoZW1lXCIsIHRoZW1lKVxuICAgIHVwZGF0ZVRoZW1lT25BY3RpdmVQYWdlKHRoZW1lKVxuICB9XG4gIHNob3dMb2FkaW5nSW5kaWNhdG9yKCkge1xuICAgICQubW9iaWxlLmxvYWRpbmcoXCJzaG93XCIsIHsgdGV4dDogXCJMb2FkaW5nLi4uXCIsIHRleHRWaXNpYmxlOiB0cnVlLCB0aGVtZTogXCJiXCIsIH0pO1xuICB9XG4gIGhpZGVMb2FkaW5nSW5kaWNhdG9yKCkgeyAkLm1vYmlsZS5sb2FkaW5nKFwiaGlkZVwiKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBBZG1pblNpZ25JblBhZ2VVSSBleHRlbmRzIFBhZ2VVSTxJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlcj4gaW1wbGVtZW50cyBJQWRtaW5TaWduSW5QYWdlVUkge1xuICBjb25zdHJ1Y3RvcihwYWdlOiBIVE1MRWxlbWVudCwgY3RybDogSUFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIpIHtcbiAgICBzdXBlcihwYWdlLCBjdHJsKVxuICAgICQoXCIjc2lnbkluXCIpLm9uKFwiY2xpY2tcIiwgYXN5bmMgKGUpID0+IHtcbiAgICAgIC8vIFRoaXMgZnVuY3Rpb24gY2FuIGJlIGRlY2xhcmVkIGFzeW5jIGJ1dCB0aGUgYnJvd3NlciBoYW5kbGVyIHdpbGwgbm90IGJsb2NrXG4gICAgICAvLyB0aGUgZXhlY3V0aW9uIG9mIHRoZSBjb2RlLiBTbyB3aGVuIHdvcmtpbmcgd2l0aCBhc3luYyBjYWxsc1xuICAgICAgLy8gVGhlIG5hdmlnYXRpb24gdG8gdGhlIG5leHQgcGFnZSBoYXMgdG8gYmUgZG9uZSBtYW51YWxseVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpIC8vIFRoaXMgaXMgYW5vdGhlciB3YXkgdG8gYmxvY2sgZGVmYXVsdCBIVE1MIGhhbmRsaW5nXG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnNob3dMb2FkaW5nSW5kaWNhdG9yKClcbiAgICAgICAgaWYgKGF3YWl0IHRoaXMuY3RybC5vblNpZ25JbkFzeW5jKFxuICAgICAgICAgIGdldEhUTUxFbGVtZW50VmFsKFwiI3N1YnNjcmlwdGlvbk51bWJlclwiKSxcbiAgICAgICAgICBnZXRIVE1MRWxlbWVudFZhbChcIiNwaW5cIikpKSB7XG4gICAgICAgICAgLy8gPGEgaHJlZj1cIiNzdWJzY3JpcHRpb25cIiBkYXRhLXRyYW5zaXRpb249XCJzbGlkZVwiIGRhdGEtcm9sZT1cImJ1dHRvblwiIGlkPVwic2lnbkluXCI+U2lnbiBJbjwvYT5cbiAgICAgICAgICBjaGFuZ2VQYWdlKFwiI3N1YnNjcmlwdGlvblwiLCB7IHRyYW5zaXRpb246IFwic2xpZGVcIiB9KVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLmhpZGVMb2FkaW5nSW5kaWNhdG9yKClcbiAgICAgIH1cbiAgICB9KVxuICAgICQocGFnZSkub24oXCJwYWdlYmVmb3Jlc2hvd1wiLCAoKSA9PiB7IC8vRGVwcmVjYXRlZCBhcyBvZiAxLjQuMCwgSG1tbVxuICAgICAgdGhpcy5jdHJsLm9uUGFnZVNob3coKVxuICAgIH0pXG4gICAgJChcIiNleGl0XCIpLm9uKFwiY2xpY2tcIiwgKC8qZSovKSA9PiB7XG4gICAgICAvL2UucHJldmVudERlZmF1bHQoKSAvLyBUaGlzIGlzIGFub3RoZXIgd2F5IHRvIGJsb2NrIGRlZmF1bHQgSFRNTCBoYW5kbGluZ1xuICAgICAgcmV0dXJuIHRoaXMuY3RybC5vbkV4aXQoKVxuICAgIH0pXG4gICAgJChcIiN0aGVtZUFcIikub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuY3RybC5vblRoZW1lKFwiYVwiKSB9KVxuICAgICQoXCIjdGhlbWVCXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4geyB0aGlzLmN0cmwub25UaGVtZShcImJcIikgfSlcbiAgICAkKFwiI3RoZW1lQ1wiKS5vbihcImNsaWNrXCIsICgpID0+IHsgdGhpcy5jdHJsLm9uVGhlbWUoXCJjXCIpIH0pXG4gICAgY29uc29sZS5sb2coXCJBZG1pblNpZ25JblBhZ2VVSSBjb25zdHJ1Y3RlZFwiKVxuICB9XG4gIHNldFN1YnNjcmlwdGlvbk51bWJlcihuOiBzdHJpbmcpIHtcbiAgICBzZXRIVE1MRWxlbWVudFZhbChcIiNzdWJzY3JpcHRpb25OdW1iZXJcIiwgbilcbiAgfVxuICBzaG93TWVzc2FnZU9uUGFuZWwobXNnOiBzdHJpbmcpIHtcbiAgICBzZXRIVE1MRWxlbWVudFRleHQoXCIjYWRtaW5TaWduSW5NZXNzYWdlXCIsIG1zZylcbiAgICAvLyAkLm1vYmlsZS5jaGFuZ2VQYWdlKFwiI2FkbWluU2lnbkluUGFuZWxcIikgLy8gVGhpcyB3b24ndCB3b3JrIHdpdGggcGFuZWxzIHNlZSBodHRwczovL2FwaS5qcXVlcnltb2JpbGUuY29tL3BhbmVsL1xuICAgIG9wZW5KUU1QYW5lbChcIiNhZG1pblNpZ25JblBhbmVsXCIpXG4gICAgLy8kKCBcIiNteXBhbmVsXCIgKS50cmlnZ2VyKCBcInVwZGF0ZWxheW91dFwiICkgLy9NYXliZSB0aGlzIGlzIHJlcXVpcmVkLCB0b29cbiAgfVxuICBoaWRlRXhpdCgpOiB2b2lkIHtcbiAgICAkKFwiI2V4aXRcIikuaGlkZSgpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN1YnNjcmlwdGlvblBhZ2VVSSBleHRlbmRzIFBhZ2VVSTxJU3Vic2NyaXB0aW9QYWdlQ29udHJvbGxlcj4gaW1wbGVtZW50cyBJU3Vic2NyaXB0aW9uUGFnZVVJIHtcbiAgY29uc3RydWN0b3IocGFnZTogSFRNTEVsZW1lbnQsIGN0cmw6IElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyKSB7XG4gICAgc3VwZXIocGFnZSwgY3RybClcbiAgICAkKHBhZ2UpLm9uKFwicGFnZWJlZm9yZXNob3dcIiwgKCkgPT4geyAvL0RlcHJlY2F0ZWQgYXMgb2YgMS40LjAsIEhtbW1cbiAgICAgIHRoaXMuY3RybC5vblBhZ2VTaG93KClcbiAgICB9KVxuICB9XG4gIHNob3dTdWJzY3JpcHRpb25EZXRhaWxzKGRldGFpbHM6IElTdWJzY3JpcHRpb25EZXRhaWxzKTogdm9pZCB7XG4gICAgc2V0SFRNTEVsZW1lbnRUZXh0KFwiI251bWJlck9mbGljZW5zZXNcIiwgXCJcIiArIGRldGFpbHMubGljZW5zZXMpXG4gICAgc2V0SFRNTEVsZW1lbnRUZXh0KFwiI251bWJlck9mVXNlcnNcIiwgXCJcIiArIGRldGFpbHMudXNlcnM/Lmxlbmd0aClcbiAgICBzZXRIVE1MRWxlbWVudFRleHQoXCIjbnVtYmVyT2ZQcm9maWxlc1wiLCBcIlwiICsgZGV0YWlscy5wcm9maWxlcz8ubGVuZ3RoKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVc2Vyc1BhZ2VVSSBleHRlbmRzIFBhZ2VVSTxJVXNlcnNQYWdlQ29udHJvbGxlcj4gaW1wbGVtZW50cyBJVXNlcnNQYWdlVUkge1xuICBjb25zdHJ1Y3RvcihwYWdlOiBIVE1MRWxlbWVudCwgY3RybDogSVVzZXJzUGFnZUNvbnRyb2xsZXIpIHtcbiAgICBzdXBlcihwYWdlLCBjdHJsKVxuICAgICQocGFnZSkub24oXCJwYWdlYmVmb3Jlc2hvd1wiLCAoKSA9PiB7IHRoaXMuY3RybC5vblBhZ2VTaG93KCkgfSlcbiAgICAkKFwiI3VzZXJMaXN0XCIpLm9uKFwiY2xpY2tcIiwgKGUpID0+IHsgLy9BbHdheXMgdXNlIGZhdCBhcnJvdyB0byBnZXQgcHJvcGVyIHRoaXMgaGFuZGxpbmdcbiAgICAgIGNvbnNvbGUubG9nKFwidXNlciBsaXN0IGNsaWNrIGZvciBcIiwgZSlcbiAgICAgIC8vICQoXCIjdXNlclRvRGVsZXRlXCIpLnRleHQoZS50YXJnZXQudGV4dClcbiAgICAgIC8vQHRzLWlnbm9yZSAvL1RPRE8gV2UgYXJlIHN1cmUgaXQgd29ya3Mgc2luY2Ugd2UgaGF2ZSBkZWZpbmVkIGRhdGEtdXNlci1pZCBmb3IgZWFjaCB1c2VycyBhZGRlZCB0byB0aGUgbGlzdFxuICAgICAgLy8gJChcIiN1c2VyVG9EZWxldGVcIikudGV4dChlLnRhcmdldC5kYXRhc2V0LnVzZXJJZClcbiAgICAgIHRoaXMuY3RybC5vbkRlbGV0ZVVzZXJDbGlja2VkKGUudGFyZ2V0LmRhdGFzZXQudXNlcklkKVxuICAgIH0pXG4gICAgJChcIiN1c2VyRGVsZXRpb25Db25maXJtZWRcIikub24oXCJjbGlja1wiLCBhc3luYyAoLyplKi8pID0+IHsgLy9BbHdheXMgdXNlIGZhdCBhcnJvdyB0byBnZXQgcHJvcGVyIHRoaXMgaGFuZGxpbmdcbiAgICAgIC8vIGUucHJldmVudERlZmF1bHQoKSAvLyBObyBuZWVkIHRvIGJsb2NrIGRlZmF1bHQgSFRNTCBoYW5kbGluZywgaXQncyBmaW5lIHRoYXQgdGhlIGNvbmZpcm1hdGlvbiBwYW5lbCBpcyBhdXRvbWF0aWNhbGx5IGNsb3NlZFxuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5zaG93TG9hZGluZ0luZGljYXRvcigpXG4gICAgICAgIGlmICh0aGlzLmN0cmwuYWwudXNlclRvQmVEZWxldGVkKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5jdHJsLm9uRGVsZXRlVXNlckNvbmZpcm1lZEFzeW5jKHRoaXMuY3RybC5hbC51c2VyVG9CZURlbGV0ZWQpXG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuaGlkZUxvYWRpbmdJbmRpY2F0b3IoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgc2hvd1VzZXJzKHVzZXJMaXN0OiBzdHJpbmdbXSk6IHZvaWQge1xuICAgIGNvbnN0IHVzZXJzSHRtbCA9IHVzZXJMaXN0LnJlZHVjZSgoYSwgdSkgPT4gYSArPSBgXG4gICAgPGxpIGRhdGEtaWNvbj1cImRlbGV0ZVwiPjxhIGhyZWY9XCIjZGVsZXRlVXNlclwiIGRhdGEtcmVsPVwicG9wdXBcIiBkYXRhLXBvc2l0aW9uLXRvPVwid2luZG93XCIgZGF0YS10cmFuc2l0aW9uPVwicG9wXCJcbiAgICAgICAgICBkYXRhLXVzZXItaWQ9XCIke3V9XCI+JHt1fTwvYT5cbiAgICA8L2xpPiAgICAgIFxuICAgIGAsIFwiXCIpXG4gICAgJChcIiN1c2VyTGlzdFwiKS5odG1sKHVzZXJzSHRtbCkubGlzdHZpZXcoXCJyZWZyZXNoXCIpXG4gIH1cbiAgc2hvd0RlbGV0ZVVzZXJDb25maXJtYXRpb24odXNlcjogc3RyaW5nKTogdm9pZCB7XG4gICAgJChcIiN1c2VyVG9EZWxldGVcIikudGV4dCh1c2VyKVxuICAgIC8vVGhlIGNvbmZpcm1hdGlvbiBkaWFsb2cgaXMgYXV0b21hdGljYWxseSBvcGVuZWQgc2luY2UgdGhlIExJIGVsZW1lbnRzIGFsbCBoYXZlIHRoZSBocmVmPSNkZWxldGVVc2VyXG4gIH1cblxufVxuIiwiLy8gZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzI2NTI0MzNcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVUaGVtZU9uQWN0aXZlUGFnZShuZXdUaGVtZTpzdHJpbmcpIHtcbiAgbGV0IHJtYnRuQ2xhc3NlcyA9ICcnO1xuICBsZXQgcm1oZkNsYXNzZXMgPSAnJztcbiAgbGV0IHJtYmRDbGFzc2VzcyA9ICcnO1xuICBjb25zdCBhcnIgPSBbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJywgJ2onLCAnaycsICdsJywgJ20nLCAnbicsICdvJywgJ3AnLCAncScsICdyJywgJ3MnXTsgLy8gSSBoYWQgdGhlbWVzIGZyb20gYSB0byBzXG4gIC8vQHRzLWlnbm9yZSAvL1RPRE8gaW5kZXggaXMgbm90IHVzZWQsIGJ1dCBJIGRvbid0IHdhbnQgdG8gY2hhbmdlIGl0XG4gICQuZWFjaChhcnIsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZTpzdHJpbmcpIHtcbiAgICAgIHJtYnRuQ2xhc3NlcyA9IHJtYnRuQ2xhc3NlcyArICcgdWktYnRuLXVwLScgKyB2YWx1ZSArICcgdWktYnRuLWhvdmVyLScgKyB2YWx1ZTtcbiAgICAgIHJtaGZDbGFzc2VzID0gcm1oZkNsYXNzZXMgKyAnIHVpLWJhci0nICsgdmFsdWU7XG4gICAgICBybWJkQ2xhc3Nlc3MgPSBybWJkQ2xhc3Nlc3MgKyAnIHVpLWJvZHktJyArIHZhbHVlICsgJyB1aS1wYWdlLXRoZW1lLScrIHZhbHVlO1xuICB9KTtcbiAgLy8gcmVzZXQgYWxsIHRoZSBidXR0b25zIHdpZGdldHNcbiAgJC5tb2JpbGUuYWN0aXZlUGFnZS5maW5kKCcudWktYnRuJykubm90KCcudWktbGktZGl2aWRlcicpLnJlbW92ZUNsYXNzKHJtYnRuQ2xhc3NlcykuYWRkQ2xhc3MoJ3VpLWJ0bi11cC0nICsgbmV3VGhlbWUpLmF0dHIoJ2RhdGEtdGhlbWUnLCBuZXdUaGVtZSk7XG4gIC8vIHJlc2V0IHRoZSBoZWFkZXIvZm9vdGVyIHdpZGdldHNcbiAgJC5tb2JpbGUuYWN0aXZlUGFnZS5maW5kKCcudWktaGVhZGVyLCAudWktZm9vdGVyJykucmVtb3ZlQ2xhc3Mocm1oZkNsYXNzZXMpLmFkZENsYXNzKCd1aS1iYXItJyArIG5ld1RoZW1lKS5hdHRyKCdkYXRhLXRoZW1lJywgbmV3VGhlbWUpO1xuICAvLyByZXNldCB0aGUgcGFnZSB3aWRnZXRcbiAgJC5tb2JpbGUuYWN0aXZlUGFnZS5yZW1vdmVDbGFzcyhybWJkQ2xhc3Nlc3MpLmFkZENsYXNzKCd1aS1ib2R5LScgKyBuZXdUaGVtZSArICcgdWktcGFnZS10aGVtZS0nKyBuZXdUaGVtZSkuYXR0cignZGF0YS10aGVtZScsIG5ld1RoZW1lKTtcbiAgLy8gdGFyZ2V0IHRoZSBsaXN0IGRpdmlkZXIgZWxlbWVudHMsIHRoZW4gaXRlcmF0ZSB0aHJvdWdoIHRoZW0gYW5kXG4gIC8vIGNoYW5nZSBpdHMgdGhlbWUgKHRoaXMgaXMgdGhlIGpRdWVyeSBNb2JpbGUgZGVmYXVsdCBmb3JcbiAgLy8gbGlzdC1kaXZpZGVycylcbiAgLy9AdHMtaWdub3JlIC8vVE9ETyBpbmRleCBhbmQgb2JqIGFyZSBub3QgdXNlZFxuICAkLm1vYmlsZS5hY3RpdmVQYWdlLmZpbmQoJy51aS1saS1kaXZpZGVyJykuZWFjaChmdW5jdGlvbihpbmRleCwgb2JqKSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKHJtaGZDbGFzc2VzKS5hZGRDbGFzcygndWktYmFyLScgKyBuZXdUaGVtZSkuYXR0cignZGF0YS10aGVtZScsIG5ld1RoZW1lKTtcbiAgfSk7XG59OyIsIi8vPT09PT09PT09PT09PT09PT09PT0gVVRJTElUWSBGVU5DVElPTlMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5leHBvcnQgZnVuY3Rpb24gb3BlbkpRTVBhbmVsKHBhbmVsSWQ6c3RyaW5nKSB7XG4gIGNvbnN0IHA6SlF1ZXJ5PEhUTUxFbGVtZW50PiA9ICQocGFuZWxJZClcbiAgLy9AdHMtaWdub3JlIC8vVE9ETyBUaGUgcGFuZWwoKSBpcyBub3QgZGVjbGFyZWQsIHVuZm9ydHVuYXRlbHksIGluIEpRTSB0eXBlcywgYnV0IHdvcmtzIGZpbmVcbiAgcC5wYW5lbChcIm9wZW5cIilcbn1cbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VQYWdlKHBhZ2VJZDpzdHJpbmcsb3B0aW9ucz86Q2hhbmdlUGFnZU9wdGlvbnMpOnZvaWQge1xuICAkLm1vYmlsZS5jaGFuZ2VQYWdlKHBhZ2VJZCxvcHRpb25zKVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNldEhUTUxFbGVtZW50VGV4dChpZDpzdHJpbmcsIHM6c3RyaW5nKSB7XG4gIGNvbnN0IGUgPSAkKGlkKVxuICBpZihlLmxlbmd0aCkgZS50ZXh0KHMpXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yKGBObyBlbGVtZW50IGZvdW5kIHdpdGggSUQgJHtpZH1gKVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEhUTUxFbGVtZW50VmFsKGlkOnN0cmluZyk6c3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgZSA9ICQoaWQpXG4gIGlmKGUubGVuZ3RoKSByZXR1cm4gZS52YWwoKT8udG9TdHJpbmcoKVxuICBlbHNlIHRocm93IG5ldyBFcnJvcihgTm8gZWxlbWVudCBmb3VuZCB3aXRoIElEICR7aWR9YClcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRIVE1MRWxlbWVudFZhbChpZDpzdHJpbmcsIHM6c3RyaW5nKTp2b2lkIHtcbiAgY29uc3QgZSA9ICQoaWQpXG4gIGlmKGUubGVuZ3RoKSBlLnZhbChzKVxuICBlbHNlIHRocm93IG5ldyBFcnJvcihgTm8gZWxlbWVudCBmb3VuZCB3aXRoIElEICR7aWR9YClcbn1cbmV4cG9ydCBmdW5jdGlvbiBzbGVlcEFzeW5jKG1zOm51bWJlcik6UHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn0iXX0=
