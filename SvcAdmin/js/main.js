(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controllers_1 = require("./controllers");
const pages_1 = require("./pages");
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
        this.initTizenHWKeyHandler(this);
        $(document).on("pageinit", (e) => this.onPageInit(e));
    }
    onPageInit(e) {
        if (e.target instanceof HTMLElement) {
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

},{}],3:[function(require,module,exports){
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

},{"./interfaces":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwbG9naWMudHMiLCJzcmMvanMvY29udHJvbGxlcnMudHMiLCJzcmMvanMvaW50ZXJmYWNlcy50cyIsInNyYy9qcy9tYWluLnRzIiwic3JjL2pzL3BhZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSwrQ0FBcUY7QUFDckYsbUNBQStEO0FBQy9ELE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQTtBQUMxQixNQUFNLFNBQVM7SUFDYiw0QkFBNEIsQ0FBQyxrQkFBMkIsRUFBRSxHQUFZO1FBQ3BFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUM5QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQTtRQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3hCLENBQUM7SUFDRCxXQUFXLENBQUMsSUFBYztRQUN4QixZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDdEQsQ0FBQztJQUNELFVBQVU7UUFDUixNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3hDLElBQUksQ0FBQyxFQUFFO1lBQ0wsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUN2QixJQUFJLENBQUM7Z0JBQUUsT0FBTyxDQUFhLENBQUE7U0FDNUI7UUFDRCxPQUFPLEVBQUUsQ0FBQTtJQUNYLENBQUM7Q0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7RUFZRTtBQUNGLE1BQWEsUUFBUTtJQU9uQjtRQU5BLDJDQUEyQztRQUMzQyxrRUFBa0U7UUFDbEUseUlBQXlJO1FBQ3pJLGNBQVMsR0FBZSxJ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KXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiaW1wb3J0IHsgSUFwcERhdGEsIElEYXRhU3RvcmUsIElBcHBMb2dpYywgSVNlcnZpY2VBZG1pbiwgSVN1YnNjcmlwdGlvbkRldGFpbHMgfSBmcm9tIFwiLi9pbnRlcmZhY2VzXCJcbmltcG9ydCB7IEFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIsIFN1YnNjcmlwdGlvblBhZ2VDb250cm9sbGVyIH0gZnJvbSBcIi4vY29udHJvbGxlcnNcIlxuaW1wb3J0IHsgQWRtaW5TaWduSW5QYWdlVUksIFN1YnNjcmlwdGlvblBhZ2VVSSB9IGZyb20gXCIuL3BhZ2VzXCJcbmNvbnN0IFNUT1JFS0VZID0gXCJBcHBEYXRhXCJcbmNsYXNzIERhdGFTdG9yZSBpbXBsZW1lbnRzIElEYXRhU3RvcmUge1xuICBzYXZlU3Vic2NyaXB0aW9uTnVtYmVyQW5kUElOKHN1YnNjcmlwdGlvbk51bWJlcj86IHN0cmluZywgcGluPzogc3RyaW5nKSB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0QXBwRGF0YSgpXG4gICAgZGF0YS5waW4gPSBwaW5cbiAgICBkYXRhLnN1YnNjcmlwdGlvbk51bWJlciA9IHN1YnNjcmlwdGlvbk51bWJlclxuICAgIHRoaXMuc2F2ZUFwcERhdGEoZGF0YSlcbiAgfVxuICBzYXZlQXBwRGF0YShkYXRhOiBJQXBwRGF0YSkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFNUT1JFS0VZLCBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgfVxuICBnZXRBcHBEYXRhKCk6IElBcHBEYXRhIHtcbiAgICBjb25zdCB2ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oU1RPUkVLRVkpXG4gICAgaWYgKHYpIHtcbiAgICAgIGNvbnN0IG8gPSBKU09OLnBhcnNlKHYpXG4gICAgICBpZiAobykgcmV0dXJuIG8gYXMgSUFwcERhdGFcbiAgICB9XG4gICAgcmV0dXJuIHt9XG4gIH1cbn1cblxuLypcbldoZW4gYXBwIGlzIGxvYWRlZCwgY2hlY2sgaWYgdGhlcmUgaXMgc2F2ZWQgc3Vic2NyaXB0aW9uIG51bWJlciBhbmQgdXNlciwgaWYgdGhlcmUgaXMgcmVsb2FkIGl0XG5cbldoZW4gdXNlciBwcmVzc2VzIHNpZ24gaW4sIGl0IHRyaWVzIHRvIGNvbm5lY3QgdG8gZmlyZWJhc2Ugc2VydmljZSwgdmlhIGF1dGhlbnRpY2F0aW9uIFxudG8gZmluZCBpZiB0aGUgc2VydmljZSBpc2FjdGl2ZSBhbmQgdGhlIFBJTiBpcyBvaywgb3IganVzdCB1c2UgRkIgYXV0aGVudGljYXRpb24uXG5cbldoZW4gcGFnZSBpcyBpbml0aWFsaXplZCB3ZSBjcmVhdGUgYW4gb2JqZWN0IGZyb20gYSBjb250cm9sbGVyIGNsYXNzLlxuV2UgbmVlZCB0d28gaW50ZXJmYWNlcywgb25lIGZvciB0aGUgc2NyZWVuIGZvciBjb21tYW5kcyB0byBzaG93IGRhdGFcbkFuIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBhcHBsaWNhdGlvbiBjb250cm9sbGVyIHRvIHJlY2VpdmUgZXZlbnRzIGZyb20gdGhlIHBhZ2UuXG5UaGVzZSB0d28gaW50ZXJmYWNlcyBmb3JtYWxseSBkZWZpbmUgdGhlIGNvbnRyYWN0IGJldHdlZW4gdGhlIGNvbW11bmljYXRpb24gcHJvdG9jb2wgYmV0d2VlbiB0aGUgVUlcbmFuZCB0aGUgYXBwIGxvZ2ljL2NvbnRyb2xsZXIuXG5FdmVyeSBVSSBvYmplY3QgaXMgYSBtZXNzYWdlIGRpc3BhdGNoZXIgdGhhdCBpcyByZWdpc3RlcmVkIGl0cyBsaXN0ZW5lcnMgd2l0aCBKUSBmb3IgdGhlIGFwcHJvcHJpYXRlIG9iamVjdC5cbiovXG5leHBvcnQgY2xhc3MgQXBwTG9naWMgaW1wbGVtZW50cyBJQXBwTG9naWMge1xuICAvLyBwcml2YXRlIF9hZG1pblNpZ25Jbj86IEFkbWluU2lnbkluUGFnZVVJXG4gIC8vIHNldCBhZG1pblNpZ25Jbih2OiBBZG1pblNpZ25JblBhZ2VVSSkgeyB0aGlzLl9hZG1pblNpZ25JbiA9IHYgfVxuICAvLyBnZXQgYWRtaW5TaWduSW4oKTogQWRtaW5TaWduSW5QYWdlVUkgeyBpZiAodGhpcy5fYWRtaW5TaWduSW4pIHJldHVybiB0aGlzLl9hZG1pblNpZ25JbjsgZWxzZSB0aHJvdyBuZXcgRXJyb3IoXCJObyBBZG1pblNpZ25JblBhZ2VVSVwiKSB9XG4gIGRhdGFTdG9yZTogSURhdGFTdG9yZSA9IG5ldyBEYXRhU3RvcmUoKVxuICBzZXJ2aWNlQWRtaW5BcGk6IElTZXJ2aWNlQWRtaW4gPSBuZXcgRGVtb1NlcnZpY2VBZG1pbkltcGwoKVxuICBzdWJzY3JpcHRpb25EZXRhaWxzOiBJU3Vic2NyaXB0aW9uRGV0YWlscyA9IHt9XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdFRpemVuSFdLZXlIYW5kbGVyKHRoaXMpXG4gICAgJChkb2N1bWVudCkub24oXCJwYWdlaW5pdFwiLCAoZSkgPT4gdGhpcy5vblBhZ2VJbml0KGUpKVxuICB9XG4gIG9uUGFnZUluaXQoZTogSlF1ZXJ5LlRyaWdnZXJlZEV2ZW50PERvY3VtZW50LCB1bmRlZmluZWQsIERvY3VtZW50LCBEb2N1bWVudD4pIHtcbiAgICBpZiAoZS50YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgc3dpdGNoIChlLnRhcmdldC5pZCkge1xuICAgICAgICBjYXNlIFwiYWRtaW5TaWduSW5cIjpcbiAgICAgICAgICBuZXcgQWRtaW5TaWduSW5QYWdlVUkoZS50YXJnZXQsIG5ldyBBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyKHRoaXMpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgXCJzdWJzY3JpcHRpb25cIjpcbiAgICAgICAgICBuZXcgU3Vic2NyaXB0aW9uUGFnZVVJKGUudGFyZ2V0LCBuZXcgU3Vic2NyaXB0aW9uUGFnZUNvbnRyb2xsZXIodGhpcykpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGdldCBhcmVXZU9uVGl6ZW4oKTogYm9vbGVhbiB7IHJldHVybiB3aW5kb3cuaGFzT3duUHJvcGVydHkoXCJ0aXplblwiKTsgfVxuICBleGl0QXBwKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzSXRPa1RvRXhpdCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy9AdHMtaWdub3JlIC8vVE9ETyB0byBiZSBmaXhlZCB3aGVuIGhhdmUgVGl6ZW4gdHlwZSBkZWZpbml0aW9uc1xuICAgICAgICB0aXplbi5hcHBsaWNhdGlvbi5nZXRDdXJyZW50QXBwbGljYXRpb24oKS5leGl0KCk7XG4gICAgICB9IGNhdGNoIChpZ25vcmUpIHtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGlzSXRPa1RvRXhpdCgpOiBib29sZWFuIHsgcmV0dXJuIHRydWUgfVxuICBwcml2YXRlIGluaXRUaXplbkhXS2V5SGFuZGxlcihhbDogSUFwcExvZ2ljKSB7XG4gICAgLy8gY29uc29sZS5sb2coXCJpbml0VGl6ZW5IV0tleUhhbmRsZXI6XCIsIGBBcmUgV2Ugb24gVGl6ZW4gJHthbC5hcmVXZU9uVGl6ZW59YClcbiAgICBpZiAoYWwuYXJlV2VPblRpemVuKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0aXplbmh3a2V5JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgLy9AdHMtaWdub3JlIC8vVE9ETyB0byBiZSBmaXhlZCBsYXRlclxuICAgICAgICBpZiAoZS5rZXlOYW1lID09IFwiYmFja1wiICYmIGFsLmlzSXRPa1RvRXhpdCkgYWwuZXhpdEFwcCgpXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgRGVtb1NlcnZpY2VBZG1pbkltcGwgaW1wbGVtZW50cyBJU2VydmljZUFkbWluIHtcbiAgZGF0YTogSVN1YnNjcmlwdGlvbkRldGFpbHMgPSB7XG4gICAgbGljZW5zZXM6IDYsXG4gICAgdXNlcnM6IFtcImpvaG5cIiwgXCJtYW5hZ2VyXCIsIFwib3R0b1wiLCBcImp3XCIsIFwicGJcIl0sXG4gICAgcHJvZmlsZXM6IFtcbiAgICAgIHsgbmFtZTogXCJUZXN0XCIsIGh0dHBzOiBmYWxzZSwgaG9zdE5hbWU6IFwiYm90b25kLXBjXCIsIGFwaU5hbWU6IFwiYXBpXCIsIHBvcnROdW1iZXI6IDU2MDAwLCBjb21wYW55REI6IFwiU0JPRGVtb1VTXCIsIGRpQXBpVXNlcjogXCJtYW5hZ2VyXCIsIGRpVXNlclBhc3N3b3JkOiBcIjEyM1wiIH0sXG4gICAgICB7IG5hbWU6IFwiUHJvZFwiLCBodHRwczogZmFsc2UsIGhvc3ROYW1lOiBcImJvdG9uZC1wY1wiLCBhcGlOYW1lOiBcImFwaVwiLCBwb3J0TnVtYmVyOiA1NjAwMCwgY29tcGFueURCOiBcIlNCT0RlbW9VU1wiLCBkaUFwaVVzZXI6IFwibWFuYWdlclwiLCBkaVVzZXJQYXNzd29yZDogXCIxMjNcIiB9LFxuICAgIF1cbiAgfVxuICBzaWduSW4oc3Vic2NyaXB0aW9uTnVtYmVyOiBzdHJpbmcsIHBpbjogc3RyaW5nKTogSVN1YnNjcmlwdGlvbkRldGFpbHMge1xuICAgIGlmIChzdWJzY3JpcHRpb25OdW1iZXIuaW5jbHVkZXMoXCI5XCIpICYmIHBpbikge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4geyBlcnJvcjogeyBlcnJvckNvZGU6IDEwMDEsIGVycm9yVGV4dDogYEludmFsaWQgc3Vic2NyaXB0aW9uIG51bWJlciAke3N1YnNjcmlwdGlvbk51bWJlcn0gSGFzIG5vIGRpZ2l0IDkgb3Igbm8gUElOYCB9IH1cbiAgICB9XG4gIH1cbn0iLCJpbXBvcnQge0lBcHBEYXRhLElBZG1pblNpZ25JblBhZ2VVSSxJQWRtaW5TaWduSW5QYWdlQ29udHJvbGxlcixJQXBwTG9naWMsXG4gIElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyLElTdWJzY3JpcHRpb25QYWdlVUl9IGZyb20gXCIuL2ludGVyZmFjZXNcIlxuXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlcjxVST4ge1xuICByZWFkb25seSBhbDogSUFwcExvZ2ljXG4gIGNvbnN0cnVjdG9yKGFsOiBJQXBwTG9naWMpIHt0aGlzLmFsID0gYWx9XG4gIHByaXZhdGUgX3VpPzogVUlcbiAgc2V0IHVpKHY6VUkpIHt0aGlzLl91aSA9IHZ9XG4gIGdldCB1aSgpOlVJIHsgaWYgKHRoaXMuX3VpKSByZXR1cm4gdGhpcy5fdWk7IGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiVUkgbm90IGRlZmluZWQgZm9yIGNvbnRyb2xsZXJcIikgfVxufSAgXG5cbmV4cG9ydCBjbGFzcyBBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlcjxJQWRtaW5TaWduSW5QYWdlVUk+IGltcGxlbWVudHMgSUFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXJ7XG4gIGNvbnN0cnVjdG9yKGFsOiBJQXBwTG9naWMpIHsgc3VwZXIoYWwpfVxuICBvbkV4aXQoKTp2b2lkIHtcbiAgICB0aGlzLmFsLmV4aXRBcHAoKVxuICB9XG4gIG9uU2lnbkluKHN1YnNjcmlwdGlvbk51bWJlcj86IHN0cmluZywgcGluPzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy5hbC5kYXRhU3RvcmUuc2F2ZVN1YnNjcmlwdGlvbk51bWJlckFuZFBJTihzdWJzY3JpcHRpb25OdW1iZXIscGluKVxuICAgIGlmKHN1YnNjcmlwdGlvbk51bWJlciAmJiBwaW4pIHtcbiAgICAgIHRoaXMuYWwuc3Vic2NyaXB0aW9uRGV0YWlscyA9IHRoaXMuYWwuc2VydmljZUFkbWluQXBpLnNpZ25JbihzdWJzY3JpcHRpb25OdW1iZXIscGluKVxuICAgICAgaWYodGhpcy5hbC5zdWJzY3JpcHRpb25EZXRhaWxzLmVycm9yKSAge1xuICAgICAgICB0aGlzLnVpLnNob3dNZXNzYWdlT25QYW5lbCh0aGlzLmFsLnN1YnNjcmlwdGlvbkRldGFpbHMuZXJyb3IuZXJyb3JUZXh0KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vVGhlIGRldGFpbHMgYXJlIGluIHRoZSBhcHAgbG9naWMgZm9yIG5leHQgc2NyZWVuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudWkuc2hvd01lc3NhZ2VPblBhbmVsKGBObyBzdWJzY3JpcHRpb24gbnVtYmVyICgke3N1YnNjcmlwdGlvbk51bWJlcn0pIG9yIFBJTiAoJHtwaW59KSBkZWZpbmVkYClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICBvblBhZ2VTaG93KCl7XG4gICAgY29uc3QgYXBwRGF0YTpJQXBwRGF0YSA9IHRoaXMuYWwuZGF0YVN0b3JlLmdldEFwcERhdGEoKVxuICAgIC8vIFJldHJpZXZlIHNhdmVkIHN1YnNjcmlwdGlvbiBudW1iZXIgYW5kIFBJTiBmcm9tIGxvY2FsIHN0b3JlXG4gICAgaWYoYXBwRGF0YS5zdWJzY3JpcHRpb25OdW1iZXIpIHRoaXMudWkuc2V0U3Vic2NyaXB0aW9uTnVtYmVyKGFwcERhdGEuc3Vic2NyaXB0aW9uTnVtYmVyKVxuICAgIGlmKCF0aGlzLmFsLmFyZVdlT25UaXplbikgdGhpcy51aS5oaWRlRXhpdCgpXG4gICAgY29uc29sZS5sb2coXCJBZG1pbiBTaWduSW4gUGFnZSBzaG93blwiKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdWJzY3JpcHRpb25QYWdlQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXI8SVN1YnNjcmlwdGlvblBhZ2VVST4gaW1wbGVtZW50cyBJU3Vic2NyaXB0aW9QYWdlQ29udHJvbGxlcntcbiAgY29uc3RydWN0b3IoYWw6IElBcHBMb2dpYykge3N1cGVyKGFsKX1cbiAgb25QYWdlU2hvdygpe1xuICAgIHRoaXMudWkuc2hvd1N1YnNjcmlwdGlvbkRldGFpbHModGhpcy5hbC5zdWJzY3JpcHRpb25EZXRhaWxzKVxuICAgIGNvbnNvbGUubG9nKFwiU3Vic2NyaXB0aW9uIFBhZ2Ugc2hvd25cIilcbiAgfVxufSIsImV4cG9ydCBpbnRlcmZhY2UgSUFwcERhdGEge1xuICBzdWJzY3JpcHRpb25OdW1iZXI/OnN0cmluZyxcbiAgcGluPzpzdHJpbmcsXG59XG5leHBvcnQgaW50ZXJmYWNlIElEYXRhU3RvcmUge1xuICBzYXZlU3Vic2NyaXB0aW9uTnVtYmVyQW5kUElOKHN1YnNjcmlwdGlvbk51bWJlcj86c3RyaW5nLHBpbj86c3RyaW5nKTp2b2lkLFxuICBzYXZlQXBwRGF0YShkYXRhOklBcHBEYXRhKTp2b2lkLFxuICBnZXRBcHBEYXRhKCk6SUFwcERhdGEsXG59XG5leHBvcnQgaW50ZXJmYWNlIElBcHBMb2dpYyB7XG4gIGRhdGFTdG9yZTpJRGF0YVN0b3JlLFxuICBzZXJ2aWNlQWRtaW5BcGk6SVNlcnZpY2VBZG1pbixcbiAgc3Vic2NyaXB0aW9uRGV0YWlsczpJU3Vic2NyaXB0aW9uRGV0YWlscyxcbiAgYXJlV2VPblRpemVuOmJvb2xlYW4sXG4gIGV4aXRBcHAoKTp2b2lkLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElDb250cm9sbGVyPFVJPiB7XG4gIHVpOlVJLFxufVxuZXhwb3J0IGludGVyZmFjZSBJUGFnZVVJIHt9XG5leHBvcnQgaW50ZXJmYWNlIElBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyIGV4dGVuZHMgSUNvbnRyb2xsZXI8SUFkbWluU2lnbkluUGFnZVVJPiB7XG4gIG9uU2lnbkluKHN1YnNjcmlwdGlvbk51bWJlcj86IHN0cmluZywgcGluPzogc3RyaW5nKTogYm9vbGVhbixcbiAgb25QYWdlU2hvdygpOnZvaWQsXG4gIG9uRXhpdCgpOnZvaWQsXG59XG5leHBvcnQgaW50ZXJmYWNlIElBZG1pblNpZ25JblBhZ2VVSSBleHRlbmRzIElQYWdlVUkge1xuICBzZXRTdWJzY3JpcHRpb25OdW1iZXIobjpzdHJpbmcpOnZvaWQsXG4gIHNob3dNZXNzYWdlT25QYW5lbChtc2c6c3RyaW5nKTp2b2lkLFxuICBoaWRlRXhpdCgpOnZvaWQsXG59XG5leHBvcnQgaW50ZXJmYWNlIElTdWJzY3JpcHRpb25QYWdlVUkgZXh0ZW5kcyBJUGFnZVVJIHtcbiAgc2hvd1N1YnNjcmlwdGlvbkRldGFpbHMoZGV0YWlsczpJU3Vic2NyaXB0aW9uRGV0YWlscyk6dm9pZCxcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVN1YnNjcmlwdGlvUGFnZUNvbnRyb2xsZXIgZXh0ZW5kcyBJQ29udHJvbGxlcjxJU3Vic2NyaXB0aW9uUGFnZVVJPntcbiAgb25QYWdlU2hvdygpOnZvaWQsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VBZG1pbiB7XG4gIHNpZ25JbihzdWJzY3JpcHRpb25OdW1iZXI6c3RyaW5nLHBpbjpzdHJpbmcpOklTdWJzY3JpcHRpb25EZXRhaWxzLFxufVxuZXhwb3J0IGludGVyZmFjZSBJU3Vic2NyaXB0aW9uRGV0YWlscyB7XG4gIGVycm9yPzpJU2VydmljZUVycm9yLFxuICBsaWNlbnNlcz86bnVtYmVyLFxuICB1c2Vycz86c3RyaW5nW10sXG4gIHByb2ZpbGVzPzpJUHJvZmlsZURldGFpbHNbXSxcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVByb2ZpbGVEZXRhaWxzIHtcbiAgbmFtZTpzdHJpbmcsXG4gIGh0dHBzOmJvb2xlYW4sXG4gIGhvc3ROYW1lOnN0cmluZyxcbiAgYXBpTmFtZTpzdHJpbmcsXG4gIHBvcnROdW1iZXI6bnVtYmVyLFxuICBjb21wYW55REI6c3RyaW5nLFxuICBkaUFwaVVzZXI6c3RyaW5nLFxuICBkaVVzZXJQYXNzd29yZDpzdHJpbmcsXG59XG5leHBvcnQgaW50ZXJmYWNlIElTZXJ2aWNlRXJyb3Ige1xuICBlcnJvckNvZGU6bnVtYmVyLFxuICBlcnJvclRleHQ6c3RyaW5nLFxufVxuLy89PT09PT09PT09PT09PT09PT09PSBVVElMSVRZIEZVTkNUSU9OUyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBmdW5jdGlvbiBvcGVuSlFNUGFuZWwocGFuZWxJZDpzdHJpbmcpIHtcbiAgY29uc3QgcDpKUXVlcnk8SFRNTEVsZW1lbnQ+ID0gJChwYW5lbElkKVxuICAvL0B0cy1pZ25vcmUgLy9UT0RPIFRoZSBwYW5lbCgpIGlzIG5vdCBkZWNsYXJlZCwgdW5mb3J0dW5hdGVseSwgaW4gSlFNIHR5cGVzLCBidXQgd29ya3MgZmluZVxuICBwLnBhbmVsKFwib3BlblwiKVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNldEhUTUxFbGVtZW50VGV4dChpZDpzdHJpbmcsIHM6c3RyaW5nKSB7XG4gIGNvbnN0IGUgPSAkKGlkKVxuICBpZihlLmxlbmd0aCkgZS50ZXh0KHMpXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yKGBObyBlbGVtZW50IGZvdW5kIHdpdGggSUQgJHtpZH1gKVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEhUTUxFbGVtZW50VmFsKGlkOnN0cmluZyk6c3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgZSA9ICQoaWQpXG4gIGlmKGUubGVuZ3RoKSByZXR1cm4gZS52YWwoKT8udG9TdHJpbmcoKVxuICBlbHNlIHRocm93IG5ldyBFcnJvcihgTm8gZWxlbWVudCBmb3VuZCB3aXRoIElEICR7aWR9YClcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRIVE1MRWxlbWVudFZhbChpZDpzdHJpbmcsIHM6c3RyaW5nKTp2b2lkIHtcbiAgY29uc3QgZSA9ICQoaWQpXG4gIGlmKGUubGVuZ3RoKSBlLnZhbChzKVxuICBlbHNlIHRocm93IG5ldyBFcnJvcihgTm8gZWxlbWVudCBmb3VuZCB3aXRoIElEICR7aWR9YClcbn0iLCJpbXBvcnQge0FwcExvZ2ljfSBmcm9tIFwiLi9hcHBsb2dpY1wiXG5uZXcgQXBwTG9naWMoKVxuIiwiaW1wb3J0IHtJQWRtaW5TaWduSW5QYWdlVUksSUFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXIsb3BlbkpRTVBhbmVsLFxuICBzZXRIVE1MRWxlbWVudFRleHQsZ2V0SFRNTEVsZW1lbnRWYWwsc2V0SFRNTEVsZW1lbnRWYWwsSUNvbnRyb2xsZXIsSVBhZ2VVSSxcbiAgSVN1YnNjcmlwdGlvbkRldGFpbHMsSVN1YnNjcmlwdGlvblBhZ2VVSSxJU3Vic2NyaXB0aW9QYWdlQ29udHJvbGxlcn0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiXG5cbmV4cG9ydCBjbGFzcyBQYWdlVUk8Q1RSIGV4dGVuZHMgSUNvbnRyb2xsZXI8SVBhZ2VVST4+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfcGFnZTogSFRNTEVsZW1lbnRcbiAgcHJpdmF0ZSByZWFkb25seSBfY3RybDogQ1RSXG4gIGdldCBwYWdlKCk6IEhUTUxFbGVtZW50IHsgcmV0dXJuIHRoaXMuX3BhZ2UgfVxuICBnZXQgY3RybCgpOkNUUiB7aWYodGhpcy5fY3RybCkgcmV0dXJuIHRoaXMuX2N0cmw7IGVsc2UgdGhyb3cgbmV3IEVycm9yKFwiTm8gQ29udHJvbGxlciBkZWZpbmVkIGZvciBVSSBvYmplY3RcIil9XG4gIGNvbnN0cnVjdG9yKHBhZ2U6IEhUTUxFbGVtZW50LCBjdHJsOiBDVFIpIHtcbiAgICB0aGlzLl9wYWdlID0gcGFnZVxuICAgIHRoaXMuX2N0cmwgPSBjdHJsXG4gICAgdGhpcy5fY3RybC51aSA9IHRoaXMgLy8gVGhpcyBpcyB0ZXJyaWJseSBpbXBvcnRhbnQgdG8gcGFzcyB0aGUgVUkgb2JqZWN0IHRvIHRoZSBjb250cm9sbGVyXG4gIH1cbn0gIFxuXG5leHBvcnQgY2xhc3MgQWRtaW5TaWduSW5QYWdlVUkgZXh0ZW5kcyBQYWdlVUk8SUFkbWluU2lnbkluUGFnZUNvbnRyb2xsZXI+ICBpbXBsZW1lbnRzIElBZG1pblNpZ25JblBhZ2VVSXtcbiAgY29uc3RydWN0b3IocGFnZTogSFRNTEVsZW1lbnQsIGN0cmw6IElBZG1pblNpZ25JblBhZ2VDb250cm9sbGVyKSB7XG4gICAgc3VwZXIocGFnZSxjdHJsKVxuICAgICQoXCIjc2lnbkluXCIpLm9uKFwiY2xpY2tcIiwgKC8qZSovKSA9PiB7XG4gICAgICAvL2UucHJldmVudERlZmF1bHQoKSAvLyBUaGlzIGlzIGFub3RoZXIgd2F5IHRvIGJsb2NrIGRlZmF1bHQgSFRNTCBoYW5kbGluZ1xuICAgICAgcmV0dXJuIHRoaXMuY3RybC5vblNpZ25JbihcbiAgICAgICAgZ2V0SFRNTEVsZW1lbnRWYWwoXCIjc3Vic2NyaXB0aW9uTnVtYmVyXCIpLCBcbiAgICAgICAgZ2V0SFRNTEVsZW1lbnRWYWwoXCIjcGluXCIpKSBcbiAgICB9KVxuICAgICQocGFnZSkub24oXCJwYWdlYmVmb3Jlc2hvd1wiLCgpID0+IHsgLy9EZXByZWNhdGVkIGFzIG9mIDEuNC4wLCBIbW1tXG4gICAgICB0aGlzLmN0cmwub25QYWdlU2hvdygpXG4gICAgfSlcbiAgICAkKFwiI2V4aXRcIikub24oXCJjbGlja1wiLCAoLyplKi8pID0+IHtcbiAgICAgIC8vZS5wcmV2ZW50RGVmYXVsdCgpIC8vIFRoaXMgaXMgYW5vdGhlciB3YXkgdG8gYmxvY2sgZGVmYXVsdCBIVE1MIGhhbmRsaW5nXG4gICAgICByZXR1cm4gdGhpcy5jdHJsLm9uRXhpdCgpIFxuICAgIH0pXG4gICAgY29uc29sZS5sb2coXCJBZG1pblNpZ25JblBhZ2VVSSBjb25zdHJ1Y3RlZFwiKVxuICB9XG4gIHNldFN1YnNjcmlwdGlvbk51bWJlcihuOnN0cmluZykge1xuICAgIHNldEhUTUxFbGVtZW50VmFsKFwiI3N1YnNjcmlwdGlvbk51bWJlclwiLG4pXG4gIH1cbiAgc2hvd01lc3NhZ2VPblBhbmVsKG1zZzpzdHJpbmcpIHtcbiAgICBzZXRIVE1MRWxlbWVudFRleHQoXCIjYWRtaW5TaWduSW5NZXNzYWdlXCIsbXNnKVxuICAgIC8vICQubW9iaWxlLmNoYW5nZVBhZ2UoXCIjYWRtaW5TaWduSW5QYW5lbFwiKSAvLyBUaGlzIHdvbid0IHdvcmsgd2l0aCBwYW5lbHMgc2VlIGh0dHBzOi8vYXBpLmpxdWVyeW1vYmlsZS5jb20vcGFuZWwvXG4gICAgb3BlbkpRTVBhbmVsKFwiI2FkbWluU2lnbkluUGFuZWxcIilcbiAgICAvLyQoIFwiI215cGFuZWxcIiApLnRyaWdnZXIoIFwidXBkYXRlbGF5b3V0XCIgKSAvL01heWJlIHRoaXMgaXMgcmVxdWlyZWQsIHRvb1xuICB9XG4gIGhpZGVFeGl0KCk6dm9pZCB7XG4gICAgJChcIiNleGl0XCIpLmhpZGUoKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdWJzY3JpcHRpb25QYWdlVUkgZXh0ZW5kcyBQYWdlVUk8SVN1YnNjcmlwdGlvUGFnZUNvbnRyb2xsZXI+IGltcGxlbWVudHMgSVN1YnNjcmlwdGlvblBhZ2VVSXtcbiAgY29uc3RydWN0b3IocGFnZTogSFRNTEVsZW1lbnQsIGN0cmw6IElTdWJzY3JpcHRpb1BhZ2VDb250cm9sbGVyKSB7XG4gICAgc3VwZXIocGFnZSxjdHJsKVxuICAgICQocGFnZSkub24oXCJwYWdlYmVmb3Jlc2hvd1wiLCgpID0+IHsgLy9EZXByZWNhdGVkIGFzIG9mIDEuNC4wLCBIbW1tXG4gICAgICB0aGlzLmN0cmwub25QYWdlU2hvdygpXG4gICAgfSlcbiAgfVxuICBzaG93U3Vic2NyaXB0aW9uRGV0YWlscyhkZXRhaWxzOklTdWJzY3JpcHRpb25EZXRhaWxzKTp2b2lke1xuICAgIHNldEhUTUxFbGVtZW50VGV4dChcIiNudW1iZXJPZmxpY2Vuc2VzXCIsXCJcIiArIGRldGFpbHMubGljZW5zZXMpXG4gICAgc2V0SFRNTEVsZW1lbnRUZXh0KFwiI251bWJlck9mVXNlcnNcIixcIlwiICsgZGV0YWlscy51c2Vycz8ubGVuZ3RoKVxuICAgIHNldEhUTUxFbGVtZW50VGV4dChcIiNudW1iZXJPZlByb2ZpbGVzXCIsXCJcIiArIGRldGFpbHMucHJvZmlsZXM/Lmxlbmd0aClcbiAgfVxufVxuXG4iXX0=
