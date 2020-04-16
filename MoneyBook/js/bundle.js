(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const page_1 = require("./page");
const dbapi_1 = require("./dbapi");
;
let pageController = new page_1.PageController();
/*global indexedDB, openDatabase, pageController*/
var dataTypeList = ["id", "item", "price", "insertday"], pageList = ["page-result", "page-input"], popupStatus = "Deactive";
/**
 * Removes all child of the element.
 * @private
 * @param {Object} elm - The object to be emptied
 * @return {Object} The emptied element
 */
function emptyElement(elm) {
    if (elm)
        while (elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }
    return elm;
}
/**
 * Closes the popup div.
 * @private
 */
function closePopup() {
    const divPopup = document.querySelector("#popup");
    if (divPopup instanceof HTMLElement)
        divPopup.style.display = "none";
    popupStatus = "Deactive";
}
/**
 * Shows the popup div.
 * @private
 * @param {string} message - The message string to be shown in the popup
 * @param {string} type - The type of the popup(OK/OKCancel)
 * @param {Object} callbackList - The list of callback functions to be called
 *      when the button in the popup is clicked
 * @return {boolean} True if the popup is successfully showed.
 */
function showPopup(message, type, callbackList) {
    const divPopup = document.querySelector("#popup"), divDetail = document.querySelector("#detail-popup"), divFooter = document.querySelector("#footer-popup");
    // Terminate if parameters is not passed or the popup is already shown
    if (!message || !type || popupStatus === "Active") {
        return false;
    }
    if (!divFooter)
        throw new Error("#footer-popup not found");
    if (!divDetail)
        throw new Error("#detail-popup not found");
    if (!(divPopup && divPopup instanceof HTMLElement))
        throw new Error("#popup not found");
    switch (type) {
        case "OK": {
            // Empty the footer area
            emptyElement(divFooter);
            // Create new OK button
            const objButton = document.createElement("div");
            objButton.className = "btn-popup-ok";
            objButton.appendChild(document.createTextNode("OK"));
            // Set callback if the parameter was passed
            if (callbackList && callbackList.cbOK && typeof (callbackList.cbOK) === "function") {
                objButton.addEventListener("click", function () {
                    callbackList.cbOK();
                    closePopup();
                });
            }
            else {
                objButton.addEventListener("click", function () {
                    closePopup();
                });
            }
            // Put the button to the footer area
            divFooter.appendChild(objButton);
            // Set the message
            emptyElement(divDetail);
            divDetail.appendChild(document.createTextNode(message));
            divPopup.style.display = "block";
            popupStatus = "Active";
            break;
        }
        case "OKCancel":
            // Empty the footer area
            emptyElement(divFooter);
            // Create new OK button
            let objButton = document.createElement("div");
            objButton.className = "btn-popup-ok-half";
            objButton.appendChild(document.createTextNode("OK"));
            // Set callback if the parameter was passed
            if (callbackList && callbackList.cbOK && typeof (callbackList.cbOK) === "function") {
                objButton.addEventListener("click", function () {
                    callbackList.cbOK();
                    closePopup();
                });
            }
            else {
                objButton.addEventListener("click", function () {
                    closePopup();
                });
            }
            // Put the button to the footer area
            divFooter.appendChild(objButton);
            // Create new Cancel button
            objButton = document.createElement("div");
            objButton.className = "btn-popup-cancel-half";
            objButton.appendChild(document.createTextNode("Cancel"));
            // Set callback if the parameter was passed
            if (callbackList && callbackList.cbCancel && typeof (callbackList.cbCancel) === "function") {
                objButton.addEventListener("click", function () {
                    if (callbackList.cbCancel)
                        callbackList.cbCancel();
                    closePopup();
                });
            }
            else {
                objButton.addEventListener("click", function () {
                    closePopup();
                });
            }
            // Put the button to the footer area
            divFooter.appendChild(objButton);
            // Set the message
            emptyElement(divDetail);
            divDetail.appendChild(document.createTextNode(message));
            divPopup.style.display = "block";
            popupStatus = "Active";
            break;
        default:
            // Empty the footer area
            emptyElement(divFooter);
            // Create new Close button
            objButton = document.createElement("div");
            objButton.className = "btn-popup-ok";
            objButton.appendChild(document.createTextNode("Close"));
            divFooter.appendChild(objButton);
            // Set the message
            emptyElement(divDetail);
            divDetail.appendChild(document.createTextNode(message));
            divPopup.style.display = "block";
            popupStatus = "Active";
    }
    return true;
}
/**
 * Creates a callback function to delete a data from the table.
 * @private
 * @param {number} id - The id of the data to be deleted
 * @param {Object} objTable - A table element
 * @param {Object} objRow - A row element from the table
 * @return {function} The created callback function
 */
function createDeleteCallback(id, objTable, objRow) {
    var retFunc = function () {
        var data = {
            id: id,
            table: objTable,
            row: objRow
        };
        showPopup("Do you want to delete the Data " + id + "?", "OKCancel", {
            cbOK: function () {
                dbapi_1.deleteData(dbapi_1.db, data.id);
                data.table.removeChild(data.row);
            },
            cbCancel: null
        });
    };
    return retFunc;
}
/**
 * Shows the data in the array by table format.
 * @private
 * @param {array} dataArray - The array contains data to be shown
 */
//@ts-ignore
function showDataView(dataArray) {
    const objResult = document.querySelector("#detail-result");
    let objTable, objRow, objCol, prop;
    if (objResult)
        emptyElement(objResult);
    // Create new empty table
    objTable = document.createElement("div");
    objTable.className = "table-result";
    for (let i = 0; i < dataArray.length; i++) {
        // Create new empty table row
        objRow = document.createElement("div");
        objRow.className = "row-table-result";
        for (let j = 0; j < dataTypeList.length; j++) {
            prop = dataTypeList[j];
            // Put each data to the column in the table row
            if (dataArray[i].hasOwnProperty(prop)) {
                objCol = document.createElement("div");
                if (prop === "id") {
                    objCol.addEventListener("click", createDeleteCallback(dataArray[i][prop], objTable, objRow));
                }
                objCol.className = prop + "-detail";
                objCol.appendChild(document.createTextNode(dataArray[i][prop]));
                objRow.appendChild(objCol);
            }
        }
        // Put the table row to the table
        objTable.appendChild(objRow);
    }
    // Put the table to the result div
    if (objResult)
        objResult.appendChild(objTable);
}
/**
 * Loads the data from database and show the data with showDataView.
 * @private
 * @param {Object} db - The database object
 * @return {array} The array contains the result data
 */
function loadDataView(db) {
    //@ts-ignore
    let resultBuffer = [];
    if (dbapi_1.dbType === "IDB" && db instanceof IDBDatabase) {
        const idbObjectStore = db.transaction(dbapi_1.DB_TABLE_NAME, "readonly").objectStore(dbapi_1.DB_TABLE_NAME);
        //@ts-ignore
        idbObjectStore.openCursor().onsuccess = function (e) {
            //@ts-ignore
            const cursor = e.target.result;
            if (cursor) {
                resultBuffer.push(cursor.value);
                cursor.continue();
            }
            else {
                showDataView(resultBuffer);
                return resultBuffer;
            }
        };
    }
    else if (dbapi_1.dbType === "SQL" && !(db instanceof IDBDatabase)) {
        db.transaction(function (t) {
            t.executeSql("SELECT * FROM " + dbapi_1.DB_TABLE_NAME, [], 
            //@ts-ignore
            function (t, r) {
                var resultBuffer = [], i;
                for (i = 0; i < r.rows.length; i++) {
                    resultBuffer.push({
                        id: r.rows.item(i).id || 0,
                        item: r.rows.item(i).item || "",
                        price: r.rows.item(i).price || 0,
                        insertday: r.rows.item(i).insertday || ""
                    });
                }
                showDataView(resultBuffer);
                return resultBuffer;
            }, 
            //@ts-ignore
            function (t, e) {
                alert("Error dataview: " + e.message);
                return null;
            });
        });
    }
}
function getInputElement(id) {
    const el = document.getElementById(id);
    if (el && el instanceof HTMLInputElement)
        return el;
    else
        throw Error("HTMLInputElement not found with id " + id);
}
const inputItem = () => getInputElement("input-item");
const inputPrice = () => getInputElement("input-price");
/**
 * Submit a new record to the database.
 * @private
 * @return {boolean} True if the record is added into the database.
 */
function submitNewRecord() {
    let data = {
        item: "NoName",
        price: 0
    };
    let txtItem = inputItem();
    let txtPrice = inputPrice();
    if (!txtItem.value && !txtPrice.value) {
        showPopup("Item name and Price data are needed.", "OK");
        return false;
    }
    if (txtItem.value) {
        data.item = txtItem.value;
    }
    if (txtPrice.value) {
        data.price = Number(txtPrice.value);
    }
    data.insertday = dbapi_1.getDateTimeString();
    dbapi_1.insertData(dbapi_1.db, data);
    txtItem.value = "";
    txtPrice.value = "";
    txtItem.focus();
    return true;
}
/**
 * Handles the hardware key event.
 * @private
 * @param {Object} event - The hardware key event object
 */
//@ts-ignore
function keyEventCB(event) {
    if (event.keyName === "back") {
        if (popupStatus === "Active") {
            closePopup();
            //@ts-ignore
        }
        else if (pageController.isPageMain() === true) {
            try {
                //@ts-ignore
                tizen.application.getCurrentApplication().exit();
            }
            catch (ignore) { }
        }
        else {
            //@ts-ignore
            pageController.moveBackPage();
        }
    }
}
/**
 * Sets the default value to the variables and application environment.
 * @private
 */
function setDefaultVariables() {
    const divResult = document.querySelector("#detail-result");
    setTimeout(function () {
        //@ts-ignore
        if (document.height === 360) {
            //@ts-ignore
            divResult.style.height = (document.height - 80) + "px";
        }
        else {
            //@ts-ignore
            divResult.style.height = (document.height - 50) + "px";
        }
    }, 1000);
    for (let i = 0; i < pageList.length; i++) {
        pageController.addPage(pageList[i]);
    }
}
/**
 * Sets the default event handlers to the events.
 * @private
 */
function setDefaultEvents() {
    var btnSubmit = document.querySelector("#btn-submit"), btnClear = document.querySelector("#btn-clear"), btnInputPage = document.querySelector("#btn-input-page"), btnInputBack = document.querySelector("#btn-input-back");
    document.addEventListener("tizenhwkey", keyEventCB);
    if (!btnInputBack)
        throw new Error("No btn-input-back");
    btnInputBack.addEventListener("click", function () {
        loadDataView(dbapi_1.db);
        pageController.movePage("page-result");
    });
    if (!btnSubmit)
        throw new Error("No btn-submit");
    btnSubmit.addEventListener("click", function () {
        var txtItem = document.querySelector("#input-item"), txtPrice = document.querySelector("#input-price");
        if (!txtItem.value && !txtPrice.value) {
            showPopup("Item name and Price data are needed.", "OK");
        }
        else {
            showPopup("Do you want add new data?", "OKCancel", {
                cbOK: submitNewRecord,
                cbCancel: null
            });
        }
    });
    if (!btnInputPage)
        throw new Error("No #btn-input-page");
    btnInputPage.addEventListener("click", function () {
        pageController.movePage("page-input");
        inputItem().focus();
    });
    if (!btnClear)
        throw new Error("No #btn-clear");
    btnClear.addEventListener("click", function () {
        showPopup("Do you want to delete all data?", "OKCancel", {
            cbOK: function () {
                var objResult = document.querySelector("#detail-result");
                if (objResult)
                    emptyElement(objResult);
                dbapi_1.deleteDataAll(dbapi_1.db);
            },
            cbCancel: null
        });
    });
    inputItem().addEventListener("focusout", function () {
        if (!inputItem().value)
            inputPrice().focus();
    });
}
/**
 * Initializes the application.
 * @private
 */
function init() {
    dbapi_1.openDB(loadDataView);
    setDefaultVariables();
    setDefaultEvents();
}
window.onload = init;

},{"./dbapi":2,"./page":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbType = "none";
let idbObjectStore;
const DB_VERSION = 5;
const DB_NAME = "MoneyBook";
const DB_DISPLAY_NAME = "moneybook_db";
const DB_SIZE = 2 * 1024 * 1024;
exports.DB_TABLE_NAME = "tizenMoneybook";
/**
     * Creates the table if not exists.
     * @private
     * @param {Object} db - The database object(WebSQL or IndexedDB)
     */
function _createTable(db) {
    if (exports.dbType === "IDB" && db instanceof IDBDatabase) {
        if (db.objectStoreNames.contains(exports.DB_TABLE_NAME)) {
            db.deleteObjectStore(exports.DB_TABLE_NAME);
        }
        idbObjectStore = db.createObjectStore(exports.DB_TABLE_NAME, {
            keyPath: "id",
            autoIncrement: true
        });
    }
    else if (exports.dbType === "SQL" && !(db instanceof IDBDatabase)) {
        // You cannot write db instanceof IWebSQLDatabase, since it is just a type definition
        // while IDBDatabase is a real JavaScript class
        // Wow! TypeScrip can infer that if db is not IDBDatabase then it must be an IWebSQLDatabase
        db.transaction(function (t) {
            t.executeSql("CREATE TABLE IF NOT EXISTS " + exports.DB_TABLE_NAME + " (id INTEGER PRIMARY KEY, item TEXT, price INTEGER, insertday DATETIME)", []);
        });
    }
    else {
        alert("Error from createTable: no DBtype");
    }
}
/**
 * Inserts a data to the table.
 * @private
 * @param {Object} db - The database object(WebSQL or IndexedDB)
 * @param {Object} data - The data to be put
 */
function insertData(db, data) {
    if (exports.dbType === "IDB" && db instanceof IDBDatabase) {
        idbObjectStore = db.transaction(exports.DB_TABLE_NAME, "readwrite").objectStore(exports.DB_TABLE_NAME);
        idbObjectStore.put(data);
    }
    else if (exports.dbType === "SQL" && !(db instanceof IDBDatabase)) {
        db.transaction(function (t) {
            var dayString;
            dayString = getDateTimeString();
            t.executeSql("INSERT INTO " + exports.DB_TABLE_NAME + " (item, price, insertday) VALUES (?, ?, ?)", [data.item, data.price, dayString]);
        });
    }
}
exports.insertData = insertData;
/**
 * Deletes a data from the table.
 * @private
 * @param {Object} db - The database object(WebSQL or IndexedDB)
 * @param {Object} data - The data to be deleted
 */
function deleteData(db, id) {
    if (exports.dbType === "IDB" && db instanceof IDBDatabase) {
        idbObjectStore = db.transaction(exports.DB_TABLE_NAME, "readwrite").objectStore(exports.DB_TABLE_NAME);
        idbObjectStore.delete(id);
    }
    else if (exports.dbType === "SQL" && !(db instanceof IDBDatabase)) {
        db.transaction(function (t) {
            t.executeSql("DELETE FROM " + exports.DB_TABLE_NAME + " WHERE id = ?", [id]);
        });
    }
}
exports.deleteData = deleteData;
/**
 * Deletes all data from the table.
 * @private
 * @param {Object} db - The database object(WebSQL or IndexedDB)
 */
function deleteDataAll(db) {
    if (exports.dbType === "IDB" && db instanceof IDBDatabase) {
        idbObjectStore = db.transaction(exports.DB_TABLE_NAME, "readwrite").objectStore(exports.DB_TABLE_NAME);
        idbObjectStore.clear();
    }
    else if (exports.dbType === "SQL" && !(db instanceof IDBDatabase)) {
        db.transaction(function (t) {
            t.executeSql("DELETE FROM " + exports.DB_TABLE_NAME + " WHERE id > 0", []);
        });
    }
}
exports.deleteDataAll = deleteDataAll;
/**
 * Gets the string of current datetime by "MM/dd HH:mm" format.
 * @private
 * @return {string} The result string
 */
function getDateTimeString() {
    const day = new Date();
    return (addLeadingZero(day.getMonth() + 1, 2) + "/" + addLeadingZero(day.getDate(), 2) + " " +
        addLeadingZero(day.getHours(), 2) + ":" + addLeadingZero(day.getMinutes(), 2));
}
exports.getDateTimeString = getDateTimeString;
/**
 * Adds leading zero(s) to a number and make a string of fixed length.
 * @private
 * @param {number} number - A number to make a string.
 * @param {number} digit - The length of the result string.
 * @return {string} The result string
 */
function addLeadingZero(number, digit) {
    const n = number.toString();
    let strZero = "";
    for (let i = 0; i < digit - n.length; i++) {
        strZero += "0";
    }
    return strZero + n;
}
/**
 * Opens the database.
 * @private
 * @param {function} successCb - The callback function should be called after open database.
 */
//@ts-ignore
function openDB(successCb) {
    var request;
    if (window.indexedDB) {
        exports.dbType = "IDB";
        request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = function (e) {
            alert("Please allow this application to use Indexed DB:" + e);
        };
        request.onsuccess = function () {
            exports.db = request.result;
            if (successCb) {
                successCb(exports.db);
            }
        };
        // Set a callback function When the Indexed DB is created first,
        // or upgrade is needed
        request.onupgradeneeded = function (e) {
            //@ts-ignore
            exports.db = e.target.result;
            _createTable(exports.db);
        };
        //@ts-ignore WebSQL 
    }
    else if (window.openDatabase) {
        exports.dbType = "SQL";
        //@ts-ignore WebSQL
        wdb = openDatabase(DB_NAME, DB_VERSION, DB_DISPLAY_NAME, DB_SIZE);
        _createTable(exports.db);
        if (successCb) {
            successCb(exports.db);
        }
    }
    else {
        console.log("Indexed DB/WebSQL is not supported");
    }
}
exports.openDB = openDB;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PageController {
    constructor() {
        this.pageNow = "";
        this.pageNowIndex = -1;
        this.pageMain = "";
        this.pageMainIndex = -1;
        this.pageList = [];
        this.pageHistory = [];
        /**
         * Adds a new page to the page list.
         * @public
         * @param {string} page The name of a page to be added.
         * @param {number} index The index of a page to be added.
         * @return {boolean} true if the page is successfully added.
         */
        this.addPage = (page, index) => {
            const objPage = document.querySelector("#" + page);
            if (objPage) {
                if (index) {
                    this.pageList.splice(index, 0, page);
                }
                else {
                    this.pageList.push(page);
                    index = this.pageList.length;
                }
            }
            else {
                throw new Error("ERROR: Failed to addPage - The page doesn't exist");
            }
            if (this.pageList.length === 1) {
                this.movePage(page);
            }
            if (this.pageMain === "") {
                this.pageMain = page;
                this.pageMainIndex = index;
            }
            return true;
        };
        /**
         * Removes a page from the page list.
         * @public
         * @param {string} page The name of the a page to be removed.
         * @return {boolean} true if the page is successfully removed.
         */
        this.removePage = (page) => {
            const pageIndex = this.pageList.indexOf(page);
            if (pageIndex > -1) {
                if (pageIndex === this.pageMainIndex) {
                    this.pageMain = "";
                    this.pageMainIndex = -1;
                }
                this.pageList.splice(pageIndex, 1);
            }
            else {
                throw new Error("ERROR: Failed to removePage - The page doesn't exist in pageList");
            }
            return true;
        };
        /**
         * Moves to the selected page.
         * @public
         * @param {string} page The name of a page to be displayed.
         * @return {boolean} true if the page is successfully displayed.
         */
        this.movePage = (dest) => {
            const lastPage = this.pageNow;
            if (this.showPage(dest)) {
                this.pushHistory(lastPage);
                this.pageNow = dest;
                this.pageNowIndex = this.pageList.indexOf(this.pageNow);
            }
            else {
                return false;
            }
            return true;
        };
        /**
         * Moves back to the last page of the history list.
         * @public
         * @return {boolean} true if the page is successfully displayed.
         */
        this.moveBackPage = () => {
            const beforePage = this.popHistory();
            if (beforePage !== null) {
                this.showPage(beforePage);
                this.pageNow = beforePage;
                this.pageNowIndex = this.pageList.indexOf(this.pageNow);
            }
            else {
                throw new Error("ERROR: Failed to backPage - popHistory returned null");
            }
            return true;
        };
        /**
         * Moves to the previous page of the page list.
         * @public
         * @return {boolean} true if the page is successfully displayed.
         */
        this.movePrevPage = () => {
            if (this.pageNowIndex > 0) {
                this.movePage(this.pageList[this.pageNowIndex - 1]);
            }
            else {
                throw new Error("ERROR: Failed to movePrevPage - There is no previous page");
            }
            return true;
        };
        /**
         * Moves to the next page of the page list.
         * @public
         * @return {boolean} true if the page is successfully displayed.
         */
        this.moveNextPage = () => {
            if (this.pageNowIndex < this.pageList.length - 1) {
                this.movePage(this.pageList[this.pageNowIndex + 1]);
            }
            else {
                throw new Error("ERROR: Failed to moveNextPage - There is no next page");
            }
            return true;
        };
        /**
         * Gets the name of the current page.
         * @public
         * @return {string} The name of the current page.
         */
        this.getPageNow = () => {
            return this.pageNow;
        };
        /**
         * Returns the boolean value whether the current page is the main page or not.
         * @public
         * @return {boolean} true if the current page is the main page.
         */
        this.isPageMain = () => {
            return (this.pageNow === this.pageMain);
        };
        /**
         * Returns the boolean value whether the page is already added to the page list or not.
         * @public
         * @return {boolean} true if the page is already added.
         */
        this.isPageExist = (page) => {
            return (this.pageList.indexOf(page) > -1);
        };
        /**
         * Sets the background image of the page.
         * @param {string} page - Name of the page to be set the background image.
         * @param {string} imagePath - Path of the background image.
         * @public
         */
        this.setPageBgImage = (page, imagePath) => {
            if (this.isPageExist(page)) {
                const elmPage = document.querySelector("#" + page);
                if (elmPage instanceof HTMLElement) {
                    if (imagePath && typeof imagePath === "string") {
                        elmPage.style.backgroundImage = "url(" + imagePath + ")";
                    }
                    else {
                        elmPage.style.backgroundImage = "";
                    }
                }
            }
        };
    }
    /**
     * Pushes a page to the history list.
     * @private
     * @param {string} page Name of the page to be pushed.
     */
    pushHistory(page) {
        this.pageHistory.push(page);
    }
    /**
     * Pops a page from the history list.
     * @private
     * @return {string} name of the popped page.
     */
    popHistory() {
        if (this.pageHistory.length > 0) {
            const p = this.pageHistory.pop();
            if (p)
                return p;
        }
        throw new Error("Failed to popHistory - PageHistory is Empty");
    }
    /**
     * Shows selected page and hide all other pages.
     * @private
     * @param {string} page Name of the page to be displayed.
     * @return {boolean} true if the page is successfully displayed.
     */
    showPage(page) {
        const destPage = document.querySelector("#" + page);
        if (destPage !== null) {
            for (let i = 0; i < this.pageList.length; i++) {
                const objPage = document.querySelector("#" + this.pageList[i]);
                if (objPage instanceof HTMLElement)
                    objPage.style.display = "none";
            }
            if (destPage instanceof HTMLElement)
                destPage.style.display = "block";
            this.pageNow = page;
            return true;
        }
        else {
            throw new Error("ERROR: Page named " + page + " is not exist.");
        }
    }
}
exports.PageController = PageController;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvTW9uZXlCb29rL2pzL2FwcC50cyIsInNyYy9Nb25leUJvb2svanMvZGJhcGkudHMiLCJzcmMvTW9uZXlCb29rL2pzL3BhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLGlDQUFxQztBQUNyQyxtQ0FDaUU7QUFLaEUsQ0FBQztBQU1GLElBQUksY0FBYyxHQUFHLElBQUkscUJBQWMsRUFBRSxDQUFBO0FBRXpDLGtEQUFrRDtBQUNsRCxJQUNJLFlBQVksR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxFQUNuRCxRQUFRLEdBQUcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLEVBQ3hDLFdBQVcsR0FBRyxVQUFVLENBQUM7QUFHekI7Ozs7O0dBS0c7QUFDSCxTQUFTLFlBQVksQ0FBQyxHQUFXO0lBQzdCLElBQUcsR0FBRztRQUFFLE9BQU8sR0FBRyxDQUFDLFVBQVUsRUFBRTtZQUMzQixHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNuQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsVUFBVTtJQUNmLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEQsSUFBRyxRQUFRLFlBQVksV0FBVztRQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUNwRSxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzdCLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILFNBQVMsU0FBUyxDQUFDLE9BQWMsRUFBRSxJQUFXLEVBQUUsWUFBNEI7SUFDeEUsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFDN0MsU0FBUyxHQUFHLFFBQVEsQ0FB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QixHQUFHLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxDQUFBO1NBQ2xFO0lBQ0wsQ0FBQztDQXVKSjtBQXRNRCx3Q0FzTUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQge1BhZ2VDb250cm9sbGVyfSBmcm9tIFwiLi9wYWdlXCJcbmltcG9ydCB7ZGIsZGJUeXBlLERCX1RBQkxFX05BTUUsZGVsZXRlRGF0YSxJV2ViU1FMRGF0YWJhc2UsIElJdGVtUHJpY2UsXG5pbnNlcnREYXRhLGdldERhdGVUaW1lU3RyaW5nLG9wZW5EQixkZWxldGVEYXRhQWxsfSBmcm9tIFwiLi9kYmFwaVwiXG5pbnRlcmZhY2UgSURhdGFUb0RlbGV0ZSB7XG4gICAgaWQ6IG51bWJlcixcbiAgICB0YWJsZTogSFRNTERpdkVsZW1lbnQsXG4gICAgcm93OiBIVE1MRGl2RWxlbWVudCxcbn07XG5pbnRlcmZhY2UgSVBvcHVwQ2FsbGJhY2sge1xuICAgIGNiT0s6KCk9PnZvaWQsXG4gICAgY2JDYW5jZWw6KCgpPT52b2lkKSB8IG51bGwsXG59XG5cbmxldCBwYWdlQ29udHJvbGxlciA9IG5ldyBQYWdlQ29udHJvbGxlcigpXG5cbi8qZ2xvYmFsIGluZGV4ZWREQiwgb3BlbkRhdGFiYXNlLCBwYWdlQ29udHJvbGxlciovXG52YXIgXG4gICAgZGF0YVR5cGVMaXN0ID0gW1wiaWRcIiwgXCJpdGVtXCIsIFwicHJpY2VcIiwgXCJpbnNlcnRkYXlcIl0sXG4gICAgcGFnZUxpc3QgPSBbXCJwYWdlLXJlc3VsdFwiLCBcInBhZ2UtaW5wdXRcIl0sXG4gICAgcG9wdXBTdGF0dXMgPSBcIkRlYWN0aXZlXCI7XG5cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGNoaWxkIG9mIHRoZSBlbGVtZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsbSAtIFRoZSBvYmplY3QgdG8gYmUgZW1wdGllZFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGVtcHRpZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVtcHR5RWxlbWVudChlbG06RWxlbWVudCkge1xuICAgICAgICBpZihlbG0pIHdoaWxlIChlbG0uZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgZWxtLnJlbW92ZUNoaWxkKGVsbS5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxtO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlcyB0aGUgcG9wdXAgZGl2LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2xvc2VQb3B1cCgpIHtcbiAgICAgICAgY29uc3QgZGl2UG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BvcHVwXCIpO1xuICAgICAgICBpZihkaXZQb3B1cCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSBkaXZQb3B1cC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIHBvcHVwU3RhdHVzID0gXCJEZWFjdGl2ZVwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIHRoZSBwb3B1cCBkaXYuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHN0cmluZyB0byBiZSBzaG93biBpbiB0aGUgcG9wdXBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG9mIHRoZSBwb3B1cChPSy9PS0NhbmNlbClcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2FsbGJhY2tMaXN0IC0gVGhlIGxpc3Qgb2YgY2FsbGJhY2sgZnVuY3Rpb25zIHRvIGJlIGNhbGxlZFxuICAgICAqICAgICAgd2hlbiB0aGUgYnV0dG9uIGluIHRoZSBwb3B1cCBpcyBjbGlja2VkXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcG9wdXAgaXMgc3VjY2Vzc2Z1bGx5IHNob3dlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzaG93UG9wdXAobWVzc2FnZTpzdHJpbmcsIHR5cGU6c3RyaW5nLCBjYWxsYmFja0xpc3Q/OklQb3B1cENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IGRpdlBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwb3B1cFwiKSxcbiAgICAgICAgICAgIGRpdkRldGFpbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGV0YWlsLXBvcHVwXCIpLFxuICAgICAgICAgICAgZGl2Rm9vdGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmb290ZXItcG9wdXBcIilcbiAgICAgICAgLy8gVGVybWluYXRlIGlmIHBhcmFtZXRlcnMgaXMgbm90IHBhc3NlZCBvciB0aGUgcG9wdXAgaXMgYWxyZWFkeSBzaG93blxuICAgICAgICBpZiAoIW1lc3NhZ2UgfHwgIXR5cGUgfHwgcG9wdXBTdGF0dXMgPT09IFwiQWN0aXZlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZighZGl2Rm9vdGVyKSB0aHJvdyBuZXcgRXJyb3IoXCIjZm9vdGVyLXBvcHVwIG5vdCBmb3VuZFwiKVxuICAgICAgICBpZighZGl2RGV0YWlsKSB0aHJvdyBuZXcgRXJyb3IoXCIjZGV0YWlsLXBvcHVwIG5vdCBmb3VuZFwiKVxuICAgICAgICBpZighKGRpdlBvcHVwICYmIGRpdlBvcHVwIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB0aHJvdyBuZXcgRXJyb3IoXCIjcG9wdXAgbm90IGZvdW5kXCIpXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcIk9LXCI6IHtcbiAgICAgICAgICAgICAgICAvLyBFbXB0eSB0aGUgZm9vdGVyIGFyZWFcbiAgICAgICAgICAgICAgICBlbXB0eUVsZW1lbnQoZGl2Rm9vdGVyKTtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IE9LIGJ1dHRvblxuICAgICAgICAgICAgICAgIGNvbnN0IG9iakJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgb2JqQnV0dG9uLmNsYXNzTmFtZSA9IFwiYnRuLXBvcHVwLW9rXCI7XG4gICAgICAgICAgICAgICAgb2JqQnV0dG9uLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiT0tcIikpO1xuICAgICAgICAgICAgICAgIC8vIFNldCBjYWxsYmFjayBpZiB0aGUgcGFyYW1ldGVyIHdhcyBwYXNzZWRcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tMaXN0ICYmIGNhbGxiYWNrTGlzdC5jYk9LICYmIHR5cGVvZihjYWxsYmFja0xpc3QuY2JPSykgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBvYmpCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tMaXN0LmNiT0soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlUG9wdXAoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlUG9wdXAoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFB1dCB0aGUgYnV0dG9uIHRvIHRoZSBmb290ZXIgYXJlYVxuICAgICAgICAgICAgICAgIGRpdkZvb3Rlci5hcHBlbmRDaGlsZChvYmpCdXR0b24pO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHRoZSBtZXNzYWdlXG4gICAgICAgICAgICAgICAgZW1wdHlFbGVtZW50KGRpdkRldGFpbCk7XG4gICAgICAgICAgICAgICAgZGl2RGV0YWlsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKTtcblxuICAgICAgICAgICAgICAgIGRpdlBvcHVwLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgICAgICAgcG9wdXBTdGF0dXMgPSBcIkFjdGl2ZVwiO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiT0tDYW5jZWxcIjpcbiAgICAgICAgICAgICAgICAvLyBFbXB0eSB0aGUgZm9vdGVyIGFyZWFcbiAgICAgICAgICAgICAgICBlbXB0eUVsZW1lbnQoZGl2Rm9vdGVyKTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgT0sgYnV0dG9uXG4gICAgICAgICAgICAgICAgbGV0IG9iakJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgb2JqQnV0dG9uLmNsYXNzTmFtZSA9IFwiYnRuLXBvcHVwLW9rLWhhbGZcIjtcbiAgICAgICAgICAgICAgICBvYmpCdXR0b24uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJPS1wiKSk7XG4gICAgICAgICAgICAgICAgLy8gU2V0IGNhbGxiYWNrIGlmIHRoZSBwYXJhbWV0ZXIgd2FzIHBhc3NlZFxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja0xpc3QgJiYgY2FsbGJhY2tMaXN0LmNiT0sgJiYgdHlwZW9mKGNhbGxiYWNrTGlzdC5jYk9LKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iakJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0xpc3QuY2JPSygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQb3B1cCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYmpCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQb3B1cCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gUHV0IHRoZSBidXR0b24gdG8gdGhlIGZvb3RlciBhcmVhXG4gICAgICAgICAgICAgICAgZGl2Rm9vdGVyLmFwcGVuZENoaWxkKG9iakJ1dHRvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IENhbmNlbCBidXR0b25cbiAgICAgICAgICAgICAgICBvYmpCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIG9iakJ1dHRvbi5jbGFzc05hbWUgPSBcImJ0bi1wb3B1cC1jYW5jZWwtaGFsZlwiO1xuICAgICAgICAgICAgICAgIG9iakJ1dHRvbi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkNhbmNlbFwiKSk7XG4gICAgICAgICAgICAgICAgLy8gU2V0IGNhbGxiYWNrIGlmIHRoZSBwYXJhbWV0ZXIgd2FzIHBhc3NlZFxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja0xpc3QgJiYgY2FsbGJhY2tMaXN0LmNiQ2FuY2VsICYmIHR5cGVvZihjYWxsYmFja0xpc3QuY2JDYW5jZWwpID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNhbGxiYWNrTGlzdC5jYkNhbmNlbCkgY2FsbGJhY2tMaXN0LmNiQ2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBvcHVwKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9iakJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBvcHVwKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBQdXQgdGhlIGJ1dHRvbiB0byB0aGUgZm9vdGVyIGFyZWFcbiAgICAgICAgICAgICAgICBkaXZGb290ZXIuYXBwZW5kQ2hpbGQob2JqQnV0dG9uKTtcblxuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgICAgIGVtcHR5RWxlbWVudChkaXZEZXRhaWwpO1xuICAgICAgICAgICAgICAgIGRpdkRldGFpbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKSk7XG5cbiAgICAgICAgICAgICAgICBkaXZQb3B1cC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICAgICAgICAgIHBvcHVwU3RhdHVzID0gXCJBY3RpdmVcIjtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBFbXB0eSB0aGUgZm9vdGVyIGFyZWFcbiAgICAgICAgICAgICAgICBlbXB0eUVsZW1lbnQoZGl2Rm9vdGVyKTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgQ2xvc2UgYnV0dG9uXG4gICAgICAgICAgICAgICAgb2JqQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICBvYmpCdXR0b24uY2xhc3NOYW1lID0gXCJidG4tcG9wdXAtb2tcIjtcbiAgICAgICAgICAgICAgICBvYmpCdXR0b24uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJDbG9zZVwiKSk7XG4gICAgICAgICAgICAgICAgZGl2Rm9vdGVyLmFwcGVuZENoaWxkKG9iakJ1dHRvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICBlbXB0eUVsZW1lbnQoZGl2RGV0YWlsKTtcbiAgICAgICAgICAgICAgICBkaXZEZXRhaWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSkpO1xuXG4gICAgICAgICAgICAgICAgZGl2UG9wdXAuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICAgICAgICBwb3B1cFN0YXR1cyA9IFwiQWN0aXZlXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGRlbGV0ZSBhIGRhdGEgZnJvbSB0aGUgdGFibGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaWQgLSBUaGUgaWQgb2YgdGhlIGRhdGEgdG8gYmUgZGVsZXRlZFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpUYWJsZSAtIEEgdGFibGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpSb3cgLSBBIHJvdyBlbGVtZW50IGZyb20gdGhlIHRhYmxlXG4gICAgICogQHJldHVybiB7ZnVuY3Rpb259IFRoZSBjcmVhdGVkIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlRGVsZXRlQ2FsbGJhY2soaWQ6bnVtYmVyLCBvYmpUYWJsZTogSFRNTERpdkVsZW1lbnQsIG9ialJvdzogSFRNTERpdkVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHJldEZ1bmMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhOiBJRGF0YVRvRGVsZXRlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICB0YWJsZTogb2JqVGFibGUsXG4gICAgICAgICAgICAgICAgcm93OiBvYmpSb3dcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNob3dQb3B1cChcIkRvIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGUgRGF0YSBcIiArIGlkICsgXCI/XCIsIFwiT0tDYW5jZWxcIiwge1xuICAgICAgICAgICAgICAgIGNiT0s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGVEYXRhKGRiLCBkYXRhLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS50YWJsZS5yZW1vdmVDaGlsZChkYXRhLnJvdyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYkNhbmNlbDogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHJldEZ1bmM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvd3MgdGhlIGRhdGEgaW4gdGhlIGFycmF5IGJ5IHRhYmxlIGZvcm1hdC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGRhdGFBcnJheSAtIFRoZSBhcnJheSBjb250YWlucyBkYXRhIHRvIGJlIHNob3duXG4gICAgICovXG4gICAgLy9AdHMtaWdub3JlXG4gICAgZnVuY3Rpb24gc2hvd0RhdGFWaWV3KGRhdGFBcnJheTphbnlbXSkge1xuICAgICAgICBjb25zdCBvYmpSZXN1bHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RldGFpbC1yZXN1bHRcIilcbiAgICAgICAgbGV0ICAgIG9ialRhYmxlOkhUTUxEaXZFbGVtZW50LFxuICAgICAgICAgICAgb2JqUm93OkhUTUxEaXZFbGVtZW50LFxuICAgICAgICAgICAgb2JqQ29sOkhUTUxEaXZFbGVtZW50LFxuICAgICAgICAgICAgcHJvcDpzdHJpbmc7XG5cbiAgICAgICAgaWYob2JqUmVzdWx0KSBlbXB0eUVsZW1lbnQob2JqUmVzdWx0KTtcblxuICAgICAgICAvLyBDcmVhdGUgbmV3IGVtcHR5IHRhYmxlXG4gICAgICAgIG9ialRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgb2JqVGFibGUuY2xhc3NOYW1lID0gXCJ0YWJsZS1yZXN1bHRcIjtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGFBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIG5ldyBlbXB0eSB0YWJsZSByb3dcbiAgICAgICAgICAgIG9ialJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBvYmpSb3cuY2xhc3NOYW1lID0gXCJyb3ctdGFibGUtcmVzdWx0XCI7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRhdGFUeXBlTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHByb3AgPSBkYXRhVHlwZUxpc3Rbal07XG4gICAgICAgICAgICAgICAgLy8gUHV0IGVhY2ggZGF0YSB0byB0aGUgY29sdW1uIGluIHRoZSB0YWJsZSByb3dcbiAgICAgICAgICAgICAgICBpZiAoZGF0YUFycmF5W2ldLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iakNvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wID09PSBcImlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iakNvbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY3JlYXRlRGVsZXRlQ2FsbGJhY2soZGF0YUFycmF5W2ldW3Byb3BdLCBvYmpUYWJsZSwgb2JqUm93KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2JqQ29sLmNsYXNzTmFtZSA9IHByb3AgKyBcIi1kZXRhaWxcIjtcbiAgICAgICAgICAgICAgICAgICAgb2JqQ29sLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGFBcnJheVtpXVtwcm9wXSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIG9ialJvdy5hcHBlbmRDaGlsZChvYmpDb2wpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHV0IHRoZSB0YWJsZSByb3cgdG8gdGhlIHRhYmxlXG4gICAgICAgICAgICBvYmpUYWJsZS5hcHBlbmRDaGlsZChvYmpSb3cpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFB1dCB0aGUgdGFibGUgdG8gdGhlIHJlc3VsdCBkaXZcbiAgICAgICAgaWYob2JqUmVzdWx0KSBvYmpSZXN1bHQuYXBwZW5kQ2hpbGQob2JqVGFibGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIHRoZSBkYXRhIGZyb20gZGF0YWJhc2UgYW5kIHNob3cgdGhlIGRhdGEgd2l0aCBzaG93RGF0YVZpZXcuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGIgLSBUaGUgZGF0YWJhc2Ugb2JqZWN0XG4gICAgICogQHJldHVybiB7YXJyYXl9IFRoZSBhcnJheSBjb250YWlucyB0aGUgcmVzdWx0IGRhdGFcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsb2FkRGF0YVZpZXcoZGI6SURCRGF0YWJhc2UgfCBJV2ViU1FMRGF0YWJhc2UpIHtcbiAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgIGxldCByZXN1bHRCdWZmZXI6YW55W10gPSBbXTtcbiAgICAgICAgaWYgKGRiVHlwZSA9PT0gXCJJREJcIiAmJiBkYiBpbnN0YW5jZW9mIElEQkRhdGFiYXNlKSB7XG4gICAgICAgICAgICBjb25zdCBpZGJPYmplY3RTdG9yZSA9IGRiLnRyYW5zYWN0aW9uKERCX1RBQkxFX05BTUUsIFwicmVhZG9ubHlcIikub2JqZWN0U3RvcmUoREJfVEFCTEVfTkFNRSk7XG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlLm9wZW5DdXJzb3IoKS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgY29uc3QgY3Vyc29yID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICAgIGlmIChjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0QnVmZmVyLnB1c2goY3Vyc29yLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0RhdGFWaWV3KHJlc3VsdEJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRCdWZmZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChkYlR5cGUgPT09IFwiU1FMXCIgJiYgIShkYiBpbnN0YW5jZW9mIElEQkRhdGFiYXNlKSkge1xuICAgICAgICAgICAgZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbChcIlNFTEVDVCAqIEZST00gXCIgKyBEQl9UQUJMRV9OQU1FLCBbXSxcbiAgICAgICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHQsIHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRCdWZmZXIgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgci5yb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0QnVmZmVyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogci5yb3dzLml0ZW0oaSkuaWQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogci5yb3dzLml0ZW0oaSkuaXRlbSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmljZTogci5yb3dzLml0ZW0oaSkucHJpY2UgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0ZGF5OiByLnJvd3MuaXRlbShpKS5pbnNlcnRkYXkgfHwgXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93RGF0YVZpZXcocmVzdWx0QnVmZmVyKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEJ1ZmZlcjtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHQsIGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRXJyb3IgZGF0YXZpZXc6IFwiICsgZS5tZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJbnB1dEVsZW1lbnQoaWQ6c3RyaW5nKTpIVE1MSW5wdXRFbGVtZW50IHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcbiAgICAgICAgaWYoZWwgJiYgZWwgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSByZXR1cm4gZWxcbiAgICAgICAgZWxzZSB0aHJvdyBFcnJvcihcIkhUTUxJbnB1dEVsZW1lbnQgbm90IGZvdW5kIHdpdGggaWQgXCIgKyBpZClcbiAgICB9IFxuICAgIGNvbnN0IGlucHV0SXRlbSA9ICgpID0+IGdldElucHV0RWxlbWVudChcImlucHV0LWl0ZW1cIikgXG4gICAgY29uc3QgaW5wdXRQcmljZSA9ICgpID0+IGdldElucHV0RWxlbWVudChcImlucHV0LXByaWNlXCIpIFxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCBhIG5ldyByZWNvcmQgdG8gdGhlIGRhdGFiYXNlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcmVjb3JkIGlzIGFkZGVkIGludG8gdGhlIGRhdGFiYXNlLlxuICAgICAqL1xuZnVuY3Rpb24gc3VibWl0TmV3UmVjb3JkKCkge1xuICAgIGxldCBkYXRhOklJdGVtUHJpY2UgPSB7XG4gICAgICAgICAgICBpdGVtOiBcIk5vTmFtZVwiLFxuICAgICAgICAgICAgcHJpY2U6IDBcbiAgICAgICAgfVxuICAgIGxldCB0eHRJdGVtID0gaW5wdXRJdGVtKClcbiAgICBsZXQgdHh0UHJpY2UgPSBpbnB1dFByaWNlKClcbiAgICBpZiAoIXR4dEl0ZW0udmFsdWUgJiYgIXR4dFByaWNlLnZhbHVlKSB7XG4gICAgICAgIHNob3dQb3B1cChcIkl0ZW0gbmFtZSBhbmQgUHJpY2UgZGF0YSBhcmUgbmVlZGVkLlwiLCBcIk9LXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0eHRJdGVtLnZhbHVlKSB7XG4gICAgICAgIGRhdGEuaXRlbSA9IHR4dEl0ZW0udmFsdWU7XG4gICAgfVxuICAgIGlmICh0eHRQcmljZS52YWx1ZSkge1xuICAgICAgICBkYXRhLnByaWNlID0gTnVtYmVyKHR4dFByaWNlLnZhbHVlKVxuICAgIH1cbiAgICBkYXRhLmluc2VydGRheSA9IGdldERhdGVUaW1lU3RyaW5nKCk7XG4gICAgaW5zZXJ0RGF0YShkYiwgZGF0YSk7XG4gICAgdHh0SXRlbS52YWx1ZSA9IFwiXCI7XG4gICAgdHh0UHJpY2UudmFsdWUgPSBcIlwiO1xuICAgIHR4dEl0ZW0uZm9jdXMoKVxuICAgIHJldHVybiB0cnVlO1xufVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyB0aGUgaGFyZHdhcmUga2V5IGV2ZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gVGhlIGhhcmR3YXJlIGtleSBldmVudCBvYmplY3RcbiAgICAgKi9cbiAgICAvL0B0cy1pZ25vcmVcbiAgICBmdW5jdGlvbiBrZXlFdmVudENCKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5rZXlOYW1lID09PSBcImJhY2tcIikge1xuICAgICAgICAgICAgaWYgKHBvcHVwU3RhdHVzID09PSBcIkFjdGl2ZVwiKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VQb3B1cCgpO1xuICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhZ2VDb250cm9sbGVyLmlzUGFnZU1haW4oKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICB0aXplbi5hcHBsaWNhdGlvbi5nZXRDdXJyZW50QXBwbGljYXRpb24oKS5leGl0KCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICBwYWdlQ29udHJvbGxlci5tb3ZlQmFja1BhZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBkZWZhdWx0IHZhbHVlIHRvIHRoZSB2YXJpYWJsZXMgYW5kIGFwcGxpY2F0aW9uIGVudmlyb25tZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2V0RGVmYXVsdFZhcmlhYmxlcygpIHtcbiAgICAgICAgY29uc3QgZGl2UmVzdWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZXRhaWwtcmVzdWx0XCIpXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5oZWlnaHQgPT09IDM2MCkge1xuICAgICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIChkaXZSZXN1bHQgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmhlaWdodCA9IChkb2N1bWVudC5oZWlnaHQgLSA4MCkgKyBcInB4XCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIGRpdlJlc3VsdC5zdHlsZS5oZWlnaHQgPSAoZG9jdW1lbnQuaGVpZ2h0IC0gNTApICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhZ2VMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYWdlQ29udHJvbGxlci5hZGRQYWdlKHBhZ2VMaXN0W2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGRlZmF1bHQgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGV2ZW50cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNldERlZmF1bHRFdmVudHMoKSB7XG4gICAgICAgIHZhciBidG5TdWJtaXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2J0bi1zdWJtaXRcIiksXG4gICAgICAgICAgICBidG5DbGVhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYnRuLWNsZWFyXCIpLFxuICAgICAgICAgICAgYnRuSW5wdXRQYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNidG4taW5wdXQtcGFnZVwiKSxcbiAgICAgICAgICAgIGJ0bklucHV0QmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYnRuLWlucHV0LWJhY2tcIik7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRpemVuaHdrZXlcIiwga2V5RXZlbnRDQik7XG4gICAgICAgIGlmKCFidG5JbnB1dEJhY2spIHRocm93IG5ldyBFcnJvcihcIk5vIGJ0bi1pbnB1dC1iYWNrXCIpIFxuICAgICAgICBidG5JbnB1dEJhY2suYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9hZERhdGFWaWV3KGRiKTtcbiAgICAgICAgICAgIHBhZ2VDb250cm9sbGVyLm1vdmVQYWdlKFwicGFnZS1yZXN1bHRcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBpZighYnRuU3VibWl0KSB0aHJvdyBuZXcgRXJyb3IoXCJObyBidG4tc3VibWl0XCIpIFxuICAgICAgICBidG5TdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHR4dEl0ZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2lucHV0LWl0ZW1cIiksXG4gICAgICAgICAgICAgICAgdHh0UHJpY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2lucHV0LXByaWNlXCIpO1xuXG4gICAgICAgICAgICBpZiAoISh0eHRJdGVtIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlICYmICEodHh0UHJpY2UgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBzaG93UG9wdXAoXCJJdGVtIG5hbWUgYW5kIFByaWNlIGRhdGEgYXJlIG5lZWRlZC5cIiwgXCJPS1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd1BvcHVwKFwiRG8geW91IHdhbnQgYWRkIG5ldyBkYXRhP1wiLCBcIk9LQ2FuY2VsXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgY2JPSzogc3VibWl0TmV3UmVjb3JkLFxuICAgICAgICAgICAgICAgICAgICBjYkNhbmNlbDogbnVsbFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYoIWJ0bklucHV0UGFnZSkgdGhyb3cgbmV3IEVycm9yKFwiTm8gI2J0bi1pbnB1dC1wYWdlXCIpIFxuICAgICAgICBidG5JbnB1dFBhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcGFnZUNvbnRyb2xsZXIubW92ZVBhZ2UoXCJwYWdlLWlucHV0XCIpO1xuICAgICAgICAgICAgaW5wdXRJdGVtKCkuZm9jdXMoKVxuICAgICAgICB9KTtcbiAgICAgICAgaWYoIWJ0bkNsZWFyKSB0aHJvdyBuZXcgRXJyb3IoXCJObyAjYnRuLWNsZWFyXCIpIFxuICAgICAgICBidG5DbGVhci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzaG93UG9wdXAoXCJEbyB5b3Ugd2FudCB0byBkZWxldGUgYWxsIGRhdGE/XCIsIFwiT0tDYW5jZWxcIiwge1xuICAgICAgICAgICAgICAgIGNiT0s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqUmVzdWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZXRhaWwtcmVzdWx0XCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKG9ialJlc3VsdCkgZW1wdHlFbGVtZW50KG9ialJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZURhdGFBbGwoZGIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2JDYW5jZWw6IG51bGxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICBpbnB1dEl0ZW0oKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKCFpbnB1dEl0ZW0oKS52YWx1ZSkgaW5wdXRQcmljZSgpLmZvY3VzKClcbiAgICAgICAgfSlcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBhcHBsaWNhdGlvbi5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIG9wZW5EQihsb2FkRGF0YVZpZXcpO1xuICAgICAgICBzZXREZWZhdWx0VmFyaWFibGVzKCk7XG4gICAgICAgIHNldERlZmF1bHRFdmVudHMoKTtcbiAgICB9XG5cbiAgICB3aW5kb3cub25sb2FkID0gaW5pdDsiLCJleHBvcnQgdHlwZSBJV2ViU1FMRGF0YWJhc2UgPSBEYXRhYmFzZVxuZXhwb3J0IGludGVyZmFjZSBJSXRlbVByaWNlIHtcbiAgICBpdGVtOnN0cmluZyxcbiAgICBwcmljZTpudW1iZXIsXG4gICAgaW5zZXJ0ZGF5PzpzdHJpbmcsXG59XG5cbmV4cG9ydCBsZXQgZGI6SURCRGF0YWJhc2UgfCBJV2ViU1FMRGF0YWJhc2VcbmV4cG9ydCBsZXQgZGJUeXBlID0gXCJub25lXCJcbmxldCBpZGJPYmplY3RTdG9yZTogSURCT2JqZWN0U3RvcmVcbmNvbnN0IERCX1ZFUlNJT04gPSA1XG5jb25zdCBEQl9OQU1FID0gXCJNb25leUJvb2tcIlxuY29uc3QgREJfRElTUExBWV9OQU1FID0gXCJtb25leWJvb2tfZGJcIlxuY29uc3QgREJfU0laRSA9IDIgKiAxMDI0ICogMTAyNFxuZXhwb3J0IGNvbnN0ICBEQl9UQUJMRV9OQU1FID0gXCJ0aXplbk1vbmV5Ym9va1wiXG4vKipcbiAgICAgKiBDcmVhdGVzIHRoZSB0YWJsZSBpZiBub3QgZXhpc3RzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRiIC0gVGhlIGRhdGFiYXNlIG9iamVjdChXZWJTUUwgb3IgSW5kZXhlZERCKVxuICAgICAqL1xuZnVuY3Rpb24gX2NyZWF0ZVRhYmxlKGRiOklEQkRhdGFiYXNlIHwgSVdlYlNRTERhdGFiYXNlKSB7XG4gICAgICAgIGlmIChkYlR5cGUgPT09IFwiSURCXCIgJiYgZGIgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSkge1xuICAgICAgICAgICAgaWYgKGRiLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoREJfVEFCTEVfTkFNRSkpIHtcbiAgICAgICAgICAgICAgICBkYi5kZWxldGVPYmplY3RTdG9yZShEQl9UQUJMRV9OQU1FKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoREJfVEFCTEVfTkFNRSwge1xuICAgICAgICAgICAgICAgIGtleVBhdGg6IFwiaWRcIixcbiAgICAgICAgICAgICAgICBhdXRvSW5jcmVtZW50OiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChkYlR5cGUgPT09IFwiU1FMXCIgJiYgIShkYiBpbnN0YW5jZW9mIElEQkRhdGFiYXNlKSkge1xuICAgICAgICAgICAgLy8gWW91IGNhbm5vdCB3cml0ZSBkYiBpbnN0YW5jZW9mIElXZWJTUUxEYXRhYmFzZSwgc2luY2UgaXQgaXMganVzdCBhIHR5cGUgZGVmaW5pdGlvblxuICAgICAgICAgICAgLy8gd2hpbGUgSURCRGF0YWJhc2UgaXMgYSByZWFsIEphdmFTY3JpcHQgY2xhc3NcbiAgICAgICAgICAgIC8vIFdvdyEgVHlwZVNjcmlwIGNhbiBpbmZlciB0aGF0IGlmIGRiIGlzIG5vdCBJREJEYXRhYmFzZSB0aGVuIGl0IG11c3QgYmUgYW4gSVdlYlNRTERhdGFiYXNlXG4gICAgICAgICAgICBkYi50cmFuc2FjdGlvbihmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKFwiQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgXCIgKyBEQl9UQUJMRV9OQU1FICsgXCIgKGlkIElOVEVHRVIgUFJJTUFSWSBLRVksIGl0ZW0gVEVYVCwgcHJpY2UgSU5URUdFUiwgaW5zZXJ0ZGF5IERBVEVUSU1FKVwiLCBbXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiRXJyb3IgZnJvbSBjcmVhdGVUYWJsZTogbm8gREJ0eXBlXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBhIGRhdGEgdG8gdGhlIHRhYmxlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRiIC0gVGhlIGRhdGFiYXNlIG9iamVjdChXZWJTUUwgb3IgSW5kZXhlZERCKVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gVGhlIGRhdGEgdG8gYmUgcHV0XG4gICAgICovXG5leHBvcnQgICAgZnVuY3Rpb24gaW5zZXJ0RGF0YShkYjpJREJEYXRhYmFzZSB8IElXZWJTUUxEYXRhYmFzZSwgZGF0YTpJSXRlbVByaWNlKSB7XG4gICAgICAgIGlmIChkYlR5cGUgPT09IFwiSURCXCIgJiYgZGIgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSkge1xuICAgICAgICAgICAgaWRiT2JqZWN0U3RvcmUgPSBkYi50cmFuc2FjdGlvbihEQl9UQUJMRV9OQU1FLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShEQl9UQUJMRV9OQU1FKTtcbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlLnB1dChkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYlR5cGUgPT09IFwiU1FMXCIgJiYgIShkYiBpbnN0YW5jZW9mIElEQkRhdGFiYXNlKSkge1xuICAgICAgICAgICAgZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXlTdHJpbmc7XG4gICAgICAgICAgICAgICAgZGF5U3RyaW5nID0gZ2V0RGF0ZVRpbWVTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoXCJJTlNFUlQgSU5UTyBcIiArIERCX1RBQkxFX05BTUUgKyBcIiAoaXRlbSwgcHJpY2UsIGluc2VydGRheSkgVkFMVUVTICg/LCA/LCA/KVwiLCBbZGF0YS5pdGVtLCBkYXRhLnByaWNlLCBkYXlTdHJpbmddKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyBhIGRhdGEgZnJvbSB0aGUgdGFibGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGIgLSBUaGUgZGF0YWJhc2Ugb2JqZWN0KFdlYlNRTCBvciBJbmRleGVkREIpXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBUaGUgZGF0YSB0byBiZSBkZWxldGVkXG4gICAgICovXG5leHBvcnQgICAgZnVuY3Rpb24gZGVsZXRlRGF0YShkYjpJREJEYXRhYmFzZSB8IElXZWJTUUxEYXRhYmFzZSwgaWQ6bnVtYmVyKSB7XG4gICAgICAgIGlmIChkYlR5cGUgPT09IFwiSURCXCIgJiYgZGIgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSkge1xuICAgICAgICAgICAgaWRiT2JqZWN0U3RvcmUgPSBkYi50cmFuc2FjdGlvbihEQl9UQUJMRV9OQU1FLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShEQl9UQUJMRV9OQU1FKTtcbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlLmRlbGV0ZShpZCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGJUeXBlID09PSBcIlNRTFwiICYmICEoZGIgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSkpIHtcbiAgICAgICAgICAgIGRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoXCJERUxFVEUgRlJPTSBcIiArIERCX1RBQkxFX05BTUUgKyBcIiBXSEVSRSBpZCA9ID9cIiwgW2lkXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgYWxsIGRhdGEgZnJvbSB0aGUgdGFibGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGIgLSBUaGUgZGF0YWJhc2Ugb2JqZWN0KFdlYlNRTCBvciBJbmRleGVkREIpXG4gICAgICovXG5leHBvcnQgICAgZnVuY3Rpb24gZGVsZXRlRGF0YUFsbChkYjpJREJEYXRhYmFzZSB8IElXZWJTUUxEYXRhYmFzZSkge1xuICAgICAgICBpZiAoZGJUeXBlID09PSBcIklEQlwiICYmIGRiIGluc3RhbmNlb2YgSURCRGF0YWJhc2UpIHtcbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlID0gZGIudHJhbnNhY3Rpb24oREJfVEFCTEVfTkFNRSwgXCJyZWFkd3JpdGVcIikub2JqZWN0U3RvcmUoREJfVEFCTEVfTkFNRSk7XG4gICAgICAgICAgICBpZGJPYmplY3RTdG9yZS5jbGVhcigpO1xuICAgICAgICB9IGVsc2UgaWYgKGRiVHlwZSA9PT0gXCJTUUxcIiAmJiAhKGRiIGluc3RhbmNlb2YgSURCRGF0YWJhc2UpKSB7XG4gICAgICAgICAgICBkYi50cmFuc2FjdGlvbihmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKFwiREVMRVRFIEZST00gXCIgKyBEQl9UQUJMRV9OQU1FICsgXCIgV0hFUkUgaWQgPiAwXCIsIFtdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHN0cmluZyBvZiBjdXJyZW50IGRhdGV0aW1lIGJ5IFwiTU0vZGQgSEg6bW1cIiBmb3JtYXQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSByZXN1bHQgc3RyaW5nXG4gICAgICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGF0ZVRpbWVTdHJpbmcoKTpzdHJpbmcge1xuICAgICAgICBjb25zdCBkYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgICByZXR1cm4gKGFkZExlYWRpbmdaZXJvKGRheS5nZXRNb250aCgpICsgMSwgMikgKyBcIi9cIiArIGFkZExlYWRpbmdaZXJvKGRheS5nZXREYXRlKCksIDIpICsgXCIgXCIgK1xuICAgICAgICAgICAgYWRkTGVhZGluZ1plcm8oZGF5LmdldEhvdXJzKCksIDIpICsgXCI6XCIgKyBhZGRMZWFkaW5nWmVybyhkYXkuZ2V0TWludXRlcygpLCAyKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgbGVhZGluZyB6ZXJvKHMpIHRvIGEgbnVtYmVyIGFuZCBtYWtlIGEgc3RyaW5nIG9mIGZpeGVkIGxlbmd0aC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXIgLSBBIG51bWJlciB0byBtYWtlIGEgc3RyaW5nLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkaWdpdCAtIFRoZSBsZW5ndGggb2YgdGhlIHJlc3VsdCBzdHJpbmcuXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgcmVzdWx0IHN0cmluZ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFkZExlYWRpbmdaZXJvKG51bWJlcjpudW1iZXIsIGRpZ2l0Om51bWJlcik6c3RyaW5nIHtcbiAgICAgICAgY29uc3QgbiA9IG51bWJlci50b1N0cmluZygpXG4gICAgICAgIGxldCBzdHJaZXJvID0gXCJcIjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaWdpdCAtIG4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN0clplcm8gKz0gXCIwXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0clplcm8gKyBuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVucyB0aGUgZGF0YWJhc2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdWNjZXNzQ2IgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gc2hvdWxkIGJlIGNhbGxlZCBhZnRlciBvcGVuIGRhdGFiYXNlLlxuICAgICAqL1xuICAgIC8vQHRzLWlnbm9yZVxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5EQihzdWNjZXNzQ2IpIHtcbiAgICAgICAgdmFyIHJlcXVlc3Q6SURCT3BlbkRCUmVxdWVzdDtcblxuICAgICAgICBpZiAod2luZG93LmluZGV4ZWREQikge1xuICAgICAgICAgICAgZGJUeXBlID0gXCJJREJcIjtcblxuICAgICAgICAgICAgcmVxdWVzdCA9IGluZGV4ZWREQi5vcGVuKERCX05BTUUsIERCX1ZFUlNJT04pO1xuICAgICAgICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZTpFdmVudCkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiUGxlYXNlIGFsbG93IHRoaXMgYXBwbGljYXRpb24gdG8gdXNlIEluZGV4ZWQgREI6XCIgKyBlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGRiID0gcmVxdWVzdC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3NDYikge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2IoZGIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBTZXQgYSBjYWxsYmFjayBmdW5jdGlvbiBXaGVuIHRoZSBJbmRleGVkIERCIGlzIGNyZWF0ZWQgZmlyc3QsXG4gICAgICAgICAgICAvLyBvciB1cGdyYWRlIGlzIG5lZWRlZFxuICAgICAgICAgICAgcmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgZGIgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgX2NyZWF0ZVRhYmxlKGRiKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIC8vQHRzLWlnbm9yZSBXZWJTUUwgXG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93Lm9wZW5EYXRhYmFzZSkge1xuICAgICAgICAgICAgZGJUeXBlID0gXCJTUUxcIjtcbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZSBXZWJTUUxcbiAgICAgICAgICAgIHdkYiA9IG9wZW5EYXRhYmFzZShEQl9OQU1FLCBEQl9WRVJTSU9OLCBEQl9ESVNQTEFZX05BTUUsIERCX1NJWkUpO1xuICAgICAgICAgICAgX2NyZWF0ZVRhYmxlKGRiKTtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzQ2IpIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzQ2IoZGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJJbmRleGVkIERCL1dlYlNRTCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4iLCIvKmV4cG9ydGVkIHBhZ2VDb250cm9sbGVyKi9cbmV4cG9ydCB0eXBlIFBhZ2VUeXBlID0gc3RyaW5nXG5leHBvcnQgY2xhc3MgUGFnZUNvbnRyb2xsZXIge1xuICAgIHByaXZhdGUgcGFnZU5vdyA9IFwiXCJcbiAgICBwcml2YXRlIHBhZ2VOb3dJbmRleCA9IC0xXG4gICAgcHJpdmF0ZSBwYWdlTWFpbiA9IFwiXCJcbiAgICBwcml2YXRlIHBhZ2VNYWluSW5kZXggPSAtMVxuICAgIHByaXZhdGUgcGFnZUxpc3Q6c3RyaW5nW10gPSBbXVxuICAgIHByaXZhdGUgcGFnZUhpc3Rvcnk6UGFnZVR5cGVbXSA9IFtdXG5cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBwYWdlIHRvIHRoZSBoaXN0b3J5IGxpc3QuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZSBOYW1lIG9mIHRoZSBwYWdlIHRvIGJlIHB1c2hlZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHB1c2hIaXN0b3J5KHBhZ2U6UGFnZVR5cGUpOnZvaWQge1xuICAgICAgICB0aGlzLnBhZ2VIaXN0b3J5LnB1c2gocGFnZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBvcHMgYSBwYWdlIGZyb20gdGhlIGhpc3RvcnkgbGlzdC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gbmFtZSBvZiB0aGUgcG9wcGVkIHBhZ2UuXG4gICAgICovXG4gICAgcHJpdmF0ZSBwb3BIaXN0b3J5KCk6UGFnZVR5cGUge1xuICAgICAgICBpZiAodGhpcy5wYWdlSGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gdGhpcy5wYWdlSGlzdG9yeS5wb3AoKVxuICAgICAgICAgICAgaWYocCkgcmV0dXJuIHBcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gcG9wSGlzdG9yeSAtIFBhZ2VIaXN0b3J5IGlzIEVtcHR5XCIpXG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3dzIHNlbGVjdGVkIHBhZ2UgYW5kIGhpZGUgYWxsIG90aGVyIHBhZ2VzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhZ2UgTmFtZSBvZiB0aGUgcGFnZSB0byBiZSBkaXNwbGF5ZWQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcGFnZSBpcyBzdWNjZXNzZnVsbHkgZGlzcGxheWVkLlxuICAgICAqL1xuICAgIHByaXZhdGUgc2hvd1BhZ2UocGFnZTpQYWdlVHlwZSk6Ym9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGRlc3RQYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHBhZ2UpXG4gICAgICAgIGlmIChkZXN0UGFnZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhZ2VMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2JqUGFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0aGlzLnBhZ2VMaXN0W2ldKTtcbiAgICAgICAgICAgICAgICBpZihvYmpQYWdlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIG9ialBhZ2Uuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGVzdFBhZ2UgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgZGVzdFBhZ2Uuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICAgIHRoaXMucGFnZU5vdyA9IHBhZ2U7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVSUk9SOiBQYWdlIG5hbWVkIFwiICsgcGFnZSArIFwiIGlzIG5vdCBleGlzdC5cIilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBuZXcgcGFnZSB0byB0aGUgcGFnZSBsaXN0LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZSBUaGUgbmFtZSBvZiBhIHBhZ2UgdG8gYmUgYWRkZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSBpbmRleCBvZiBhIHBhZ2UgdG8gYmUgYWRkZWQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcGFnZSBpcyBzdWNjZXNzZnVsbHkgYWRkZWQuXG4gICAgICovXG4gICAgcHVibGljIGFkZFBhZ2UgPSAocGFnZTpQYWdlVHlwZSwgaW5kZXg/Om51bWJlcik6Ym9vbGVhbiA9PiB7XG4gICAgICAgIGNvbnN0IG9ialBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgcGFnZSk7XG4gICAgICAgIGlmIChvYmpQYWdlKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2VMaXN0LnNwbGljZShpbmRleCwgMCwgcGFnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZUxpc3QucHVzaChwYWdlKTtcbiAgICAgICAgICAgICAgICBpbmRleCA9IHRoaXMucGFnZUxpc3QubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRVJST1I6IEZhaWxlZCB0byBhZGRQYWdlIC0gVGhlIHBhZ2UgZG9lc24ndCBleGlzdFwiKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBhZ2VMaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlUGFnZShwYWdlKSA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucGFnZU1haW4gPT09IFwiXCIpIHtcbiAgICAgICAgICAgIHRoaXMucGFnZU1haW4gPSBwYWdlO1xuICAgICAgICAgICAgdGhpcy5wYWdlTWFpbkluZGV4ID0gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgcGFnZSBmcm9tIHRoZSBwYWdlIGxpc3QuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlIFRoZSBuYW1lIG9mIHRoZSBhIHBhZ2UgdG8gYmUgcmVtb3ZlZC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBwYWdlIGlzIHN1Y2Nlc3NmdWxseSByZW1vdmVkLlxuICAgICAqL1xuICAgIHB1YmxpYyByZW1vdmVQYWdlID0gKHBhZ2U6UGFnZVR5cGUpOmJvb2xlYW4gPT4ge1xuICAgICAgICBjb25zdCBwYWdlSW5kZXggPSB0aGlzLnBhZ2VMaXN0LmluZGV4T2YocGFnZSk7XG4gICAgICAgIGlmIChwYWdlSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgaWYgKHBhZ2VJbmRleCA9PT0gdGhpcy5wYWdlTWFpbkluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlTWFpbiA9IFwiXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlTWFpbkluZGV4ID0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnBhZ2VMaXN0LnNwbGljZShwYWdlSW5kZXgsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRVJST1I6IEZhaWxlZCB0byByZW1vdmVQYWdlIC0gVGhlIHBhZ2UgZG9lc24ndCBleGlzdCBpbiBwYWdlTGlzdFwiKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogTW92ZXMgdG8gdGhlIHNlbGVjdGVkIHBhZ2UuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlIFRoZSBuYW1lIG9mIGEgcGFnZSB0byBiZSBkaXNwbGF5ZWQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcGFnZSBpcyBzdWNjZXNzZnVsbHkgZGlzcGxheWVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBtb3ZlUGFnZSA9IChkZXN0OlBhZ2VUeXBlKSA9PiB7XG4gICAgICAgIGNvbnN0IGxhc3RQYWdlID0gdGhpcy5wYWdlTm93O1xuICAgICAgICBpZiAodGhpcy5zaG93UGFnZShkZXN0KSkge1xuICAgICAgICAgICAgdGhpcy5wdXNoSGlzdG9yeShsYXN0UGFnZSk7XG4gICAgICAgICAgICB0aGlzLnBhZ2VOb3cgPSBkZXN0O1xuICAgICAgICAgICAgdGhpcy5wYWdlTm93SW5kZXggPSB0aGlzLnBhZ2VMaXN0LmluZGV4T2YodGhpcy5wYWdlTm93KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTW92ZXMgYmFjayB0byB0aGUgbGFzdCBwYWdlIG9mIHRoZSBoaXN0b3J5IGxpc3QuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHBhZ2UgaXMgc3VjY2Vzc2Z1bGx5IGRpc3BsYXllZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZUJhY2tQYWdlID0gKCk6Ym9vbGVhbiA9PiB7XG4gICAgICAgIGNvbnN0IGJlZm9yZVBhZ2UgPSB0aGlzLnBvcEhpc3RvcnkoKTtcbiAgICAgICAgaWYgKGJlZm9yZVBhZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1BhZ2UoYmVmb3JlUGFnZSk7XG4gICAgICAgICAgICB0aGlzLnBhZ2VOb3cgPSBiZWZvcmVQYWdlO1xuICAgICAgICAgICAgdGhpcy5wYWdlTm93SW5kZXggPSB0aGlzLnBhZ2VMaXN0LmluZGV4T2YodGhpcy5wYWdlTm93KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVSUk9SOiBGYWlsZWQgdG8gYmFja1BhZ2UgLSBwb3BIaXN0b3J5IHJldHVybmVkIG51bGxcIilcblxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0byB0aGUgcHJldmlvdXMgcGFnZSBvZiB0aGUgcGFnZSBsaXN0LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBwYWdlIGlzIHN1Y2Nlc3NmdWxseSBkaXNwbGF5ZWQuXG4gICAgICovXG4gICAgcHVibGljIG1vdmVQcmV2UGFnZSA9ICgpOmJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAodGhpcy5wYWdlTm93SW5kZXggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVQYWdlKHRoaXMucGFnZUxpc3RbdGhpcy5wYWdlTm93SW5kZXggLSAxXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFUlJPUjogRmFpbGVkIHRvIG1vdmVQcmV2UGFnZSAtIFRoZXJlIGlzIG5vIHByZXZpb3VzIHBhZ2VcIilcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIE1vdmVzIHRvIHRoZSBuZXh0IHBhZ2Ugb2YgdGhlIHBhZ2UgbGlzdC5cbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcGFnZSBpcyBzdWNjZXNzZnVsbHkgZGlzcGxheWVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBtb3ZlTmV4dFBhZ2UgPSAoKTpib29sZWFuID0+IHtcbiAgICAgICAgaWYgKHRoaXMucGFnZU5vd0luZGV4IDwgdGhpcy5wYWdlTGlzdC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICB0aGlzLm1vdmVQYWdlKHRoaXMucGFnZUxpc3RbdGhpcy5wYWdlTm93SW5kZXggKyAxXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFUlJPUjogRmFpbGVkIHRvIG1vdmVOZXh0UGFnZSAtIFRoZXJlIGlzIG5vIG5leHQgcGFnZVwiKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IHBhZ2UuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgcGFnZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGFnZU5vdyA9ICgpOlBhZ2VUeXBlID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFnZU5vdztcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYm9vbGVhbiB2YWx1ZSB3aGV0aGVyIHRoZSBjdXJyZW50IHBhZ2UgaXMgdGhlIG1haW4gcGFnZSBvciBub3QuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGN1cnJlbnQgcGFnZSBpcyB0aGUgbWFpbiBwYWdlLlxuICAgICAqL1xuICAgIHB1YmxpYyBpc1BhZ2VNYWluID0gKCk6Ym9vbGVhbiA9PiB7XG4gICAgICAgIHJldHVybiAodGhpcy5wYWdlTm93ID09PSB0aGlzLnBhZ2VNYWluKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYm9vbGVhbiB2YWx1ZSB3aGV0aGVyIHRoZSBwYWdlIGlzIGFscmVhZHkgYWRkZWQgdG8gdGhlIHBhZ2UgbGlzdCBvciBub3QuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHBhZ2UgaXMgYWxyZWFkeSBhZGRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNQYWdlRXhpc3QgPSAocGFnZTpQYWdlVHlwZSk6Ym9vbGVhbiA9PiB7XG4gICAgICAgIHJldHVybiAodGhpcy5wYWdlTGlzdC5pbmRleE9mKHBhZ2UpID4gLTEpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYmFja2dyb3VuZCBpbWFnZSBvZiB0aGUgcGFnZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZSAtIE5hbWUgb2YgdGhlIHBhZ2UgdG8gYmUgc2V0IHRoZSBiYWNrZ3JvdW5kIGltYWdlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZVBhdGggLSBQYXRoIG9mIHRoZSBiYWNrZ3JvdW5kIGltYWdlLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UGFnZUJnSW1hZ2UgPSAocGFnZTpQYWdlVHlwZSwgaW1hZ2VQYXRoOnN0cmluZykgPT4ge1xuICAgICAgICBpZiAodGhpcy5pc1BhZ2VFeGlzdChwYWdlKSkge1xuICAgICAgICAgICAgY29uc3QgZWxtUGFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBwYWdlKTtcbiAgICAgICAgICAgIGlmKGVsbVBhZ2UgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChpbWFnZVBhdGggJiYgdHlwZW9mIGltYWdlUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICBlbG1QYWdlLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgaW1hZ2VQYXRoICsgXCIpXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxtUGFnZS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
