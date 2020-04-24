(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    }
    onPageInit(e) {
        if (e.target instanceof HTMLElement) {
            // themeChanger(this.theme)
            switch (e.target.id) {
                case "adminSignIn":
                    new pages_1.AdminSignInPageUI(e.target, new controllers_1.AdminSignInPageController(this));
                    break;
                case "subscription":
                    new pages_1.SubscriptionPageUI(e.target, new controllers_1.SubscriptionPageController(this));
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
    signIn(subscriptionNumber, pin) {
        if (subscriptionNumber.includes("9") && pin) {
            return this.data;
        }
        else {
            return { error: { errorCode: 1001, errorText: `Invalid subscription number ${subscriptionNumber} Has no digit 9 or no PIN` } };
        }
    }
}

},{"./controllers":2,"./pages":5}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const themechanger_1 = __importDefault(require("./themechanger"));
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
    onSignIn(subscriptionNumber, pin) {
        this.al.dataStore.saveSubscriptionNumberAndPIN(subscriptionNumber, pin);
        if (subscriptionNumber && pin) {
            this.al.subscriptionDetails = this.al.serviceAdminApi.signIn(subscriptionNumber, pin);
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
        themechanger_1.default(th);
    }
}
exports.AdminSignInPageController = AdminSignInPageController;
class SubscriptionPageController extends Controller {
    constructor(al) { super(al); }
    onPageShow() {
        this.ui.showSubscriptionDetails(this.al.subscriptionDetails);
        console.log("Subscription Page shown");
        themechanger_1.default(this.al.theme);
    }
}
exports.SubscriptionPageController = SubscriptionPageController;

},{"./themechanger":6}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//==================== UTILITY FUNCTIONS =================================
function openJQMPanel(panelId) {
    const p = $(panelId);
    //@ts-ignore //TODO The panel() is not declared, unfortunately, in JQM types, but works fine
    p.panel("open");
}
exports.openJQMPanel = openJQMPanel;
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

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const applogic_1 = require("./applogic");
new applogic_1.AppLogic();

},{"./applogic":1}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
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
}
exports.PageUI = PageUI;
class AdminSignInPageUI extends PageUI {
    constructor(page, ctrl) {
        super(page, ctrl);
        $("#signIn").on("click", ( /*e*/) => {
            //e.preventDefault() // This is another way to block default HTML handling
            return this.ctrl.onSignIn(interfaces_1.getHTMLElementVal("#subscriptionNumber"), interfaces_1.getHTMLElementVal("#pin"));
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
        interfaces_1.setHTMLElementVal("#subscriptionNumber", n);
    }
    showMessageOnPanel(msg) {
        interfaces_1.setHTMLElementText("#adminSignInMessage", msg);
        // $.mobile.changePage("#adminSignInPanel") // This won't work with panels see https://api.jquerymobile.com/panel/
        interfaces_1.openJQMPanel("#adminSignInPanel");
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
        interfaces_1.setHTMLElementText("#numberOflicenses", "" + details.licenses);
        interfaces_1.setHTMLElementText("#numberOfUsers", "" + ((_a = details.users) === null || _a === void 0 ? void 0 : _a.length));
        interfaces_1.setHTMLElementText("#numberOfProfiles", "" + ((_b = details.profiles) === null || _b === void 0 ? void 0 : _b.length));
    }
}
exports.SubscriptionPageUI = SubscriptionPageUI;

},{"./interfaces":3}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// from https://stackoverflow.com/a/32652433
function updateTheme(newTheme) {
    var rmbtnClasses = '';
    var rmhfClasses = '';
    var rmbdClassess = '';
    var arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's']; // I had themes from a to s
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
exports.default = updateTheme;
;

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwbG9naWMudHMiLCJzcmMvanMvY29udHJvbGxlcnMudHMiLCJzcmMvanMvaW50ZXJmYWNlcy50cyIsInNyYy9qcy9tYWluLnRzIiwic3JjL2pzL3BhZ2VzLnRzIiwic3JjL2pzL3RoZW1lY2hhbmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQ0EsK0NBQXFGO0FBQ3JGLG1DQUErRDtBQUMvRCw0Q0FBNEM7QUFFNUMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFBO0FBQzFCLE1BQU0sU0FBUztJQUNiLDRCQUE0QixDQUFDLGtCQUEyQixFQUFFLEdBQVk7UUFDcEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFBO1FBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDeEIsQ0FBQztJQUNELFdBQVcsQ0FBQyxJQUFjO1FBQ3hCLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtJQUN0RCxDQUFDO0lBQ0QsVUFBVTtRQUNSLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDeEMsSUFBSSxDQUFDLEVBQUU7WUFDTCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3ZCLElBQUksQ0FBQztnQkFBRSxPQUFPLENBQWEsQ0FBQTtTQUM1QjtRQUNELE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7Ozs7OztFQVlFO0FBQ0YsTUFBYSxRQUFRO0lBUW5CO1FBUEEsMkNBQTJDO1FBQzND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QUE4QztJQUM5QyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxLQUFLLEVBQUUsR0FBRztRQUMvRCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqRyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUE1QkQsOEJBNEJDO0FBQUEsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IElBcHBEYXRhLCBJRGF0YVN0b3JlLCBJQXBwTG9naWMsIElTZXJ2aWNlQWRtaW4sIElTdWJzY3JpcHRpb25EZXRhaWxzIH0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiXG5pbXBvcnQgeyBBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyLCBTdWJzY3JpcHRpb25QYWdlQ29udHJvbGxlciB9IGZyb20gXCIuL2NvbnRyb2xsZXJzXCJcbmltcG9ydCB7IEFkbWluU2lnbkluUGFnZVVJLCBTdWJzY3JpcHRpb25QYWdlVUkgfSBmcm9tIFwiLi9wYWdlc1wiXG4vLyBpbXBvcnQgdGhlbWVDaGFuZ2VyIGZyb20gXCIuL3RoZW1lY2hhbmdlclwiXG5cbmNvbnN0IFNUT1JFS0VZID0gXCJBcHBEYXRhXCJcbmNsYXNzIERhdGFTdG9yZSBpbXBsZW1lbnRzIElEYXRhU3RvcmUge1xuICBzYXZlU3Vic2NyaXB0aW9uTnVtYmVyQW5kUElOKHN1YnNjcmlwdGlvbk51bWJlcj86IHN0cmluZywgcGluPzogc3RyaW5nKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0QXBwRGF0YSgpXG4gICAgZGF0YS5waW4gPSBwaW5cbiAgICBkYXRhLnN1YnNjcmlwdGlvbk51bWJlciA9IHN1YnNjcmlwdGlvbk51bWJlclxuICAgIHRoaXMuc2F2ZUFwcERhdGEoZGF0YSlcbiAgfVxuICBzYXZlQXBwRGF0YShkYXRhOiBJQXBwRGF0YSkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFNUT1JFS0VZLCBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgfVxuICBnZXRBcHBEYXRhKCk6IElBcHBEYXRhIHtcbiAgICBjb25zdCB2ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oU1RPUkVLRVkpXG4gICAgaWYgKHYpIHtcbiAgICAgIGNvbnN0IG8gPSBKU09OLnBhcnNlKHYpXG4gICAgICBpZiAobykgcmV0dXJuIG8gYXMgSUFwcERhdGFcbiAgICB9XG4gICAgcmV0dXJuIHt9XG4gIH1cbn1cblxuLypcbldoZW4gYXBwIGlzIGxvYWRlZCwgY2hlY2sgaWYgdGhlcmUgaXMgc2F2ZWQgc3Vic2NyaXB0aW9uIG51bWJlciBhbmQgdXNlciwgaWYgdGhlcmUgaXMgcmVsb2FkIGl0XG5cbldoZW4gdXNlciBwcmVzc2VzIHNpZ24gaW4sIGl0IHRyaWVzIHRvIGNvbm5lY3QgdG8gZmlyZWJhc2Ugc2VydmljZSwgdmlhIGF1dGhlbnRpY2F0aW9uIFxudG8gZmluZCBpZiB0aGUgc2VydmljZSBpc2FjdGl2ZSBhbmQgdGhlIFBJTiBpcyBvaywgb3IganVzdCB1c2UgRkIgYXV0aGVudGljYXRpb24uXG5cbldoZW4gcGFnZSBpcyBpbml0aWFsaXplZCB3ZSBjcmVhdGUgYW4gb2JqZWN0IGZyb20gYSBjb250cm9sbGVyIGNsYXNzLlxuV2UgbmVlZCB0d28gaW50ZXJmYWNlcywgb25lIGZvciB0aGUgc2NyZWVuIGZvciBjb21tYW5kcyB0byBzaG93IGRhdGFcbkFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBhcHBsaWNhdGlvbiBjb250cm9sbGVyIHRvIHJlY2VpdmUgZXZlbnRzIGZyb20gdGhlIHBhZ2UuXG5UaGVzZSB0d28gaW50ZXJmYWNlcyBmb3JtYWxseSBkZWZpbmUgdGhlIGNvbnRyYWN0IGJldHdlZW4gdGhlIGNvbW11bmljYXRpb24gcHJvdG9jb2wgYmV0d2VlbiB0aGUgVUlcbmFuZCB0aGUgYXBwIGxvZ2ljL2NvbnRyb2xsZXIuXG5FdmVyeSBVSSBvYmplY3QgaXMgYSBtZXNzYWdlIGRpc3BhdGNoZXIgdGhhdCBpcyByZWdpc3RlcmVkIGl0cyBsaXN0ZW5lcnMgd2l0aCBKUSBmb3IgdGhlIGFwcHJvcHJpYXRlIG9iamVjdC5cbiovXG5leHBvcnQgY2xhc3MgQXBwTG9naWMgaW1wbGVtZW50cyBJQXBwTG9naWMge1xuICAvLyBwcml2YXRlIF9hZG1pblNpZ25Jbj86IEFkbWluU2lnbkluUGFnZVVJXG4gIC8vIHNldCBhZG1pblNpZ25Jbih2OiBBZG1pblNpZ25JblBhZ2VVSSkgeyB0aGlzLl9hZG1pblNpZ25JbiA9IHYgfVxuICAvLyBnZXQgYWRtaW5TaWduSW4oKTogQWRtaW5TaWduSW5QYWdlVUkgeyBpZiAodGhpcy5fYWRtaW5TaWduSW4pIHJldHVybiB0aGlzLl9hZG1pblNpZ25JbjsgZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJObyBBZG1pblNpZ25JblBhZ2VVSVwiKSB9XG4gIGRhdGFTdG9yZTogSURhdGFTdG9yZSA9IG5ldyBEYXRhU3RvcmUoKVxuICBzZXJ2aWNlQWRtaW5BcGk6IElTZXJ2aWNlQWRtaW4gPSBuZXcgRGVtb1NlcnZpY2VBZG1pbkltcGwoKVxuICBzdWJzY3JpcHRpb25EZXRhaWxzOiBJU3Vic2NyaXB0aW9uRGV0YWlscyA9IHt9XG4gIHRoZW1lOnN0cmluZyA9IFwiYlwiXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdFRpemVuSFdLZXlIYW5kbGVyKHRoaXMpXG4gICAgJChkb2N1bWVudCkub24oXCJwYWdlaW5pdFwiLCAoZSkgPT4gdGhpcy5vblBhZ2VJbml0KGUpKVxuICB9XG4gIG9uUGFnZUluaXQoZTogSlF1ZXJ5LlRyaWdnZXJlZEV2ZW50PERvY3VtZW50LCB1bmRlZmluZWQsIERvY3VtZW50LCBEb2N1bWVudD4pIHtcbiAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgLy8gdGhlbWVDaGFuZ2VyKHRoaXMudGhlbWUpXG4gICAgICBzd2l0Y2ggKGUudGFyZ2V0LmlkKSB7XG4gICAgICAgIGNhc2UgXCJhZG1pblNpZ25JblwiOlxuICAgICAgICAgIG5ldyBBZG1pblNpZ25JblBhZ2VVSShlLnRhcmdldCwgbmV3IEFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIodGhpcykpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBcInN1YnNjcmlwdGlvblwiOlxuICAgICAgICAgIG5ldyBTdWJzY3JpcHRpb25QYWdlVUkoZS50YXJnZXQsIG5ldyBTdWJzY3JpcHRpb25QYWdlQ29udHJvbGxlcih0aGlzKSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGFyZVdlT25UaXplbigpOiBib29sZWFuIHsgcmV0dXJuIHdpbmRvdy5oYXNPd25Qcm9wZXJ0eShcInRpemVuXCIpOyB9XG4gIGV4aXRBcHAoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNJdE9rVG9FeGl0KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvL0B0cy1pZ25vcmUgLy9UT0RPIHRvIGJlIGZpeGVkIHdoZW4gaGF2ZSBUaXplbiB0eXBlIGRlZmluaXRpb25zXG4gICAgICAgIHRpemVuLmFwcGxpY2F0aW9uLmdldEN1cnJlbnRBcHBsaWNhdGlvbigpLmV4aXQoKTtcbiAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXQgaXNJdE9rVG9FeGl0KCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZSB9XG4gIHByaXZhdGUgaW5pdFRpemVuSFdLZXlIYW5kbGVyKGFsOiBJQXBwTG9naWMpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcImluaXRUaXplbkhXS2V5SGFuZGxlcjpcIiwgYEFyZSBXZSBvbiBUaXplbiAke2FsLmFyZVdlT25UaXplbn1gKVxuICAgIGlmIChhbC5hcmVXZU9uVGl6ZW4pIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RpemVuaHdrZXknLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAvL0B0cy1pZ25vcmUgLy9UT0RPIHRvIGJlIGZpeGVkIGxhdGVyXG4gICAgICAgIGlmIChlLmtleU5hbWUgPT0gXCJiYWNrXCIgJiYgYWwuaXNJdE9rVG9FeGl0KSBhbC5leGl0QXBwKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBEZW1vU2VydmljZUFkbWluSW1wbCBpbXBsZW1lbnRzIElTZXJ2aWNlQWRtaW4ge1xuICBkYXRhOiBJU3Vic2NyaXB0aW9uRGV0YWlscyA9IHtcbiAgICBsaWNlbnNlczogNixcbiAgICB1c2VyczogW1wiam9oblwiLCBcIm1hbmFnZXJcIiwgXCJvdHRvXCIsIFwiandcIiwgXCJwYlwiXSxcbiAgICBwcm9maWxlczogW1xuICAgICAgeyBuYW1lOiBcIlRlc3RcIiwgaHR0cHM6IGZhbHNlLCBob3N0TmFtZTogXCJib3RvbmQtcGNcIiwgYXBpTmFtZTogXCJhcGlcIiwgcG9ydE51bWJlcjogNTYwMDAsIGNvbXBhbnlEQjogXCJTQk9EZW1vVVNcIiwgZGlBcGlVc2VyOiBcIm1hbmFnZXJcIiwgZGlVc2VyUGFzc3dvcmQ6IFwiMTIzXCIgfSxcbiAgICAgIHsgbmFtZTogXCJQcm9kXCIsIGh0dHBzOiBmYWxzZSwgaG9zdE5hbWU6IFwiYm90b25kLXBjXCIsIGFwaU5hbWU6IFwiYXBpXCIsIHBvcnROdW1iZXI6IDU2MDAwLCBjb21wYW55REI6IFwiU0JPRGVtb1VTXCIsIGRpQXBpVXNlcjogXCJtYW5hZ2VyXCIsIGRpVXNlclBhc3N3b3JkOiBcIjEyM1wiIH0sXG4gICAgXVxuICB9XG4gIHNpZ25JbihzdWJzY3JpcHRpb25OdW1iZXI6IHN0cmluZywgcGluOiBzdHJpbmcpOiBJU3Vic2NyaXB0aW9uRGV0YWlscyB7XG4gICAgaWYgKHN1YnNjcmlwdGlvbk51bWJlci5pbmNsdWRlcyhcIjlcIikgJiYgcGluKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7IGVycm9yOiB7IGVycm9yQ29kZTogMTAwMSwgZXJyb3JUZXh0OiBgSW52YWxpZCBzdWJzY3JpcHRpb24gbnVtYmVyICR7c3Vic2NyaXB0aW9uTnVtYmVyfSBIYXMgbm8gZGlnaXQgOSBvciBubyBQSU5gIH0gfVxuICAgIH1cbiAgfVxufSIsImltcG9ydCB7XG4gIElBcHBEYXRhLCBJQWRtaW5TaWduSW5QYWdlVUksIElBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyLCBJQXBwTG9naWMsXG4gIElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyLCBJU3Vic2NyaXB0aW9uUGFnZVVJXG59IGZyb20gXCIuL2ludGVyZmFjZXNcIlxuaW1wb3J0IHRoZW1lQ2hhbmdlciBmcm9tIFwiLi90aGVtZWNoYW5nZXJcIlxuZXhwb3J0IGNsYXNzIENvbnRyb2xsZXI8VUk+IHtcbiAgcmVhZG9ubHkgYWw6IElBcHBMb2dpY1xuICBjb25zdHJ1Y3RvcihhbDogSUFwcExvZ2ljKSB7IHRoaXMuYWwgPSBhbCB9XG4gIHByaXZhdGUgX3VpPzogVUlcbiAgc2V0IHVpKHY6IFVJKSB7IHRoaXMuX3VpID0gdiB9XG4gIGdldCB1aSgpOiBVSSB7IGlmICh0aGlzLl91aSkgcmV0dXJuIHRoaXMuX3VpOyBlbHNlIHRocm93IG5ldyBFcnJvcihcIlVJIG5vdCBkZWZpbmVkIGZvciBjb250cm9sbGVyXCIpIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyPElBZG1pblNpZ25JblBhZ2VVST4gaW1wbGVtZW50cyBJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlciB7XG4gIGNvbnN0cnVjdG9yKGFsOiBJQXBwTG9naWMpIHsgc3VwZXIoYWwpIH1cbiAgb25FeGl0KCk6IHZvaWQge1xuICAgIHRoaXMuYWwuZXhpdEFwcCgpXG4gIH1cbiAgb25TaWduSW4oc3Vic2NyaXB0aW9uTnVtYmVyPzogc3RyaW5nLCBwaW4/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLmFsLmRhdGFTdG9yZS5zYXZlU3Vic2NyaXB0aW9uTnVtYmVyQW5kUElOKHN1YnNjcmlwdGlvbk51bWJlciwgcGluKVxuICAgIGlmIChzdWJzY3JpcHRpb25OdW1iZXIgJiYgcGluKSB7XG4gICAgICB0aGlzLmFsLnN1YnNjcmlwdGlvbkRldGFpbHMgPSB0aGlzLmFsLnNlcnZpY2VBZG1pbkFwaS5zaWduSW4oc3Vic2NyaXB0aW9uTnVtYmVyLCBwaW4pXG4gICAgICBpZiAodGhpcy5hbC5zdWJzY3JpcHRpb25EZXRhaWxzLmVycm9yKSB7XG4gICAgICAgIHRoaXMudWkuc2hvd01lc3NhZ2VPblBhbmVsKHRoaXMuYWwuc3Vic2NyaXB0aW9uRGV0YWlscy5lcnJvci5lcnJvclRleHQpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9UaGUgZGV0YWlscyBhcmUgaW4gdGhlIGFwcCBsb2dpYyBmb3IgbmV4dCBzY3JlZW5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51aS5zaG93TWVzc2FnZU9uUGFuZWwoYE5vIHN1YnNjcmlwdGlvbiBudW1iZXIgKCR7c3Vic2NyaXB0aW9uTnVtYmVyfSkgb3IgUElOICgke3Bpbn0pIGRlZmluZWRgKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIG9uUGFnZVNob3coKSB7XG4gICAgY29uc3QgYXBwRGF0YTogSUFwcERhdGEgPSB0aGlzLmFsLmRhdGFTdG9yZS5nZXRBcHBEYXRhKClcbiAgICAvLyBSZXRyaWV2ZSBzYXZlZCBzdWJzY3JpcHRpb24gbnVtYmVyIGFuZCBQSU4gZnJvbSBsb2NhbCBzdG9yZVxuICAgIGlmIChhcHBEYXRhLnN1YnNjcmlwdGlvbk51bWJlcikgdGhpcy51aS5zZXRTdWJzY3JpcHRpb25OdW1iZXIoYXBwRGF0YS5zdWJzY3JpcHRpb25OdW1iZXIpXG4gICAgaWYgKCF0aGlzLmFsLmFyZVdlT25UaXplbikgdGhpcy51aS5oaWRlRXhpdCgpXG4gICAgY29uc29sZS5sb2coXCJBZG1pbiBTaWduSW4gUGFnZSBzaG93blwiKVxuICB9XG4gIG9uVGhlbWUodGg6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuYWwudGhlbWUgPSB0aFxuICAgIHRoZW1lQ2hhbmdlcih0aClcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3Vic2NyaXB0aW9uUGFnZUNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyPElTdWJzY3JpcHRpb25QYWdlVUk+IGltcGxlbWVudHMgSVN1YnNjcmlwdGlvUGFnZUNvbnRyb2xsZXIge1xuICBjb25zdHJ1Y3RvcihhbDogSUFwcExvZ2ljKSB7IHN1cGVyKGFsKSB9XG4gIG9uUGFnZVNob3coKSB7XG4gICAgdGhpcy51aS5zaG93U3Vic2NyaXB0aW9uRGV0YWlscyh0aGlzLmFsLnN1YnNjcmlwdGlvbkRldGFpbHMpXG4gICAgY29uc29sZS5sb2coXCJTdWJzY3JpcHRpb24gUGFnZSBzaG93blwiKVxuICAgIHRoZW1lQ2hhbmdlcih0aGlzLmFsLnRoZW1lKVxuICB9XG59IiwiZXhwb3J0IGludGVyZmFjZSBJQXBwRGF0YSB7XG4gIHN1YnNjcmlwdGlvbk51bWJlcj86c3RyaW5nLFxuICBwaW4/OnN0cmluZyxcbiAgdGhlbWU/OnN0cmluZyxcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSURhdGFTdG9yZSB7XG4gIHNhdmVTdWJzY3JpcHRpb25OdW1iZXJBbmRQSU4oc3Vic2NyaXB0aW9uTnVtYmVyPzpzdHJpbmcscGluPzpzdHJpbmcpOnZvaWQsXG4gIHNhdmVBcHBEYXRhKGRhdGE6SUFwcERhdGEpOnZvaWQsXG4gIGdldEFwcERhdGEoKTpJQXBwRGF0YSxcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUFwcExvZ2ljIHtcbiAgZGF0YVN0b3JlOklEYXRhU3RvcmUsXG4gIHNlcnZpY2VBZG1pbkFwaTpJU2VydmljZUFkbWluLFxuICBzdWJzY3JpcHRpb25EZXRhaWxzOklTdWJzY3JpcHRpb25EZXRhaWxzLFxuICBhcmVXZU9uVGl6ZW46Ym9vbGVhbixcbiAgdGhlbWU6c3RyaW5nLFxuICBleGl0QXBwKCk6dm9pZCxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ29udHJvbGxlcjxVST4ge1xuICB1aTpVSSxcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVBhZ2VVSSB7fVxuZXhwb3J0IGludGVyZmFjZSBJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlciBleHRlbmRzIElDb250cm9sbGVyPElBZG1pblNpZ25JblBhZ2VVST4ge1xuICBvblNpZ25JbihzdWJzY3JpcHRpb25OdW1iZXI/OiBzdHJpbmcsIHBpbj86IHN0cmluZyk6IGJvb2xlYW4sXG4gIG9uUGFnZVNob3coKTp2b2lkLFxuICBvbkV4aXQoKTp2b2lkLFxuICBvblRoZW1lKHRoOnN0cmluZyk6dm9pZCxcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUFkbWluU2lnbkluUGFnZVVJIGV4dGVuZHMgSVBhZ2VVSSB7XG4gIHNldFN1YnNjcmlwdGlvbk51bWJlcihuOnN0cmluZyk6dm9pZCxcbiAgc2hvd01lc3NhZ2VPblBhbmVsKG1zZzpzdHJpbmcpOnZvaWQsXG4gIGhpZGVFeGl0KCk6dm9pZCxcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVN1YnNjcmlwdGlvblBhZ2VVSSBleHRlbmRzIElQYWdlVUkge1xuICBzaG93U3Vic2NyaXB0aW9uRGV0YWlscyhkZXRhaWxzOklTdWJzY3JpcHRpb25EZXRhaWxzKTp2b2lkLFxufVxuZXhwb3J0IGludGVyZmFjZSBJU3Vic2NyaXB0aW9QYWdlQ29udHJvbGxlciBleHRlbmRzIElDb250cm9sbGVyPElTdWJzY3JpcHRpb25QYWdlVUk+e1xuICBvblBhZ2VTaG93KCk6dm9pZCxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU2VydmljZUFkbWluIHtcbiAgc2lnbkluKHN1YnNjcmlwdGlvbk51bWJlcjpzdHJpbmcscGluOnN0cmluZyk6SVN1YnNjcmlwdGlvbkRldGFpbHMsXG59XG5leHBvcnQgaW50ZXJmYWNlIElTdWJzY3JpcHRpb25EZXRhaWxzIHtcbiAgZXJyb3I/OklTZXJ2aWNlRXJyb3IsXG4gIGxpY2Vuc2VzPzpudW1iZXIsXG4gIHVzZXJzPzpzdHJpbmdbXSxcbiAgcHJvZmlsZXM/OklQcm9maWxlRGV0YWlsc1tdLFxufVxuZXhwb3J0IGludGVyZmFjZSBJUHJvZmlsZURldGFpbHMge1xuICBuYW1lOnN0cmluZyxcbiAgaHR0cHM6Ym9vbGVhbixcbiAgaG9zdE5hbWU6c3RyaW5nLFxuICBhcGlOYW1lOnN0cmluZyxcbiAgcG9ydE51bWJlcjpudW1iZXIsXG4gIGNvbXBhbnlEQjpzdHJpbmcsXG4gIGRpQXBpVXNlcjpzdHJpbmcsXG4gIGRpVXNlclBhc3N3b3JkOnN0cmluZyxcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VFcnJvciB7XG4gIGVycm9yQ29kZTpudW1iZXIsXG4gIGVycm9yVGV4dDpzdHJpbmcsXG59XG4vLz09PT09PT09PT09PT09PT09PT09IFVUSUxJVFkgRlVOQ1RJT05TID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5KUU1QYW5lbChwYW5lbElkOnN0cmluZykge1xuICBjb25zdCBwOkpRdWVyeTxIVE1MRWxlbWVudD4gPSAkKHBhbmVsSWQpXG4gIC8vQHRzLWlnbm9yZSAvL1RPRE8gVGhlIHBhbmVsKCkgaXMgbm90IGRlY2xhcmVkLCB1bmZvcnR1bmF0ZWx5LCBpbiBKUU0gdHlwZXMsIGJ1dCB3b3JrcyBmaW5lXG4gIHAucGFuZWwoXCJvcGVuXCIpXG59XG5leHBvcnQgZnVuY3Rpb24gc2V0SFRNTEVsZW1lbnRUZXh0KGlkOnN0cmluZywgczpzdHJpbmcpIHtcbiAgY29uc3QgZSA9ICQoaWQpXG4gIGlmKGUubGVuZ3RoKSBlLnRleHQocylcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoYE5vIGVsZW1lbnQgZm91bmQgd2l0aCBJRCAke2lkfWApXG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0SFRNTEVsZW1lbnRWYWwoaWQ6c3RyaW5nKTpzdHJpbmcgfCB1bmRlZmluZWQge1xuICBjb25zdCBlID0gJChpZClcbiAgaWYoZS5sZW5ndGgpIHJldHVybiBlLnZhbCgpPy50b1N0cmluZygpXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yKGBObyBlbGVtZW50IGZvdW5kIHdpdGggSUQgJHtpZH1gKVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNldEhUTUxFbGVtZW50VmFsKGlkOnN0cmluZywgczpzdHJpbmcpOnZvaWQge1xuICBjb25zdCBlID0gJChpZClcbiAgaWYoZS5sZW5ndGgpIGUudmFsKHMpXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yKGBObyBlbGVtZW50IGZvdW5kIHdpdGggSUQgJHtpZH1gKVxufSIsImltcG9ydCB7QXBwTG9naWN9IGZyb20gXCIuL2FwcGxvZ2ljXCJcbm5ldyBBcHBMb2dpYygpXG4iLCJpbXBvcnQge0lBZG1pblNpZ25JblBhZ2VVSSxJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlcixvcGVuSlFNUGFuZWwsXG4gIHNldEhUTUxFbGVtZW50VGV4dCxnZXRIVE1MRWxlbWVudFZhbCxzZXRIVE1MRWxlbWVudFZhbCxJQ29udHJvbGxlcixJUGFnZVVJLFxuICBJU3Vic2NyaXB0aW9uRGV0YWlscyxJU3Vic2NyaXB0aW9uUGFnZVVJLElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyfSBmcm9tIFwiLi9pbnRlcmZhY2VzXCJcblxuZXhwb3J0IGNsYXNzIFBhZ2VVSTxDVFIgZXh0ZW5kcyBJQ29udHJvbGxlcjxJUGFnZVVJPj4ge1xuICBwcml2YXRlIHJlYWRvbmx5IF9wYWdlOiBIVE1MRWxlbWVudFxuICBwcml2YXRlIHJlYWRvbmx5IF9jdHJsOiBDVFJcbiAgZ2V0IHBhZ2UoKTogSFRNTEVsZW1lbnQgeyByZXR1cm4gdGhpcy5fcGFnZSB9XG4gIGdldCBjdHJsKCk6Q1RSIHtpZih0aGlzLl9jdHJsKSByZXR1cm4gdGhpcy5fY3RybDsgZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJObyBDb250cm9sbGVyIGRlZmluZWQgZm9yIFVJIG9iamVjdFwiKX1cbiAgY29uc3RydWN0b3IocGFnZTogSFRNTEVsZW1lbnQsIGN0cmw6IENUUikge1xuICAgIHRoaXMuX3BhZ2UgPSBwYWdlXG4gICAgdGhpcy5fY3RybCA9IGN0cmxcbiAgICB0aGlzLl9jdHJsLnVpID0gdGhpcyAvLyBUaGlzIGlzIHRlcnJpYmx5IGltcG9ydGFudCB0byBwYXNzIHRoZSBVSSBvYmplY3QgdG8gdGhlIGNvbnRyb2xsZXJcbiAgfVxufSAgXG5cbmV4cG9ydCBjbGFzcyBBZG1pblNpZ25JblBhZ2VVSSBleHRlbmRzIFBhZ2VVSTxJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlcj4gIGltcGxlbWVudHMgSUFkbWluU2lnbkluUGFnZVVJe1xuICBjb25zdHJ1Y3RvcihwYWdlOiBIVE1MRWxlbWVudCwgY3RybDogSUFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIpIHtcbiAgICBzdXBlcihwYWdlLGN0cmwpXG4gICAgJChcIiNzaWduSW5cIikub24oXCJjbGlja1wiLCAoLyplKi8pID0+IHtcbiAgICAgIC8vZS5wcmV2ZW50RGVmYXVsdCgpIC8vIFRoaXMgaXMgYW5vdGhlciB3YXkgdG8gYmxvY2sgZGVmYXVsdCBIVE1MIGhhbmRsaW5nXG4gICAgICByZXR1cm4gdGhpcy5jdHJsLm9uU2lnbkluKFxuICAgICAgICBnZXRIVE1MRWxlbWVudFZhbChcIiNzdWJzY3JpcHRpb25OdW1iZXJcIiksIFxuICAgICAgICBnZXRIVE1MRWxlbWVudFZhbChcIiNwaW5cIikpIFxuICAgIH0pXG4gICAgJChwYWdlKS5vbihcInBhZ2ViZWZvcmVzaG93XCIsKCkgPT4geyAvL0RlcHJlY2F0ZWQgYXMgb2YgMS40LjAsIEhtbW1cbiAgICAgIHRoaXMuY3RybC5vblBhZ2VTaG93KClcbiAgICB9KVxuICAgICQoXCIjZXhpdFwiKS5vbihcImNsaWNrXCIsICgvKmUqLykgPT4ge1xuICAgICAgLy9lLnByZXZlbnREZWZhdWx0KCkgLy8gVGhpcyBpcyBhbm90aGVyIHdheSB0byBibG9jayBkZWZhdWx0IEhUTUwgaGFuZGxpbmdcbiAgICAgIHJldHVybiB0aGlzLmN0cmwub25FeGl0KCkgXG4gICAgfSlcbiAgICAkKFwiI3RoZW1lQVwiKS5vbihcImNsaWNrXCIsICgpID0+IHt0aGlzLmN0cmwub25UaGVtZShcImFcIil9KVxuICAgICQoXCIjdGhlbWVCXCIpLm9uKFwiY2xpY2tcIiwgKCkgPT4ge3RoaXMuY3RybC5vblRoZW1lKFwiYlwiKX0pXG4gICAgJChcIiN0aGVtZUNcIikub24oXCJjbGlja1wiLCAoKSA9PiB7dGhpcy5jdHJsLm9uVGhlbWUoXCJjXCIpfSlcbiAgICBjb25zb2xlLmxvZyhcIkFkbWluU2lnbkluUGFnZVVJIGNvbnN0cnVjdGVkXCIpXG4gIH1cbiAgc2V0U3Vic2NyaXB0aW9uTnVtYmVyKG46c3RyaW5nKSB7XG4gICAgc2V0SFRNTEVsZW1lbnRWYWwoXCIjc3Vic2NyaXB0aW9uTnVtYmVyXCIsbilcbiAgfVxuICBzaG93TWVzc2FnZU9uUGFuZWwobXNnOnN0cmluZykge1xuICAgIHNldEhUTUxFbGVtZW50VGV4dChcIiNhZG1pblNpZ25Jbk1lc3NhZ2VcIixtc2cpXG4gICAgLy8gJC5tb2JpbGUuY2hhbmdlUGFnZShcIiNhZG1pblNpZ25JblBhbmVsXCIpIC8vIFRoaXMgd29uJ3Qgd29yayB3aXRoIHBhbmVscyBzZWUgaHR0cHM6Ly9hcGkuanF1ZXJ5bW9iaWxlLmNvbS9wYW5lbC9cbiAgICBvcGVuSlFNUGFuZWwoXCIjYWRtaW5TaWduSW5QYW5lbFwiKVxuICAgIC8vJCggXCIjbXlwYW5lbFwiICkudHJpZ2dlciggXCJ1cGRhdGVsYXlvdXRcIiApIC8vTWF5YmUgdGhpcyBpcyByZXF1aXJlZCwgdG9vXG4gIH1cbiAgaGlkZUV4aXQoKTp2b2lkIHtcbiAgICAkKFwiI2V4aXRcIikuaGlkZSgpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN1YnNjcmlwdGlvblBhZ2VVSSBleHRlbmRzIFBhZ2VVSTxJU3Vic2NyaXB0aW9QYWdlQ29udHJvbGxlcj4gaW1wbGVtZW50cyBJU3Vic2NyaXB0aW9uUGFnZVVJe1xuICBjb25zdHJ1Y3RvcihwYWdlOiBIVE1MRWxlbWVudCwgY3RybDogSVN1YnNjcmlwdGlvUGFnZUNvbnRyb2xsZXIpIHtcbiAgICBzdXBlcihwYWdlLGN0cmwpXG4gICAgJChwYWdlKS5vbihcInBhZ2ViZWZvcmVzaG93XCIsKCkgPT4geyAvL0RlcHJlY2F0ZWQgYXMgb2YgMS40LjAsIEhtbW1cbiAgICAgIHRoaXMuY3RybC5vblBhZ2VTaG93KClcbiAgICB9KVxuICB9XG4gIHNob3dTdWJzY3JpcHRpb25EZXRhaWxzKGRldGFpbHM6SVN1YnNjcmlwdGlvbkRldGFpbHMpOnZvaWR7XG4gICAgc2V0SFRNTEVsZW1lbnRUZXh0KFwiI251bWJlck9mbGljZW5zZXNcIixcIlwiICsgZGV0YWlscy5saWNlbnNlcylcbiAgICBzZXRIVE1MRWxlbWVudFRleHQoXCIjbnVtYmVyT2ZVc2Vyc1wiLFwiXCIgKyBkZXRhaWxzLnVzZXJzPy5sZW5ndGgpXG4gICAgc2V0SFRNTEVsZW1lbnRUZXh0KFwiI251bWJlck9mUHJvZmlsZXNcIixcIlwiICsgZGV0YWlscy5wcm9maWxlcz8ubGVuZ3RoKVxuICB9XG59XG5cbiIsIi8vIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMyNjUyNDMzXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB1cGRhdGVUaGVtZShuZXdUaGVtZTpzdHJpbmcpIHtcbiAgdmFyIHJtYnRuQ2xhc3NlcyA9ICcnO1xuICB2YXIgcm1oZkNsYXNzZXMgPSAnJztcbiAgdmFyIHJtYmRDbGFzc2VzcyA9ICcnO1xuICB2YXIgYXJyID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnLCAnaScsICdqJywgJ2snLCAnbCcsICdtJywgJ24nLCAnbycsICdwJywgJ3EnLCAncicsICdzJ107IC8vIEkgaGFkIHRoZW1lcyBmcm9tIGEgdG8gc1xuICAvL0B0cy1pZ25vcmUgLy9UT0RPIGluZGV4IGlzIG5vdCB1c2VkLCBidXQgSSBkb24ndCB3YW50IHRvIGNoYW5nZSBpdFxuICAkLmVhY2goYXJyLCBmdW5jdGlvbihpbmRleCwgdmFsdWU6c3RyaW5nKSB7XG4gICAgICBybWJ0bkNsYXNzZXMgPSBybWJ0bkNsYXNzZXMgKyAnIHVpLWJ0bi11cC0nICsgdmFsdWUgKyAnIHVpLWJ0bi1ob3Zlci0nICsgdmFsdWU7XG4gICAgICBybWhmQ2xhc3NlcyA9IHJtaGZDbGFzc2VzICsgJyB1aS1iYXItJyArIHZhbHVlO1xuICAgICAgcm1iZENsYXNzZXNzID0gcm1iZENsYXNzZXNzICsgJyB1aS1ib2R5LScgKyB2YWx1ZSArICcgdWktcGFnZS10aGVtZS0nKyB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gcmVzZXQgYWxsIHRoZSBidXR0b25zIHdpZGdldHNcbiAgJC5tb2JpbGUuYWN0aXZlUGFnZS5maW5kKCcudWktYnRuJykubm90KCcudWktbGktZGl2aWRlcicpLnJlbW92ZUNsYXNzKHJtYnRuQ2xhc3NlcykuYWRkQ2xhc3MoJ3VpLWJ0bi11cC0nICsgbmV3VGhlbWUpLmF0dHIoJ2RhdGEtdGhlbWUnLCBuZXdUaGVtZSk7XG5cbiAgLy8gcmVzZXQgdGhlIGhlYWRlci9mb290ZXIgd2lkZ2V0c1xuICAkLm1vYmlsZS5hY3RpdmVQYWdlLmZpbmQoJy51aS1oZWFkZXIsIC51aS1mb290ZXInKS5yZW1vdmVDbGFzcyhybWhmQ2xhc3NlcykuYWRkQ2xhc3MoJ3VpLWJhci0nICsgbmV3VGhlbWUpLmF0dHIoJ2RhdGEtdGhlbWUnLCBuZXdUaGVtZSk7XG5cbiAgLy8gcmVzZXQgdGhlIHBhZ2Ugd2lkZ2V0XG4gICQubW9iaWxlLmFjdGl2ZVBhZ2UucmVtb3ZlQ2xhc3Mocm1iZENsYXNzZXNzKS5hZGRDbGFzcygndWktYm9keS0nICsgbmV3VGhlbWUgKyAnIHVpLXBhZ2UtdGhlbWUtJysgbmV3VGhlbWUpLmF0dHIoJ2RhdGEtdGhlbWUnLCBuZXdUaGVtZSk7XG5cbiAgLy8gdGFyZ2V0IHRoZSBsaXN0IGRpdmlkZXIgZWxlbWVudHMsIHRoZW4gaXRlcmF0ZSB0aHJvdWdoIHRoZW0gYW5kXG4gIC8vIGNoYW5nZSBpdHMgdGhlbWUgKHRoaXMgaXMgdGhlIGpRdWVyeSBNb2JpbGUgZGVmYXVsdCBmb3JcbiAgLy8gbGlzdC1kaXZpZGVycylcbiAgLy9AdHMtaWdub3JlIC8vVE9ETyBpbmRleCBhbmQgb2JqIGFyZSBub3QgdXNlZFxuICAkLm1vYmlsZS5hY3RpdmVQYWdlLmZpbmQoJy51aS1saS1kaXZpZGVyJykuZWFjaChmdW5jdGlvbihpbmRleCwgb2JqKSB7XG4gICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKHJtaGZDbGFzc2VzKS5hZGRDbGFzcygndWktYmFyLScgKyBuZXdUaGVtZSkuYXR0cignZGF0YS10aGVtZScsIG5ld1RoZW1lKTtcbiAgfSk7XG59OyJdfQ==
