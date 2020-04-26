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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwbG9naWMudHMiLCJzcmMvanMvY29udHJvbGxlcnMudHMiLCJzcmMvanMvbWFpbi50cyIsInNyYy9qcy9wYWdlcy50cyIsInNyYy9qcy90aGVtZWNoYW5nZXIudHMiLCJzcmMvanMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLG1DQUFrQztBQUNsQyxpREFBc0Q7QUFFdEQsK0NBQTBHO0FBQzFHLG1DQUE2RTtBQUM3RSw0Q0FBNEM7QUFFNUMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFBO0FBQzFCLE1BQU0sU0FBUztJQUNiLDRCQUE0QixDQUFDLGtCQUEyQixFQUFFLEdBQVk7UUFDcEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFBO1FBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDeEIsQ0FBQztJQUNELFdBQVcsQ0FBQyxJQUFjO1FBQ3hCLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUN0RCxDQUFDO0lBQ0QsVUFBVTtRQUNSLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDeEMsSUFBSSxDQUFDLEVBQUU7WUFDTCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3ZCLElBQUksQ0FBQztnQkFBRSxPQUFPLENBQWEsQ0FBQTtTQUM1QjtRQUNELE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7Ozs7OztFQVlFO0FBQ0YsTUFBYSxRQUFRO0lB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LGFBQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSwwQ0FBRSxRQUFRLEdBQUU7O1FBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDeEQsQ0FBQztBQUpELDhDQUlDO0FBQ0QsU0FBZ0IsaUJBQWlCLENBQUMsRUFBUyxFQUFFLENBQVE7SUFDbkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ2YsSUFBRyxDQUFDLENBQUMsTUFBTTtRQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7O1FBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDeEQsQ0FBQztBQUpELDhDQUlDO0FBQ0QsU0FBZ0IsVUFBVSxDQUFDLEVBQVM7SUFDbEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRkQsZ0NBRUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQge3NsZWVwQXN5bmN9IGZyb20gXCIuL3V0aWxzXCJcclxuaW1wb3J0IHt1cGRhdGVUaGVtZU9uQWN0aXZlUGFnZX0gZnJvbSBcIi4vdGhlbWVjaGFuZ2VyXCJcclxuaW1wb3J0IHsgSUFwcERhdGEsIElEYXRhU3RvcmUsIElBcHBMb2dpYywgSVNlcnZpY2VBZG1pbiwgSVN1YnNjcmlwdGlvbkRldGFpbHMgfSBmcm9tIFwiLi9pbnRlcmZhY2VzXCJcclxuaW1wb3J0IHsgQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlciwgU3Vic2NyaXB0aW9uUGFnZUNvbnRyb2xsZXIsIFVzZXJzUGFnZUNvbnRyb2xsZXIgfSBmcm9tIFwiLi9jb250cm9sbGVyc1wiXHJcbmltcG9ydCB7IEFkbWluU2lnbkluUGFnZVVJLCBTdWJzY3JpcHRpb25QYWdlVUksIFVzZXJzUGFnZVVJLCB9IGZyb20gXCIuL3BhZ2VzXCJcclxuLy8gaW1wb3J0IHRoZW1lQ2hhbmdlciBmcm9tIFwiLi90aGVtZWNoYW5nZXJcIlxyXG5cclxuY29uc3QgU1RPUkVLRVkgPSBcIkFwcERhdGFcIlxyXG5jbGFzcyBEYXRhU3RvcmUgaW1wbGVtZW50cyBJRGF0YVN0b3JlIHtcclxuICBzYXZlU3Vic2NyaXB0aW9uTnVtYmVyQW5kUElOKHN1YnNjcmlwdGlvbk51bWJlcj86IHN0cmluZywgcGluPzogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBkYXRhID0gdGhpcy5nZXRBcHBEYXRhKClcclxuICAgIGRhdGEucGluID0gcGluXHJcbiAgICBkYXRhLnN1YnNjcmlwdGlvbk51bWJlciA9IHN1YnNjcmlwdGlvbk51bWJlclxyXG4gICAgdGhpcy5zYXZlQXBwRGF0YShkYXRhKVxyXG4gIH1cclxuICBzYXZlQXBwRGF0YShkYXRhOiBJQXBwRGF0YSkge1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oU1RPUkVLRVksIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxyXG4gIH1cclxuICBnZXRBcHBEYXRhKCk6IElBcHBEYXRhIHtcclxuICAgIGNvbnN0IHYgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTVE9SRUtFWSlcclxuICAgIGlmICh2KSB7XHJcbiAgICAgIGNvbnN0IG8gPSBKU09OLnBhcnNlKHYpXHJcbiAgICAgIGlmIChvKSByZXR1cm4gbyBhcyBJQXBwRGF0YVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHt9XHJcbiAgfVxyXG59XHJcblxyXG4vKlxyXG5XaGVuIGFwcCBpcyBsb2FkZWQsIGNoZWNrIGlmIHRoZXJlIGlzIHNhdmVkIHN1YnNjcmlwdGlvbiBudW1iZXIgYW5kIHVzZXIsIGlmIHRoZXJlIGlzIHJlbG9hZCBpdFxyXG5cclxuV2hlbiB1c2VyIHByZXNzZXMgc2lnbiBpbiwgaXQgdHJpZXMgdG8gY29ubmVjdCB0byBmaXJlYmFzZSBzZXJ2aWNlLCB2aWEgYXV0aGVudGljYXRpb24gXHJcbnRvIGZpbmQgaWYgdGhlIHNlcnZpY2UgaXNhY3RpdmUgYW5kIHRoZSBQSU4gaXMgb2ssIG9yIGp1c3QgdXNlIEZCIGF1dGhlbnRpY2F0aW9uLlxyXG5cclxuV2hlbiBwYWdlIGlzIGluaXRpYWxpemVkIHdlIGNyZWF0ZSBhbiBvYmplY3QgZnJvbSBhIGNvbnRyb2xsZXIgY2xhc3MuXHJcbldlIG5lZWQgdHdvIGludGVyZmFjZXMsIG9uZSBmb3IgdGhlIHNjcmVlbiBmb3IgY29tbWFuZHMgdG8gc2hvdyBkYXRhXHJcbkFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBhcHBsaWNhdGlvbiBjb250cm9sbGVyIHRvIHJlY2VpdmUgZXZlbnRzIGZyb20gdGhlIHBhZ2UuXHJcblRoZXNlIHR3byBpbnRlcmZhY2VzIGZvcm1hbGx5IGRlZmluZSB0aGUgY29udHJhY3QgYmV0d2VlbiB0aGUgY29tbXVuaWNhdGlvbiBwcm90b2NvbCBiZXR3ZWVuIHRoZSBVSVxyXG5hbmQgdGhlIGFwcCBsb2dpYy9jb250cm9sbGVyLlxyXG5FdmVyeSBVSSBvYmplY3QgaXMgYSBtZXNzYWdlIGRpc3BhdGNoZXIgdGhhdCBpcyByZWdpc3RlcmVkIGl0cyBsaXN0ZW5lcnMgd2l0aCBKUSBmb3IgdGhlIGFwcHJvcHJpYXRlIG9iamVjdC5cclxuKi9cclxuZXhwb3J0IGNsYXNzIEFwcExvZ2ljIGltcGxlbWVudHMgSUFwcExvZ2ljIHtcclxuICAvLyBwcml2YXRlIF9hZG1pblNpZ25Jbj86IEFkbWluU2lnbkluUGFnZVVJXHJcbiAgLy8gc2V0IGFkbWluU2lnbkluKHY6IEFkbWluU2lnbkluUGFnZVVJKSB7IHRoaXMuX2FkbWluU2lnbkluID0gdiB9XHJcbiAgLy8gZ2V0IGFkbWluU2lnbkluKCk6IEFkbWluU2lnbkluUGFnZVVJIHsgaWYgKHRoaXMuX2FkbWluU2lnbkluKSByZXR1cm4gdGhpcy5fYWRtaW5TaWduSW47IGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiTm8gQWRtaW5TaWduSW5QYWdlVUlcIikgfVxyXG4gIGRhdGFTdG9yZTogSURhdGFTdG9yZSA9IG5ldyBEYXRhU3RvcmUoKVxyXG4gIHNlcnZpY2VBZG1pbkFwaTogSVNlcnZpY2VBZG1pbiA9IG5ldyBEZW1vU2VydmljZUFkbWluSW1wbCgpXHJcbiAgc3Vic2NyaXB0aW9uRGV0YWlsczogSVN1YnNjcmlwdGlvbkRldGFpbHMgPSB7fVxyXG4gIHRoZW1lOiBzdHJpbmcgPSBcImJcIlxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5pbml0VGl6ZW5IV0tleUhhbmRsZXIodGhpcylcclxuICAgICQoZG9jdW1lbnQpLm9uKFwicGFnZWluaXRcIiwgKGUpID0+IHRoaXMub25QYWdlSW5pdChlKSlcclxuICAgIC8vc2VlIGh0dHBzOi8vYXBpLmpxdWVyeW1vYmlsZS5jb20vMS40L3BhZ2ViZWZvcmVzaG93LyBJdCBpcyBkZXByZWNhdGVkIGFuZCBub3QgYXZhaWxhYmxlIGluIDEuNVxyXG4gICAgJChkb2N1bWVudCkub24oXCJwYWdlYmVmb3Jlc2hvd1wiLCAoZSkgPT4gdGhpcy5vblBhZ2VTaG93KGUpKVxyXG4gIH1cclxuICBvblBhZ2VTaG93KGU6IEpRdWVyeS5UcmlnZ2VyZWRFdmVudDxEb2N1bWVudCwgdW5kZWZpbmVkLCBEb2N1bWVudCwgRG9jdW1lbnQ+KSB7XHJcbiAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICB1cGRhdGVUaGVtZU9uQWN0aXZlUGFnZSh0aGlzLnRoZW1lKVxyXG4gICAgfVxyXG4gIH1cclxuICBvblBhZ2VJbml0KGU6IEpRdWVyeS5UcmlnZ2VyZWRFdmVudDxEb2N1bWVudCwgdW5kZWZpbmVkLCBEb2N1bWVudCwgRG9jdW1lbnQ+KSB7XHJcbiAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICBzd2l0Y2ggKGUudGFyZ2V0LmlkKSB7XHJcbiAgICAgICAgY2FzZSBcImFkbWluU2lnbkluXCI6XHJcbiAgICAgICAgICBuZXcgQWRtaW5TaWduSW5QYWdlVUkoZS50YXJnZXQsIG5ldyBBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyKHRoaXMpKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlIFwic3Vic2NyaXB0aW9uXCI6XHJcbiAgICAgICAgICBuZXcgU3Vic2NyaXB0aW9uUGFnZVVJKGUudGFyZ2V0LCBuZXcgU3Vic2NyaXB0aW9uUGFnZUNvbnRyb2xsZXIodGhpcykpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgXCJ1c2Vyc1wiOlxyXG4gICAgICAgICAgbmV3IFVzZXJzUGFnZVVJKGUudGFyZ2V0LCBuZXcgVXNlcnNQYWdlQ29udHJvbGxlcih0aGlzKSlcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgZ2V0IGFyZVdlT25UaXplbigpOiBib29sZWFuIHsgcmV0dXJuIHdpbmRvdy5oYXNPd25Qcm9wZXJ0eShcInRpemVuXCIpOyB9XHJcbiAgZXhpdEFwcCgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmlzSXRPa1RvRXhpdCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIC8vQHRzLWlnbm9yZSAvL1RPRE8gdG8gYmUgZml4ZWQgd2hlbiBoYXZlIFRpemVuIHR5cGUgZGVmaW5pdGlvbnNcclxuICAgICAgICB0aXplbi5hcHBsaWNhdGlvbi5nZXRDdXJyZW50QXBwbGljYXRpb24oKS5leGl0KCk7XHJcbiAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGdldCBpc0l0T2tUb0V4aXQoKTogYm9vbGVhbiB7IHJldHVybiB0cnVlIH1cclxuICBwcml2YXRlIGluaXRUaXplbkhXS2V5SGFuZGxlcihhbDogSUFwcExvZ2ljKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcImluaXRUaXplbkhXS2V5SGFuZGxlcjpcIiwgYEFyZSBXZSBvbiBUaXplbiAke2FsLmFyZVdlT25UaXplbn1gKVxyXG4gICAgaWYgKGFsLmFyZVdlT25UaXplbikge1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0aXplbmh3a2V5JywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAvL0B0cy1pZ25vcmUgLy9UT0RPIHRvIGJlIGZpeGVkIGxhdGVyXHJcbiAgICAgICAgaWYgKGUua2V5TmFtZSA9PSBcImJhY2tcIiAmJiBhbC5pc0l0T2tUb0V4aXQpIGFsLmV4aXRBcHAoKVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0IHVzZXJUb0JlRGVsZXRlZCgpOnN0cmluZyB8IG51bGwge1xyXG4gICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJ1c2VyVG9CZURlbGV0ZWRcIilcclxuICB9XHJcbiAgc2V0IHVzZXJUb0JlRGVsZXRlZCh1OnN0cmluZyB8IG51bGwpIHtcclxuICAgIGlmKHUpIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJ1c2VyVG9CZURlbGV0ZWRcIix1KVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgRGVtb1NlcnZpY2VBZG1pbkltcGwgaW1wbGVtZW50cyBJU2VydmljZUFkbWluIHtcclxuICBkYXRhOiBJU3Vic2NyaXB0aW9uRGV0YWlscyA9IHtcclxuICAgIGxpY2Vuc2VzOiA2LFxyXG4gICAgdXNlcnM6IFtcImpvaG5cIiwgXCJtYW5hZ2VyXCIsIFwib3R0b1wiLCBcImp3XCIsIFwicGJcIl0sXHJcbiAgICBwcm9maWxlczogW1xyXG4gICAgICB7IG5hbWU6IFwiVGVzdFwiLCBodHRwczogZmFsc2UsIGhvc3ROYW1lOiBcImJvdG9uZC1wY1wiLCBhcGlOYW1lOiBcImFwaVwiLCBwb3J0TnVtYmVyOiA1NjAwMCwgY29tcGFueURCOiBcIlNCT0RlbW9VU1wiLCBkaUFwaVVzZXI6IFwibWFuYWdlclwiLCBkaVVzZXJQYXNzd29yZDogXCIxMjNcIiB9LFxyXG4gICAgICB7IG5hbWU6IFwiUHJvZFwiLCBodHRwczogZmFsc2UsIGhvc3ROYW1lOiBcImJvdG9uZC1wY1wiLCBhcGlOYW1lOiBcImFwaVwiLCBwb3J0TnVtYmVyOiA1NjAwMCwgY29tcGFueURCOiBcIlNCT0RlbW9VU1wiLCBkaUFwaVVzZXI6IFwibWFuYWdlclwiLCBkaVVzZXJQYXNzd29yZDogXCIxMjNcIiB9LFxyXG4gICAgXVxyXG4gIH1cclxuICBhc3luYyBkZWxldGVVc2VyQXN5bmModXNlcjpzdHJpbmcpOlByb21pc2U8SVN1YnNjcmlwdGlvbkRldGFpbHM+e1xyXG4gICAgaWYodGhpcy5kYXRhLnVzZXJzKSB0aGlzLmRhdGEudXNlcnMgPSB0aGlzLmRhdGEudXNlcnMuZmlsdGVyKChlKSA9PiBlICE9IHVzZXIpXHJcbiAgICBhd2FpdCBzbGVlcEFzeW5jKDIwMDApXHJcbiAgICByZXR1cm4gdGhpcy5kYXRhXHJcbiAgfVxyXG5cclxuICBhc3luYyBzaWduSW5Bc3luYyhzdWJzY3JpcHRpb25OdW1iZXI6IHN0cmluZywgcGluOiBzdHJpbmcpOiBQcm9taXNlPElTdWJzY3JpcHRpb25EZXRhaWxzPiB7XHJcbiAgICBpZiAoc3Vic2NyaXB0aW9uTnVtYmVyLmluY2x1ZGVzKFwiOVwiKSAmJiBwaW4pIHtcclxuICAgICAgLy9IVFRQUyBkb2Vzbid0IHdvcmsgb24gZW11bGF0b3IgOigsIGF0IGxlYXN0IG5vdCBvbiBNYWMsIGJ1dCB3b3JrcyBmaW5lIG9uIHJlYWwgZGV2aWNlIFxyXG4gICAgICBjb25zdCB1cmwgPSBcImh0dHBzOi8vcmVxcmVzLmluL2FwaS91c2Vycz9kZWxheT0zXCJcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByID0gYXdhaXQgJC5hamF4KHsgbWV0aG9kOiBcIkdFVFwiLCB1cmwgfSlcclxuICAgICAgICAvL1RPRE8gVGhpcyBpcyBhbiBpbi1saW5lIHR5cGUgZGVmaW5pdGlvbiBmb3IgZnVuXHJcbiAgICAgICAgdGhpcy5kYXRhLnVzZXJzID0gci5kYXRhLm1hcCgoZTogeyBsYXN0X25hbWU6IHN0cmluZyB9KSA9PiBlLmxhc3RfbmFtZSlcclxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhICAgICAgICAgIFxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIHJldHVybiB7IGVycm9yOiB7IGVycm9yQ29kZTogZXJyb3Iuc3RhdHVzLCBlcnJvclRleHQ6IGBBamF4IGVycm9yICR7ZXJyb3Iuc3RhdHVzVGV4dH0gZm9yIFVSTCAke3VybH1gIH0gfSAgICAgICAgXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB7IGVycm9yOiB7IGVycm9yQ29kZTogMTAwMSwgZXJyb3JUZXh0OiBgSW52YWxpZCBzdWJzY3JpcHRpb24gbnVtYmVyICR7c3Vic2NyaXB0aW9uTnVtYmVyfSBIYXMgbm8gZGlnaXQgOSBvciBubyBQSU5gIH0gfVxyXG4gICAgfVxyXG4gIH1cclxufSIsImltcG9ydCB7XHJcbiAgSUFwcERhdGEsIElBZG1pblNpZ25JblBhZ2VVSSwgSUFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIsIElBcHBMb2dpYyxcclxuICBJU3Vic2NyaXB0aW9QYWdlQ29udHJvbGxlciwgSVN1YnNjcmlwdGlvblBhZ2VVSSxcclxuICBJVXNlcnNQYWdlQ29udHJvbGxlciwgSVVzZXJzUGFnZVVJLFxyXG59IGZyb20gXCIuL2ludGVyZmFjZXNcIlxyXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlcjxVST4ge1xyXG4gIHJlYWRvbmx5IGFsOiBJQXBwTG9naWNcclxuICBjb25zdHJ1Y3RvcihhbDogSUFwcExvZ2ljKSB7IHRoaXMuYWwgPSBhbCB9XHJcbiAgcHJpdmF0ZSBfdWk/OiBVSVxyXG4gIHNldCB1aSh2OiBVSSkgeyB0aGlzLl91aSA9IHYgfVxyXG4gIGdldCB1aSgpOiBVSSB7IGlmICh0aGlzLl91aSkgcmV0dXJuIHRoaXMuX3VpOyBlbHNlIHRocm93IG5ldyBFcnJvcihcIlVJIG5vdCBkZWZpbmVkIGZvciBjb250cm9sbGVyXCIpIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyPElBZG1pblNpZ25JblBhZ2VVST4gaW1wbGVtZW50cyBJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlciB7XHJcbiAgY29uc3RydWN0b3IoYWw6IElBcHBMb2dpYykgeyBzdXBlcihhbCkgfVxyXG4gIG9uRXhpdCgpOiB2b2lkIHtcclxuICAgIHRoaXMuYWwuZXhpdEFwcCgpXHJcbiAgfVxyXG4gIGFzeW5jIG9uU2lnbkluQXN5bmMoc3Vic2NyaXB0aW9uTnVtYmVyPzogc3RyaW5nLCBwaW4/OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHRoaXMuYWwuZGF0YVN0b3JlLnNhdmVTdWJzY3JpcHRpb25OdW1iZXJBbmRQSU4oc3Vic2NyaXB0aW9uTnVtYmVyLCBwaW4pXHJcbiAgICBpZiAoc3Vic2NyaXB0aW9uTnVtYmVyICYmIHBpbikge1xyXG4gICAgICB0aGlzLmFsLnN1YnNjcmlwdGlvbkRldGFpbHMgPSBhd2FpdCB0aGlzLmFsLnNlcnZpY2VBZG1pbkFwaS5zaWduSW5Bc3luYyhzdWJzY3JpcHRpb25OdW1iZXIsIHBpbilcclxuICAgICAgaWYgKHRoaXMuYWwuc3Vic2NyaXB0aW9uRGV0YWlscy5lcnJvcikge1xyXG4gICAgICAgIHRoaXMudWkuc2hvd01lc3NhZ2VPblBhbmVsKHRoaXMuYWwuc3Vic2NyaXB0aW9uRGV0YWlscy5lcnJvci5lcnJvclRleHQpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy9UaGUgZGV0YWlscyBhcmUgaW4gdGhlIGFwcCBsb2dpYyBmb3IgbmV4dCBzY3JlZW5cclxuICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnVpLnNob3dNZXNzYWdlT25QYW5lbChgTm8gc3Vic2NyaXB0aW9uIG51bWJlciAoJHtzdWJzY3JpcHRpb25OdW1iZXJ9KSBvciBQSU4gKCR7cGlufSkgZGVmaW5lZGApXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG4gIH1cclxuICBvblBhZ2VTaG93KCkge1xyXG4gICAgY29uc3QgYXBwRGF0YTogSUFwcERhdGEgPSB0aGlzLmFsLmRhdGFTdG9yZS5nZXRBcHBEYXRhKClcclxuICAgIC8vIFJldHJpZXZlIHNhdmVkIHN1YnNjcmlwdGlvbiBudW1iZXIgYW5kIFBJTiBmcm9tIGxvY2FsIHN0b3JlXHJcbiAgICBpZiAoYXBwRGF0YS5zdWJzY3JpcHRpb25OdW1iZXIpIHRoaXMudWkuc2V0U3Vic2NyaXB0aW9uTnVtYmVyKGFwcERhdGEuc3Vic2NyaXB0aW9uTnVtYmVyKVxyXG4gICAgaWYgKCF0aGlzLmFsLmFyZVdlT25UaXplbikgdGhpcy51aS5oaWRlRXhpdCgpXHJcbiAgICAvLyBjb25zb2xlLmxvZyhcIkFkbWluIFNpZ25JbiBQYWdlIHNob3duXCIpXHJcbiAgfVxyXG4gIG9uVGhlbWUodGg6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5hbC50aGVtZSA9IHRoXHJcbiAgICB0aGlzLnVpLmNoYW5nZVRoZW1lKHRoKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFN1YnNjcmlwdGlvblBhZ2VDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlcjxJU3Vic2NyaXB0aW9uUGFnZVVJPiBpbXBsZW1lbnRzIElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyIHtcclxuICBjb25zdHJ1Y3RvcihhbDogSUFwcExvZ2ljKSB7IHN1cGVyKGFsKSB9XHJcbiAgb25QYWdlU2hvdygpIHtcclxuICAgIHRoaXMudWkuc2hvd1N1YnNjcmlwdGlvbkRldGFpbHModGhpcy5hbC5zdWJzY3JpcHRpb25EZXRhaWxzKVxyXG4gICAgY29uc29sZS5sb2coXCJTdWJzY3JpcHRpb24gUGFnZSBzaG93blwiKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFVzZXJzUGFnZUNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyPElVc2Vyc1BhZ2VVST4gaW1wbGVtZW50cyBJVXNlcnNQYWdlQ29udHJvbGxlciB7XHJcbiAgY29uc3RydWN0b3IoYWw6IElBcHBMb2dpYykgeyBzdXBlcihhbCkgfVxyXG4gIG9uUGFnZVNob3coKSB7XHJcbiAgICB0aGlzLnVpLnNob3dVc2Vycyh0aGlzLmFsLnN1YnNjcmlwdGlvbkRldGFpbHMudXNlcnMpXHJcbiAgfVxyXG4gIG9uRGVsZXRlVXNlckNsaWNrZWQodXNlcjpzdHJpbmcpOnZvaWQge1xyXG4gICAgdGhpcy5hbC51c2VyVG9CZURlbGV0ZWQgPSB1c2VyXHJcbiAgICB0aGlzLnVpLnNob3dEZWxldGVVc2VyQ29uZmlybWF0aW9uKHVzZXIpXHJcbiAgfVxyXG4gIC8vQHRzLWlnbm9yZSAvL1RPRE8gVG8gaW1wbGVtZW50IHVzZXIgZGVsZXRpb25cclxuICBhc3luYyBvbkRlbGV0ZVVzZXJDb25maXJtZWRBc3luYyh1c2VyOnN0cmluZyl7XHJcbiAgICBjb25zdCBkZXRhaWxzID0gYXdhaXQgdGhpcy5hbC5zZXJ2aWNlQWRtaW5BcGkuZGVsZXRlVXNlckFzeW5jKHVzZXIpXHJcbiAgICB0aGlzLnVpLnNob3dVc2VycyhkZXRhaWxzLnVzZXJzKSAvL1RvIHNob3cgdGhlIHJlc3VsdHMgb2YgdGhlIGRlbGV0aW9uIG9yIG90aGVyIGludGVybWl0dGVudCBkYXRhYmFzZSBjaGFuZ2VzXHJcbiAgfVxyXG59IiwiaW1wb3J0IHtBcHBMb2dpY30gZnJvbSBcIi4vYXBwbG9naWNcIlxyXG5uZXcgQXBwTG9naWMoKVxyXG4iLCJpbXBvcnQge29wZW5KUU1QYW5lbCwgY2hhbmdlUGFnZSxcclxuICBzZXRIVE1MRWxlbWVudFRleHQsIGdldEhUTUxFbGVtZW50VmFsLCBzZXRIVE1MRWxlbWVudFZhbCwgfSBmcm9tIFwiLi91dGlsc1wiXHJcbmltcG9ydCB7dXBkYXRlVGhlbWVPbkFjdGl2ZVBhZ2V9IGZyb20gXCIuL3RoZW1lY2hhbmdlclwiXHJcbmltcG9ydCB7XHJcbiAgSUFkbWluU2lnbkluUGFnZVVJLCBJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlciwgSUNvbnRyb2xsZXIsIElQYWdlVUksXHJcbiAgSVN1YnNjcmlwdGlvbkRldGFpbHMsIElTdWJzY3JpcHRpb25QYWdlVUksIElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyLFxyXG4gIElVc2Vyc1BhZ2VDb250cm9sbGVyLCBJVXNlcnNQYWdlVUksXHJcbn0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiXHJcblxyXG5leHBvcnQgY2xhc3MgUGFnZVVJPENUUiBleHRlbmRzIElDb250cm9sbGVyPElQYWdlVUk+PiBpbXBsZW1lbnRzIElQYWdlVUkge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3BhZ2U6IEhUTUxFbGVtZW50XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfY3RybDogQ1RSXHJcbiAgZ2V0IHBhZ2UoKTogSFRNTEVsZW1lbnQgeyByZXR1cm4gdGhpcy5fcGFnZSB9XHJcbiAgZ2V0IGN0cmwoKTogQ1RSIHsgaWYgKHRoaXMuX2N0cmwpIHJldHVybiB0aGlzLl9jdHJsOyBlbHNlIHRocm93IG5ldyBFcnJvcihcIk5vIENvbnRyb2xsZXIgZGVmaW5lZCBmb3IgVUkgb2JqZWN0XCIpIH1cclxuICBjb25zdHJ1Y3RvcihwYWdlOiBIVE1MRWxlbWVudCwgY3RybDogQ1RSKSB7XHJcbiAgICB0aGlzLl9wYWdlID0gcGFnZVxyXG4gICAgdGhpcy5fY3RybCA9IGN0cmxcclxuICAgIHRoaXMuX2N0cmwudWkgPSB0aGlzIC8vIFRoaXMgaXMgdGVycmlibHkgaW1wb3J0YW50IHRvIHBhc3MgdGhlIFVJIG9iamVjdCB0byB0aGUgY29udHJvbGxlclxyXG4gIH1cclxuICBjaGFuZ2VUaGVtZSh0aGVtZTogc3RyaW5nKSB7XHJcbiAgICAvL3RzLWlnbm9yZSAvL1RPRE8gc2VlIGh0dHBzOi8vYXBpLmpxdWVyeW1vYmlsZS5jb20vMS40L3BhZ2UvI29wdGlvbi10aGVtZVxyXG4gICAgLy8gJChcIiNcIiArIHRoaXMucGFnZS5pZCkucGFnZShcIm9wdGlvblwiLCBcInRoZW1lXCIsIHRoZW1lKVxyXG4gICAgdXBkYXRlVGhlbWVPbkFjdGl2ZVBhZ2UodGhlbWUpXHJcbiAgfVxyXG4gIHNob3dMb2FkaW5nSW5kaWNhdG9yKCkge1xyXG4gICAgJC5tb2JpbGUubG9hZGluZyhcInNob3dcIiwgeyB0ZXh0OiBcIkxvYWRpbmcuLi5cIiwgdGV4dFZpc2libGU6IHRydWUsIHRoZW1lOiBcImJcIiwgfSk7XHJcbiAgfVxyXG4gIGhpZGVMb2FkaW5nSW5kaWNhdG9yKCkgeyAkLm1vYmlsZS5sb2FkaW5nKFwiaGlkZVwiKSB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBZG1pblNpZ25JblBhZ2VVSSBleHRlbmRzIFBhZ2VVSTxJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlcj4gaW1wbGVtZW50cyBJQWRtaW5TaWduSW5QYWdlVUkge1xyXG4gIGNvbnN0cnVjdG9yKHBhZ2U6IEhUTUxFbGVtZW50LCBjdHJsOiBJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlcikge1xyXG4gICAgc3VwZXIocGFnZSwgY3RybClcclxuICAgICQoXCIjc2lnbkluXCIpLm9uKFwiY2xpY2tcIiwgYXN5bmMgKGUpID0+IHtcclxuICAgICAgLy8gVGhpcyBmdW5jdGlvbiBjYW4gYmUgZGVjbGFyZWQgYXN5bmMgYnV0IHRoZSBicm93c2VyIGhhbmRsZXIgd2lsbCBub3QgYmxvY2tcclxuICAgICAgLy8gdGhlIGV4ZWN1dGlvbiBvZiB0aGUgY29kZS4gU28gd2hlbiB3b3JraW5nIHdpdGggYXN5bmMgY2FsbHNcclxuICAgICAgLy8gVGhlIG5hdmlnYXRpb24gdG8gdGhlIG5leHQgcGFnZSBoYXMgdG8gYmUgZG9uZSBtYW51YWxseVxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCkgLy8gVGhpcyBpcyBhbm90aGVyIHdheSB0byBibG9jayBkZWZhdWx0IEhUTUwgaGFuZGxpbmdcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB0aGlzLnNob3dMb2FkaW5nSW5kaWNhdG9yKClcclxuICAgICAgICBpZiAoYXdhaXQgdGhpcy5jdHJsLm9uU2lnbkluQXN5bmMoXHJcbiAgICAgICAgICBnZXRIVE1MRWxlbWVudFZhbChcIiNzdWJzY3JpcHRpb25OdW1iZXJcIiksXHJcbiAgICAgICAgICBnZXRIVE1MRWxlbWVudFZhbChcIiNwaW5cIikpKSB7XHJcbiAgICAgICAgICAvLyA8YSBocmVmPVwiI3N1YnNjcmlwdGlvblwiIGRhdGEtdHJhbnNpdGlvbj1cInNsaWRlXCIgZGF0YS1yb2xlPVwiYnV0dG9uXCIgaWQ9XCJzaWduSW5cIj5TaWduIEluPC9hPlxyXG4gICAgICAgICAgY2hhbmdlUGFnZShcIiNzdWJzY3JpcHRpb25cIiwgeyB0cmFuc2l0aW9uOiBcInNsaWRlXCIgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgdGhpcy5oaWRlTG9hZGluZ0luZGljYXRvcigpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAkKHBhZ2UpLm9uKFwicGFnZWJlZm9yZXNob3dcIiwgKCkgPT4geyAvL0RlcHJlY2F0ZWQgYXMgb2YgMS40LjAsIEhtbW1cclxuICAgICAgdGhpcy5jdHJsLm9uUGFnZVNob3coKVxyXG4gICAgfSlcclxuICAgICQoXCIjZXhpdFwiKS5vbihcImNsaWNrXCIsICgvKmUqLykgPT4ge1xyXG4gICAgICAvL2UucHJldmVudERlZmF1bHQoKSAvLyBUaGlzIGlzIGFub3RoZXIgd2F5IHRvIGJsb2NrIGRlZmF1bHQgSFRNTCBoYW5kbGluZ1xyXG4gICAgICByZXR1cm4gdGhpcy5jdHJsLm9uRXhpdCgpXHJcbiAgICB9KVxyXG4gICAgJChcIiN0aGVtZUFcIikub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuY3RybC5vblRoZW1lKFwiYVwiKSB9KVxyXG4gICAgJChcIiN0aGVtZUJcIikub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuY3RybC5vblRoZW1lKFwiYlwiKSB9KVxyXG4gICAgJChcIiN0aGVtZUNcIikub24oXCJjbGlja1wiLCAoKSA9PiB7IHRoaXMuY3RybC5vblRoZW1lKFwiY1wiKSB9KVxyXG4gICAgY29uc29sZS5sb2coXCJBZG1pblNpZ25JblBhZ2VVSSBjb25zdHJ1Y3RlZFwiKVxyXG4gIH1cclxuICBzZXRTdWJzY3JpcHRpb25OdW1iZXIobjogc3RyaW5nKSB7XHJcbiAgICBzZXRIVE1MRWxlbWVudFZhbChcIiNzdWJzY3JpcHRpb25OdW1iZXJcIiwgbilcclxuICB9XHJcbiAgc2hvd01lc3NhZ2VPblBhbmVsKG1zZzogc3RyaW5nKSB7XHJcbiAgICBzZXRIVE1MRWxlbWVudFRleHQoXCIjYWRtaW5TaWduSW5NZXNzYWdlXCIsIG1zZylcclxuICAgIC8vICQubW9iaWxlLmNoYW5nZVBhZ2UoXCIjYWRtaW5TaWduSW5QYW5lbFwiKSAvLyBUaGlzIHdvbid0IHdvcmsgd2l0aCBwYW5lbHMgc2VlIGh0dHBzOi8vYXBpLmpxdWVyeW1vYmlsZS5jb20vcGFuZWwvXHJcbiAgICBvcGVuSlFNUGFuZWwoXCIjYWRtaW5TaWduSW5QYW5lbFwiKVxyXG4gICAgLy8kKCBcIiNteXBhbmVsXCIgKS50cmlnZ2VyKCBcInVwZGF0ZWxheW91dFwiICkgLy9NYXliZSB0aGlzIGlzIHJlcXVpcmVkLCB0b29cclxuICB9XHJcbiAgaGlkZUV4aXQoKTogdm9pZCB7XHJcbiAgICAkKFwiI2V4aXRcIikuaGlkZSgpXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3Vic2NyaXB0aW9uUGFnZVVJIGV4dGVuZHMgUGFnZVVJPElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyPiBpbXBsZW1lbnRzIElTdWJzY3JpcHRpb25QYWdlVUkge1xyXG4gIGNvbnN0cnVjdG9yKHBhZ2U6IEhUTUxFbGVtZW50LCBjdHJsOiBJU3Vic2NyaXB0aW9QYWdlQ29udHJvbGxlcikge1xyXG4gICAgc3VwZXIocGFnZSwgY3RybClcclxuICAgICQocGFnZSkub24oXCJwYWdlYmVmb3Jlc2hvd1wiLCAoKSA9PiB7IC8vRGVwcmVjYXRlZCBhcyBvZiAxLjQuMCwgSG1tbVxyXG4gICAgICB0aGlzLmN0cmwub25QYWdlU2hvdygpXHJcbiAgICB9KVxyXG4gIH1cclxuICBzaG93U3Vic2NyaXB0aW9uRGV0YWlscyhkZXRhaWxzOiBJU3Vic2NyaXB0aW9uRGV0YWlscyk6IHZvaWQge1xyXG4gICAgc2V0SFRNTEVsZW1lbnRUZXh0KFwiI251bWJlck9mbGljZW5zZXNcIiwgXCJcIiArIGRldGFpbHMubGljZW5zZXMpXHJcbiAgICBzZXRIVE1MRWxlbWVudFRleHQoXCIjbnVtYmVyT2ZVc2Vyc1wiLCBcIlwiICsgZGV0YWlscy51c2Vycz8ubGVuZ3RoKVxyXG4gICAgc2V0SFRNTEVsZW1lbnRUZXh0KFwiI251bWJlck9mUHJvZmlsZXNcIiwgXCJcIiArIGRldGFpbHMucHJvZmlsZXM/Lmxlbmd0aClcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVc2Vyc1BhZ2VVSSBleHRlbmRzIFBhZ2VVSTxJVXNlcnNQYWdlQ29udHJvbGxlcj4gaW1wbGVtZW50cyBJVXNlcnNQYWdlVUkge1xyXG4gIGNvbnN0cnVjdG9yKHBhZ2U6IEhUTUxFbGVtZW50LCBjdHJsOiBJVXNlcnNQYWdlQ29udHJvbGxlcikge1xyXG4gICAgc3VwZXIocGFnZSwgY3RybClcclxuICAgICQocGFnZSkub24oXCJwYWdlYmVmb3Jlc2hvd1wiLCAoKSA9PiB7IHRoaXMuY3RybC5vblBhZ2VTaG93KCkgfSlcclxuICAgICQoXCIjdXNlckxpc3RcIikub24oXCJjbGlja1wiLCAoZSkgPT4geyAvL0Fsd2F5cyB1c2UgZmF0IGFycm93IHRvIGdldCBwcm9wZXIgdGhpcyBoYW5kbGluZ1xyXG4gICAgICBjb25zb2xlLmxvZyhcInVzZXIgbGlzdCBjbGljayBmb3IgXCIsIGUpXHJcbiAgICAgIC8vICQoXCIjdXNlclRvRGVsZXRlXCIpLnRleHQoZS50YXJnZXQudGV4dClcclxuICAgICAgLy9AdHMtaWdub3JlIC8vVE9ETyBXZSBhcmUgc3VyZSBpdCB3b3JrcyBzaW5jZSB3ZSBoYXZlIGRlZmluZWQgZGF0YS11c2VyLWlkIGZvciBlYWNoIHVzZXJzIGFkZGVkIHRvIHRoZSBsaXN0XHJcbiAgICAgIC8vICQoXCIjdXNlclRvRGVsZXRlXCIpLnRleHQoZS50YXJnZXQuZGF0YXNldC51c2VySWQpXHJcbiAgICAgIHRoaXMuY3RybC5vbkRlbGV0ZVVzZXJDbGlja2VkKGUudGFyZ2V0LmRhdGFzZXQudXNlcklkKVxyXG4gICAgfSlcclxuICAgICQoXCIjdXNlckRlbGV0aW9uQ29uZmlybWVkXCIpLm9uKFwiY2xpY2tcIiwgYXN5bmMgKC8qZSovKSA9PiB7IC8vQWx3YXlzIHVzZSBmYXQgYXJyb3cgdG8gZ2V0IHByb3BlciB0aGlzIGhhbmRsaW5nXHJcbiAgICAgIC8vIGUucHJldmVudERlZmF1bHQoKSAvLyBObyBuZWVkIHRvIGJsb2NrIGRlZmF1bHQgSFRNTCBoYW5kbGluZywgaXQncyBmaW5lIHRoYXQgdGhlIGNvbmZpcm1hdGlvbiBwYW5lbCBpcyBhdXRvbWF0aWNhbGx5IGNsb3NlZFxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHRoaXMuc2hvd0xvYWRpbmdJbmRpY2F0b3IoKVxyXG4gICAgICAgIGlmICh0aGlzLmN0cmwuYWwudXNlclRvQmVEZWxldGVkKSB7XHJcbiAgICAgICAgICBhd2FpdCB0aGlzLmN0cmwub25EZWxldGVVc2VyQ29uZmlybWVkQXN5bmModGhpcy5jdHJsLmFsLnVzZXJUb0JlRGVsZXRlZClcclxuICAgICAgICB9XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgdGhpcy5oaWRlTG9hZGluZ0luZGljYXRvcigpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG4gIHNob3dVc2Vycyh1c2VyTGlzdDogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgIGNvbnN0IHVzZXJzSHRtbCA9IHVzZXJMaXN0LnJlZHVjZSgoYSwgdSkgPT4gYSArPSBgXHJcbiAgICA8bGkgZGF0YS1pY29uPVwiZGVsZXRlXCI+PGEgaHJlZj1cIiNkZWxldGVVc2VyXCIgZGF0YS1yZWw9XCJwb3B1cFwiIGRhdGEtcG9zaXRpb24tdG89XCJ3aW5kb3dcIiBkYXRhLXRyYW5zaXRpb249XCJwb3BcIlxyXG4gICAgICAgICAgZGF0YS11c2VyLWlkPVwiJHt1fVwiPiR7dX08L2E+XHJcbiAgICA8L2xpPiAgICAgIFxyXG4gICAgYCwgXCJcIilcclxuICAgICQoXCIjdXNlckxpc3RcIikuaHRtbCh1c2Vyc0h0bWwpLmxpc3R2aWV3KFwicmVmcmVzaFwiKVxyXG4gIH1cclxuICBzaG93RGVsZXRlVXNlckNvbmZpcm1hdGlvbih1c2VyOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICQoXCIjdXNlclRvRGVsZXRlXCIpLnRleHQodXNlcilcclxuICAgIC8vVGhlIGNvbmZpcm1hdGlvbiBkaWFsb2cgaXMgYXV0b21hdGljYWxseSBvcGVuZWQgc2luY2UgdGhlIExJIGVsZW1lbnRzIGFsbCBoYXZlIHRoZSBocmVmPSNkZWxldGVVc2VyXHJcbiAgfVxyXG5cclxufVxyXG4iLCIvLyBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMjY1MjQzM1xyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlVGhlbWVPbkFjdGl2ZVBhZ2UobmV3VGhlbWU6c3RyaW5nKSB7XHJcbiAgbGV0IHJtYnRuQ2xhc3NlcyA9ICcnO1xyXG4gIGxldCBybWhmQ2xhc3NlcyA9ICcnO1xyXG4gIGxldCBybWJkQ2xhc3Nlc3MgPSAnJztcclxuICBjb25zdCBhcnIgPSBbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCcsICdpJywgJ2onLCAnaycsICdsJywgJ20nLCAnbicsICdvJywgJ3AnLCAncScsICdyJywgJ3MnXTsgLy8gSSBoYWQgdGhlbWVzIGZyb20gYSB0byBzXHJcbiAgLy9AdHMtaWdub3JlIC8vVE9ETyBpbmRleCBpcyBub3QgdXNlZCwgYnV0IEkgZG9uJ3Qgd2FudCB0byBjaGFuZ2UgaXRcclxuICAkLmVhY2goYXJyLCBmdW5jdGlvbihpbmRleCwgdmFsdWU6c3RyaW5nKSB7XHJcbiAgICAgIHJtYnRuQ2xhc3NlcyA9IHJtYnRuQ2xhc3NlcyArICcgdWktYnRuLXVwLScgKyB2YWx1ZSArICcgdWktYnRuLWhvdmVyLScgKyB2YWx1ZTtcclxuICAgICAgcm1oZkNsYXNzZXMgPSBybWhmQ2xhc3NlcyArICcgdWktYmFyLScgKyB2YWx1ZTtcclxuICAgICAgcm1iZENsYXNzZXNzID0gcm1iZENsYXNzZXNzICsgJyB1aS1ib2R5LScgKyB2YWx1ZSArICcgdWktcGFnZS10aGVtZS0nKyB2YWx1ZTtcclxuICB9KTtcclxuICAvLyByZXNldCBhbGwgdGhlIGJ1dHRvbnMgd2lkZ2V0c1xyXG4gICQubW9iaWxlLmFjdGl2ZVBhZ2UuZmluZCgnLnVpLWJ0bicpLm5vdCgnLnVpLWxpLWRpdmlkZXInKS5yZW1vdmVDbGFzcyhybWJ0bkNsYXNzZXMpLmFkZENsYXNzKCd1aS1idG4tdXAtJyArIG5ld1RoZW1lKS5hdHRyKCdkYXRhLXRoZW1lJywgbmV3VGhlbWUpO1xyXG4gIC8vIHJlc2V0IHRoZSBoZWFkZXIvZm9vdGVyIHdpZGdldHNcclxuICAkLm1vYmlsZS5hY3RpdmVQYWdlLmZpbmQoJy51aS1oZWFkZXIsIC51aS1mb290ZXInKS5yZW1vdmVDbGFzcyhybWhmQ2xhc3NlcykuYWRkQ2xhc3MoJ3VpLWJhci0nICsgbmV3VGhlbWUpLmF0dHIoJ2RhdGEtdGhlbWUnLCBuZXdUaGVtZSk7XHJcbiAgLy8gcmVzZXQgdGhlIHBhZ2Ugd2lkZ2V0XHJcbiAgJC5tb2JpbGUuYWN0aXZlUGFnZS5yZW1vdmVDbGFzcyhybWJkQ2xhc3Nlc3MpLmFkZENsYXNzKCd1aS1ib2R5LScgKyBuZXdUaGVtZSArICcgdWktcGFnZS10aGVtZS0nKyBuZXdUaGVtZSkuYXR0cignZGF0YS10aGVtZScsIG5ld1RoZW1lKTtcclxuICAvLyB0YXJnZXQgdGhlIGxpc3QgZGl2aWRlciBlbGVtZW50cywgdGhlbiBpdGVyYXRlIHRocm91Z2ggdGhlbSBhbmRcclxuICAvLyBjaGFuZ2UgaXRzIHRoZW1lICh0aGlzIGlzIHRoZSBqUXVlcnkgTW9iaWxlIGRlZmF1bHQgZm9yXHJcbiAgLy8gbGlzdC1kaXZpZGVycylcclxuICAvL0B0cy1pZ25vcmUgLy9UT0RPIGluZGV4IGFuZCBvYmogYXJlIG5vdCB1c2VkXHJcbiAgJC5tb2JpbGUuYWN0aXZlUGFnZS5maW5kKCcudWktbGktZGl2aWRlcicpLmVhY2goZnVuY3Rpb24oaW5kZXgsIG9iaikge1xyXG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKHJtaGZDbGFzc2VzKS5hZGRDbGFzcygndWktYmFyLScgKyBuZXdUaGVtZSkuYXR0cignZGF0YS10aGVtZScsIG5ld1RoZW1lKTtcclxuICB9KTtcclxufTsiLCIvLz09PT09PT09PT09PT09PT09PT09IFVUSUxJVFkgRlVOQ1RJT05TID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5leHBvcnQgZnVuY3Rpb24gb3BlbkpRTVBhbmVsKHBhbmVsSWQ6c3RyaW5nKSB7XHJcbiAgY29uc3QgcDpKUXVlcnk8SFRNTEVsZW1lbnQ+ID0gJChwYW5lbElkKVxyXG4gIC8vQHRzLWlnbm9yZSAvL1RPRE8gVGhlIHBhbmVsKCkgaXMgbm90IGRlY2xhcmVkLCB1bmZvcnR1bmF0ZWx5LCBpbiBKUU0gdHlwZXMsIGJ1dCB3b3JrcyBmaW5lXHJcbiAgcC5wYW5lbChcIm9wZW5cIilcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY2hhbmdlUGFnZShwYWdlSWQ6c3RyaW5nLG9wdGlvbnM/OkNoYW5nZVBhZ2VPcHRpb25zKTp2b2lkIHtcclxuICAkLm1vYmlsZS5jaGFuZ2VQYWdlKHBhZ2VJZCxvcHRpb25zKVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIVE1MRWxlbWVudFRleHQoaWQ6c3RyaW5nLCBzOnN0cmluZykge1xyXG4gIGNvbnN0IGUgPSAkKGlkKVxyXG4gIGlmKGUubGVuZ3RoKSBlLnRleHQocylcclxuICBlbHNlIHRocm93IG5ldyBFcnJvcihgTm8gZWxlbWVudCBmb3VuZCB3aXRoIElEICR7aWR9YClcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SFRNTEVsZW1lbnRWYWwoaWQ6c3RyaW5nKTpzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gIGNvbnN0IGUgPSAkKGlkKVxyXG4gIGlmKGUubGVuZ3RoKSByZXR1cm4gZS52YWwoKT8udG9TdHJpbmcoKVxyXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yKGBObyBlbGVtZW50IGZvdW5kIHdpdGggSUQgJHtpZH1gKVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRIVE1MRWxlbWVudFZhbChpZDpzdHJpbmcsIHM6c3RyaW5nKTp2b2lkIHtcclxuICBjb25zdCBlID0gJChpZClcclxuICBpZihlLmxlbmd0aCkgZS52YWwocylcclxuICBlbHNlIHRocm93IG5ldyBFcnJvcihgTm8gZWxlbWVudCBmb3VuZCB3aXRoIElEICR7aWR9YClcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2xlZXBBc3luYyhtczpudW1iZXIpOlByb21pc2U8dm9pZD4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcclxufSJdfQ==
