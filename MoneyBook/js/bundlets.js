System.register("js/page", [], function (exports_1, context_1) {
    "use strict";
    var PageController;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            PageController = class PageController {
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
            };
            exports_1("PageController", PageController);
        }
    };
});
System.register("js/dbapi", [], function (exports_2, context_2) {
    "use strict";
    var db, dbType, idbObjectStore, DB_VERSION, DB_NAME, DB_DISPLAY_NAME, DB_SIZE, DB_TABLE_NAME;
    var __moduleName = context_2 && context_2.id;
    /**
         * Creates the table if not exists.
         * @private
         * @param {Object} db - The database object(WebSQL or IndexedDB)
         */
    function _createTable(db) {
        if (dbType === "IDB" && db instanceof IDBDatabase) {
            if (db.objectStoreNames.contains(DB_TABLE_NAME)) {
                db.deleteObjectStore(DB_TABLE_NAME);
            }
            idbObjectStore = db.createObjectStore(DB_TABLE_NAME, {
                keyPath: "id",
                autoIncrement: true
            });
        }
        else if (dbType === "SQL" && !(db instanceof IDBDatabase)) {
            // You cannot write db instanceof IWebSQLDatabase, since it is just a type definition
            // while IDBDatabase is a real JavaScript class
            // Wow! TypeScrip can infer that if db is not IDBDatabase then it must be an IWebSQLDatabase
            db.transaction(function (t) {
                t.executeSql("CREATE TABLE IF NOT EXISTS " + DB_TABLE_NAME + " (id INTEGER PRIMARY KEY, item TEXT, price INTEGER, insertday DATETIME)", []);
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
        if (dbType === "IDB" && db instanceof IDBDatabase) {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readwrite").objectStore(DB_TABLE_NAME);
            idbObjectStore.put(data);
        }
        else if (dbType === "SQL" && !(db instanceof IDBDatabase)) {
            db.transaction(function (t) {
                var dayString;
                dayString = getDateTimeString();
                t.executeSql("INSERT INTO " + DB_TABLE_NAME + " (item, price, insertday) VALUES (?, ?, ?)", [data.item, data.price, dayString]);
            });
        }
    }
    exports_2("insertData", insertData);
    /**
     * Deletes a data from the table.
     * @private
     * @param {Object} db - The database object(WebSQL or IndexedDB)
     * @param {Object} data - The data to be deleted
     */
    function deleteData(db, id) {
        if (dbType === "IDB" && db instanceof IDBDatabase) {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readwrite").objectStore(DB_TABLE_NAME);
            idbObjectStore.delete(id);
        }
        else if (dbType === "SQL" && !(db instanceof IDBDatabase)) {
            db.transaction(function (t) {
                t.executeSql("DELETE FROM " + DB_TABLE_NAME + " WHERE id = ?", [id]);
            });
        }
    }
    exports_2("deleteData", deleteData);
    /**
     * Deletes all data from the table.
     * @private
     * @param {Object} db - The database object(WebSQL or IndexedDB)
     */
    function deleteDataAll(db) {
        if (dbType === "IDB" && db instanceof IDBDatabase) {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readwrite").objectStore(DB_TABLE_NAME);
            idbObjectStore.clear();
        }
        else if (dbType === "SQL" && !(db instanceof IDBDatabase)) {
            db.transaction(function (t) {
                t.executeSql("DELETE FROM " + DB_TABLE_NAME + " WHERE id > 0", []);
            });
        }
    }
    exports_2("deleteDataAll", deleteDataAll);
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
    exports_2("getDateTimeString", getDateTimeString);
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
            exports_2("dbType", dbType = "IDB");
            request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = function (e) {
                alert("Please allow this application to use Indexed DB:" + e);
            };
            request.onsuccess = function () {
                exports_2("db", db = request.result);
                if (successCb) {
                    successCb(db);
                }
            };
            // Set a callback function When the Indexed DB is created first,
            // or upgrade is needed
            request.onupgradeneeded = function (e) {
                //@ts-ignore
                exports_2("db", db = e.target.result);
                _createTable(db);
            };
            //@ts-ignore WebSQL 
        }
        else if (window.openDatabase) {
            exports_2("dbType", dbType = "SQL");
            //@ts-ignore WebSQL
            wdb = openDatabase(DB_NAME, DB_VERSION, DB_DISPLAY_NAME, DB_SIZE);
            _createTable(db);
            if (successCb) {
                successCb(db);
            }
        }
        else {
            console.log("Indexed DB/WebSQL is not supported");
        }
    }
    exports_2("openDB", openDB);
    return {
        setters: [],
        execute: function () {
            exports_2("dbType", dbType = "none");
            DB_VERSION = 5;
            DB_NAME = "MoneyBook";
            DB_DISPLAY_NAME = "moneybook_db";
            DB_SIZE = 2 * 1024 * 1024;
            exports_2("DB_TABLE_NAME", DB_TABLE_NAME = "tizenMoneybook");
        }
    };
});
System.register("js/app", ["js/page", "js/dbapi"], function (exports_3, context_3) {
    "use strict";
    var page_1, dbapi_1, pageController, dataTypeList, pageList, popupStatus, inputItem, inputPrice;
    var __moduleName = context_3 && context_3.id;
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
    return {
        setters: [
            function (page_1_1) {
                page_1 = page_1_1;
            },
            function (dbapi_1_1) {
                dbapi_1 = dbapi_1_1;
            }
        ],
        execute: function () {
            ;
            pageController = new page_1.PageController();
            /*global indexedDB, openDatabase, pageController*/
            dataTypeList = ["id", "item", "price", "insertday"], pageList = ["page-result", "page-input"], popupStatus = "Deactive";
            inputItem = () => getInputElement("input-item");
            inputPrice = () => getInputElement("input-price");
            window.onload = init;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxldHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvTW9uZXlCb29rL2pzL3BhZ2UudHMiLCIuLi8uLi9zcmMvTW9uZXlCb29rL2pzL2RiYXBpLnRzIiwiLi4vLi4vc3JjL01vbmV5Qm9vay9qcy9hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztZQUVBLGlCQUFBLE1BQWEsY0FBYztnQkFBM0I7b0JBQ1ksWUFBTyxHQUFHLEVBQUUsQ0FBQTtvQkFDWixpQkFBWSxHQUFHLENBQUMsQ0FBQyxDQUFBO29CQUNqQixhQUFRLEdBQUcsRUFBRSxDQUFBO29CQUNiLGtCQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUE7b0JBQ2xCLGFBQVEsR0FBWSxFQUFFLENBQUE7b0JBQ3RCLGdCQUFXLEdBQWMsRUFBRSxDQUFBO29CQTJDbkM7Ozs7Ozt1QkFNRztvQkFDSSxZQUFPLEdBQUcsQ0FBQyxJQUFhLEVBQUUsS0FBYSxFQUFVLEVBQUU7d0JBQ3RELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO3dCQUNuRCxJQUFJLE9BQU8sRUFBRTs0QkFDVCxJQUFJLEtBQUssRUFBRTtnQ0FDUCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDOzZCQUN4QztpQ0FBTTtnQ0FDSCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDekIsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDOzZCQUNoQzt5QkFDSjs2QkFBTTs0QkFDSCxNQUFNLElBQUksS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUE7eUJBQ3ZFO3dCQUNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUks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UUFBUSxHQUFHLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxFQUN4QyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBcVJuQixTQUFTLEdBQUcsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQy9DLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUE7WUEwSXZELE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypleHBvcnRlZCBwYWdlQ29udHJvbGxlciovXG5leHBvcnQgdHlwZSBQYWdlVHlwZSA9IHN0cmluZ1xuZXhwb3J0IGNsYXNzIFBhZ2VDb250cm9sbGVyIHtcbiAgICBwcml2YXRlIHBhZ2VOb3cgPSBcIlwiXG4gICAgcHJpdmF0ZSBwYWdlTm93SW5kZXggPSAtMVxuICAgIHByaXZhdGUgcGFnZU1haW4gPSBcIlwiXG4gICAgcHJpdmF0ZSBwYWdlTWFpbkluZGV4ID0gLTFcbiAgICBwcml2YXRlIHBhZ2VMaXN0OnN0cmluZ1tdID0gW11cbiAgICBwcml2YXRlIHBhZ2VIaXN0b3J5OlBhZ2VUeXBlW10gPSBbXVxuXG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgcGFnZSB0byB0aGUgaGlzdG9yeSBsaXN0LlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhZ2UgTmFtZSBvZiB0aGUgcGFnZSB0byBiZSBwdXNoZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBwdXNoSGlzdG9yeShwYWdlOlBhZ2VUeXBlKTp2b2lkIHtcbiAgICAgICAgdGhpcy5wYWdlSGlzdG9yeS5wdXNoKHBhZ2UpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQb3BzIGEgcGFnZSBmcm9tIHRoZSBoaXN0b3J5IGxpc3QuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IG5hbWUgb2YgdGhlIHBvcHBlZCBwYWdlLlxuICAgICAqL1xuICAgIHByaXZhdGUgcG9wSGlzdG9yeSgpOlBhZ2VUeXBlIHtcbiAgICAgICAgaWYgKHRoaXMucGFnZUhpc3RvcnkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgcCA9IHRoaXMucGFnZUhpc3RvcnkucG9wKClcbiAgICAgICAgICAgIGlmKHApIHJldHVybiBwXG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIHBvcEhpc3RvcnkgLSBQYWdlSGlzdG9yeSBpcyBFbXB0eVwiKVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93cyBzZWxlY3RlZCBwYWdlIGFuZCBoaWRlIGFsbCBvdGhlciBwYWdlcy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYWdlIE5hbWUgb2YgdGhlIHBhZ2UgdG8gYmUgZGlzcGxheWVkLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHBhZ2UgaXMgc3VjY2Vzc2Z1bGx5IGRpc3BsYXllZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHNob3dQYWdlKHBhZ2U6UGFnZVR5cGUpOmJvb2xlYW4ge1xuICAgICAgICBjb25zdCBkZXN0UGFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBwYWdlKVxuICAgICAgICBpZiAoZGVzdFBhZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYWdlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9ialBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGhpcy5wYWdlTGlzdFtpXSk7XG4gICAgICAgICAgICAgICAgaWYob2JqUGFnZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSBvYmpQYWdlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRlc3RQYWdlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIGRlc3RQYWdlLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgICB0aGlzLnBhZ2VOb3cgPSBwYWdlO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFUlJPUjogUGFnZSBuYW1lZCBcIiArIHBhZ2UgKyBcIiBpcyBub3QgZXhpc3QuXCIpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbmV3IHBhZ2UgdG8gdGhlIHBhZ2UgbGlzdC5cbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhZ2UgVGhlIG5hbWUgb2YgYSBwYWdlIHRvIGJlIGFkZGVkLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgaW5kZXggb2YgYSBwYWdlIHRvIGJlIGFkZGVkLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHBhZ2UgaXMgc3VjY2Vzc2Z1bGx5IGFkZGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBhZGRQYWdlID0gKHBhZ2U6UGFnZVR5cGUsIGluZGV4PzpudW1iZXIpOmJvb2xlYW4gPT4ge1xuICAgICAgICBjb25zdCBvYmpQYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHBhZ2UpO1xuICAgICAgICBpZiAob2JqUGFnZSkge1xuICAgICAgICAgICAgaWYgKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlTGlzdC5zcGxpY2UoaW5kZXgsIDAsIHBhZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2VMaXN0LnB1c2gocGFnZSk7XG4gICAgICAgICAgICAgICAgaW5kZXggPSB0aGlzLnBhZ2VMaXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVSUk9SOiBGYWlsZWQgdG8gYWRkUGFnZSAtIFRoZSBwYWdlIGRvZXNuJ3QgZXhpc3RcIilcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wYWdlTGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZVBhZ2UocGFnZSkgO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBhZ2VNYWluID09PSBcIlwiKSB7XG4gICAgICAgICAgICB0aGlzLnBhZ2VNYWluID0gcGFnZTtcbiAgICAgICAgICAgIHRoaXMucGFnZU1haW5JbmRleCA9IGluZGV4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHBhZ2UgZnJvbSB0aGUgcGFnZSBsaXN0LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZSBUaGUgbmFtZSBvZiB0aGUgYSBwYWdlIHRvIGJlIHJlbW92ZWQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcGFnZSBpcyBzdWNjZXNzZnVsbHkgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlUGFnZSA9IChwYWdlOlBhZ2VUeXBlKTpib29sZWFuID0+IHtcbiAgICAgICAgY29uc3QgcGFnZUluZGV4ID0gdGhpcy5wYWdlTGlzdC5pbmRleE9mKHBhZ2UpO1xuICAgICAgICBpZiAocGFnZUluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIGlmIChwYWdlSW5kZXggPT09IHRoaXMucGFnZU1haW5JbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZU1haW4gPSBcIlwiO1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZU1haW5JbmRleCA9IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wYWdlTGlzdC5zcGxpY2UocGFnZUluZGV4LCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVSUk9SOiBGYWlsZWQgdG8gcmVtb3ZlUGFnZSAtIFRoZSBwYWdlIGRvZXNuJ3QgZXhpc3QgaW4gcGFnZUxpc3RcIilcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIE1vdmVzIHRvIHRoZSBzZWxlY3RlZCBwYWdlLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGFnZSBUaGUgbmFtZSBvZiBhIHBhZ2UgdG8gYmUgZGlzcGxheWVkLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHBhZ2UgaXMgc3VjY2Vzc2Z1bGx5IGRpc3BsYXllZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZVBhZ2UgPSAoZGVzdDpQYWdlVHlwZSkgPT4ge1xuICAgICAgICBjb25zdCBsYXN0UGFnZSA9IHRoaXMucGFnZU5vdztcbiAgICAgICAgaWYgKHRoaXMuc2hvd1BhZ2UoZGVzdCkpIHtcbiAgICAgICAgICAgIHRoaXMucHVzaEhpc3RvcnkobGFzdFBhZ2UpO1xuICAgICAgICAgICAgdGhpcy5wYWdlTm93ID0gZGVzdDtcbiAgICAgICAgICAgIHRoaXMucGFnZU5vd0luZGV4ID0gdGhpcy5wYWdlTGlzdC5pbmRleE9mKHRoaXMucGFnZU5vdyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmVzIGJhY2sgdG8gdGhlIGxhc3QgcGFnZSBvZiB0aGUgaGlzdG9yeSBsaXN0LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBwYWdlIGlzIHN1Y2Nlc3NmdWxseSBkaXNwbGF5ZWQuXG4gICAgICovXG4gICAgcHVibGljIG1vdmVCYWNrUGFnZSA9ICgpOmJvb2xlYW4gPT4ge1xuICAgICAgICBjb25zdCBiZWZvcmVQYWdlID0gdGhpcy5wb3BIaXN0b3J5KCk7XG4gICAgICAgIGlmIChiZWZvcmVQYWdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dQYWdlKGJlZm9yZVBhZ2UpO1xuICAgICAgICAgICAgdGhpcy5wYWdlTm93ID0gYmVmb3JlUGFnZTtcbiAgICAgICAgICAgIHRoaXMucGFnZU5vd0luZGV4ID0gdGhpcy5wYWdlTGlzdC5pbmRleE9mKHRoaXMucGFnZU5vdyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFUlJPUjogRmFpbGVkIHRvIGJhY2tQYWdlIC0gcG9wSGlzdG9yeSByZXR1cm5lZCBudWxsXCIpXG5cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTW92ZXMgdG8gdGhlIHByZXZpb3VzIHBhZ2Ugb2YgdGhlIHBhZ2UgbGlzdC5cbiAgICAgKiBAcHVibGljXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcGFnZSBpcyBzdWNjZXNzZnVsbHkgZGlzcGxheWVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBtb3ZlUHJldlBhZ2UgPSAoKTpib29sZWFuID0+IHtcbiAgICAgICAgaWYgKHRoaXMucGFnZU5vd0luZGV4ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlUGFnZSh0aGlzLnBhZ2VMaXN0W3RoaXMucGFnZU5vd0luZGV4IC0gMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRVJST1I6IEZhaWxlZCB0byBtb3ZlUHJldlBhZ2UgLSBUaGVyZSBpcyBubyBwcmV2aW91cyBwYWdlXCIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0byB0aGUgbmV4dCBwYWdlIG9mIHRoZSBwYWdlIGxpc3QuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIHBhZ2UgaXMgc3VjY2Vzc2Z1bGx5IGRpc3BsYXllZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZU5leHRQYWdlID0gKCk6Ym9vbGVhbiA9PiB7XG4gICAgICAgIGlmICh0aGlzLnBhZ2VOb3dJbmRleCA8IHRoaXMucGFnZUxpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlUGFnZSh0aGlzLnBhZ2VMaXN0W3RoaXMucGFnZU5vd0luZGV4ICsgMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRVJST1I6IEZhaWxlZCB0byBtb3ZlTmV4dFBhZ2UgLSBUaGVyZSBpcyBubyBuZXh0IHBhZ2VcIilcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbmFtZSBvZiB0aGUgY3VycmVudCBwYWdlLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IHBhZ2UuXG4gICAgICovXG4gICAgcHVibGljIGdldFBhZ2VOb3cgPSAoKTpQYWdlVHlwZSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhZ2VOb3c7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJvb2xlYW4gdmFsdWUgd2hldGhlciB0aGUgY3VycmVudCBwYWdlIGlzIHRoZSBtYWluIHBhZ2Ugb3Igbm90LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBjdXJyZW50IHBhZ2UgaXMgdGhlIG1haW4gcGFnZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNQYWdlTWFpbiA9ICgpOmJvb2xlYW4gPT4ge1xuICAgICAgICByZXR1cm4gKHRoaXMucGFnZU5vdyA9PT0gdGhpcy5wYWdlTWFpbik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJvb2xlYW4gdmFsdWUgd2hldGhlciB0aGUgcGFnZSBpcyBhbHJlYWR5IGFkZGVkIHRvIHRoZSBwYWdlIGxpc3Qgb3Igbm90LlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBwYWdlIGlzIGFscmVhZHkgYWRkZWQuXG4gICAgICovXG4gICAgcHVibGljIGlzUGFnZUV4aXN0ID0gKHBhZ2U6UGFnZVR5cGUpOmJvb2xlYW4gPT4ge1xuICAgICAgICByZXR1cm4gKHRoaXMucGFnZUxpc3QuaW5kZXhPZihwYWdlKSA+IC0xKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGJhY2tncm91bmQgaW1hZ2Ugb2YgdGhlIHBhZ2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhZ2UgLSBOYW1lIG9mIHRoZSBwYWdlIHRvIGJlIHNldCB0aGUgYmFja2dyb3VuZCBpbWFnZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VQYXRoIC0gUGF0aCBvZiB0aGUgYmFja2dyb3VuZCBpbWFnZS5cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgcHVibGljIHNldFBhZ2VCZ0ltYWdlID0gKHBhZ2U6UGFnZVR5cGUsIGltYWdlUGF0aDpzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaXNQYWdlRXhpc3QocGFnZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsbVBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgcGFnZSk7XG4gICAgICAgICAgICBpZihlbG1QYWdlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW1hZ2VQYXRoICYmIHR5cGVvZiBpbWFnZVBhdGggPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxtUGFnZS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIGltYWdlUGF0aCArIFwiKVwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVBhZ2Uuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJleHBvcnQgdHlwZSBJV2ViU1FMRGF0YWJhc2UgPSBEYXRhYmFzZVxuZXhwb3J0IGludGVyZmFjZSBJSXRlbVByaWNlIHtcbiAgICBpdGVtOnN0cmluZyxcbiAgICBwcmljZTpudW1iZXIsXG4gICAgaW5zZXJ0ZGF5PzpzdHJpbmcsXG59XG5cbmV4cG9ydCBsZXQgZGI6SURCRGF0YWJhc2UgfCBJV2ViU1FMRGF0YWJhc2VcbmV4cG9ydCBsZXQgZGJUeXBlID0gXCJub25lXCJcbmxldCBpZGJPYmplY3RTdG9yZTogSURCT2JqZWN0U3RvcmVcbmNvbnN0IERCX1ZFUlNJT04gPSA1XG5jb25zdCBEQl9OQU1FID0gXCJNb25leUJvb2tcIlxuY29uc3QgREJfRElTUExBWV9OQU1FID0gXCJtb25leWJvb2tfZGJcIlxuY29uc3QgREJfU0laRSA9IDIgKiAxMDI0ICogMTAyNFxuZXhwb3J0IGNvbnN0ICBEQl9UQUJMRV9OQU1FID0gXCJ0aXplbk1vbmV5Ym9va1wiXG4vKipcbiAgICAgKiBDcmVhdGVzIHRoZSB0YWJsZSBpZiBub3QgZXhpc3RzLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRiIC0gVGhlIGRhdGFiYXNlIG9iamVjdChXZWJTUUwgb3IgSW5kZXhlZERCKVxuICAgICAqL1xuZnVuY3Rpb24gX2NyZWF0ZVRhYmxlKGRiOklEQkRhdGFiYXNlIHwgSVdlYlNRTERhdGFiYXNlKSB7XG4gICAgICAgIGlmIChkYlR5cGUgPT09IFwiSURCXCIgJiYgZGIgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSkge1xuICAgICAgICAgICAgaWYgKGRiLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoREJfVEFCTEVfTkFNRSkpIHtcbiAgICAgICAgICAgICAgICBkYi5kZWxldGVPYmplY3RTdG9yZShEQl9UQUJMRV9OQU1FKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoREJfVEFCTEVfTkFNRSwge1xuICAgICAgICAgICAgICAgIGtleVBhdGg6IFwiaWRcIixcbiAgICAgICAgICAgICAgICBhdXRvSW5jcmVtZW50OiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChkYlR5cGUgPT09IFwiU1FMXCIgJiYgIShkYiBpbnN0YW5jZW9mIElEQkRhdGFiYXNlKSkge1xuICAgICAgICAgICAgLy8gWW91IGNhbm5vdCB3cml0ZSBkYiBpbnN0YW5jZW9mIElXZWJTUUxEYXRhYmFzZSwgc2luY2UgaXQgaXMganVzdCBhIHR5cGUgZGVmaW5pdGlvblxuICAgICAgICAgICAgLy8gd2hpbGUgSURCRGF0YWJhc2UgaXMgYSByZWFsIEphdmFTY3JpcHQgY2xhc3NcbiAgICAgICAgICAgIC8vIFdvdyEgVHlwZVNjcmlwIGNhbiBpbmZlciB0aGF0IGlmIGRiIGlzIG5vdCBJREJEYXRhYmFzZSB0aGVuIGl0IG11c3QgYmUgYW4gSVdlYlNRTERhdGFiYXNlXG4gICAgICAgICAgICBkYi50cmFuc2FjdGlvbihmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKFwiQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgXCIgKyBEQl9UQUJMRV9OQU1FICsgXCIgKGlkIElOVEVHRVIgUFJJTUFSWSBLRVksIGl0ZW0gVEVYVCwgcHJpY2UgSU5URUdFUiwgaW5zZXJ0ZGF5IERBVEVUSU1FKVwiLCBbXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiRXJyb3IgZnJvbSBjcmVhdGVUYWJsZTogbm8gREJ0eXBlXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBhIGRhdGEgdG8gdGhlIHRhYmxlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRiIC0gVGhlIGRhdGFiYXNlIG9iamVjdChXZWJTUUwgb3IgSW5kZXhlZERCKVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gVGhlIGRhdGEgdG8gYmUgcHV0XG4gICAgICovXG5leHBvcnQgICAgZnVuY3Rpb24gaW5zZXJ0RGF0YShkYjpJREJEYXRhYmFzZSB8IElXZWJTUUxEYXRhYmFzZSwgZGF0YTpJSXRlbVByaWNlKSB7XG4gICAgICAgIGlmIChkYlR5cGUgPT09IFwiSURCXCIgJiYgZGIgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSkge1xuICAgICAgICAgICAgaWRiT2JqZWN0U3RvcmUgPSBkYi50cmFuc2FjdGlvbihEQl9UQUJMRV9OQU1FLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShEQl9UQUJMRV9OQU1FKTtcbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlLnB1dChkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChkYlR5cGUgPT09IFwiU1FMXCIgJiYgIShkYiBpbnN0YW5jZW9mIElEQkRhdGFiYXNlKSkge1xuICAgICAgICAgICAgZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXlTdHJpbmc7XG4gICAgICAgICAgICAgICAgZGF5U3RyaW5nID0gZ2V0RGF0ZVRpbWVTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoXCJJTlNFUlQgSU5UTyBcIiArIERCX1RBQkxFX05BTUUgKyBcIiAoaXRlbSwgcHJpY2UsIGluc2VydGRheSkgVkFMVUVTICg/LCA/LCA/KVwiLCBbZGF0YS5pdGVtLCBkYXRhLnByaWNlLCBkYXlTdHJpbmddKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyBhIGRhdGEgZnJvbSB0aGUgdGFibGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGIgLSBUaGUgZGF0YWJhc2Ugb2JqZWN0KFdlYlNRTCBvciBJbmRleGVkREIpXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSBUaGUgZGF0YSB0byBiZSBkZWxldGVkXG4gICAgICovXG5leHBvcnQgICAgZnVuY3Rpb24gZGVsZXRlRGF0YShkYjpJREJEYXRhYmFzZSB8IElXZWJTUUxEYXRhYmFzZSwgaWQ6bnVtYmVyKSB7XG4gICAgICAgIGlmIChkYlR5cGUgPT09IFwiSURCXCIgJiYgZGIgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSkge1xuICAgICAgICAgICAgaWRiT2JqZWN0U3RvcmUgPSBkYi50cmFuc2FjdGlvbihEQl9UQUJMRV9OQU1FLCBcInJlYWR3cml0ZVwiKS5vYmplY3RTdG9yZShEQl9UQUJMRV9OQU1FKTtcbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlLmRlbGV0ZShpZCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGJUeXBlID09PSBcIlNRTFwiICYmICEoZGIgaW5zdGFuY2VvZiBJREJEYXRhYmFzZSkpIHtcbiAgICAgICAgICAgIGRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoXCJERUxFVEUgRlJPTSBcIiArIERCX1RBQkxFX05BTUUgKyBcIiBXSEVSRSBpZCA9ID9cIiwgW2lkXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgYWxsIGRhdGEgZnJvbSB0aGUgdGFibGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGIgLSBUaGUgZGF0YWJhc2Ugb2JqZWN0KFdlYlNRTCBvciBJbmRleGVkREIpXG4gICAgICovXG5leHBvcnQgICAgZnVuY3Rpb24gZGVsZXRlRGF0YUFsbChkYjpJREJEYXRhYmFzZSB8IElXZWJTUUxEYXRhYmFzZSkge1xuICAgICAgICBpZiAoZGJUeXBlID09PSBcIklEQlwiICYmIGRiIGluc3RhbmNlb2YgSURCRGF0YWJhc2UpIHtcbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlID0gZGIudHJhbnNhY3Rpb24oREJfVEFCTEVfTkFNRSwgXCJyZWFkd3JpdGVcIikub2JqZWN0U3RvcmUoREJfVEFCTEVfTkFNRSk7XG4gICAgICAgICAgICBpZGJPYmplY3RTdG9yZS5jbGVhcigpO1xuICAgICAgICB9IGVsc2UgaWYgKGRiVHlwZSA9PT0gXCJTUUxcIiAmJiAhKGRiIGluc3RhbmNlb2YgSURCRGF0YWJhc2UpKSB7XG4gICAgICAgICAgICBkYi50cmFuc2FjdGlvbihmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKFwiREVMRVRFIEZST00gXCIgKyBEQl9UQUJMRV9OQU1FICsgXCIgV0hFUkUgaWQgPiAwXCIsIFtdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHN0cmluZyBvZiBjdXJyZW50IGRhdGV0aW1lIGJ5IFwiTU0vZGQgSEg6bW1cIiBmb3JtYXQuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSByZXN1bHQgc3RyaW5nXG4gICAgICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGF0ZVRpbWVTdHJpbmcoKTpzdHJpbmcge1xuICAgICAgICBjb25zdCBkYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgICByZXR1cm4gKGFkZExlYWRpbmdaZXJvKGRheS5nZXRNb250aCgpICsgMSwgMikgKyBcIi9cIiArIGFkZExlYWRpbmdaZXJvKGRheS5nZXREYXRlKCksIDIpICsgXCIgXCIgK1xuICAgICAgICAgICAgYWRkTGVhZGluZ1plcm8oZGF5LmdldEhvdXJzKCksIDIpICsgXCI6XCIgKyBhZGRMZWFkaW5nWmVybyhkYXkuZ2V0TWludXRlcygpLCAyKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgbGVhZGluZyB6ZXJvKHMpIHRvIGEgbnVtYmVyIGFuZCBtYWtlIGEgc3RyaW5nIG9mIGZpeGVkIGxlbmd0aC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXIgLSBBIG51bWJlciB0byBtYWtlIGEgc3RyaW5nLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkaWdpdCAtIFRoZSBsZW5ndGggb2YgdGhlIHJlc3VsdCBzdHJpbmcuXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgcmVzdWx0IHN0cmluZ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFkZExlYWRpbmdaZXJvKG51bWJlcjpudW1iZXIsIGRpZ2l0Om51bWJlcik6c3RyaW5nIHtcbiAgICAgICAgY29uc3QgbiA9IG51bWJlci50b1N0cmluZygpXG4gICAgICAgIGxldCBzdHJaZXJvID0gXCJcIjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaWdpdCAtIG4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHN0clplcm8gKz0gXCIwXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0clplcm8gKyBuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVucyB0aGUgZGF0YWJhc2UuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdWNjZXNzQ2IgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gc2hvdWxkIGJlIGNhbGxlZCBhZnRlciBvcGVuIGRhdGFiYXNlLlxuICAgICAqL1xuICAgIC8vQHRzLWlnbm9yZVxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5EQihzdWNjZXNzQ2IpIHtcbiAgICAgICAgdmFyIHJlcXVlc3Q6SURCT3BlbkRCUmVxdWVzdDtcblxuICAgICAgICBpZiAod2luZG93LmluZGV4ZWREQikge1xuICAgICAgICAgICAgZGJUeXBlID0gXCJJREJcIjtcblxuICAgICAgICAgICAgcmVxdWVzdCA9IGluZGV4ZWREQi5vcGVuKERCX05BTUUsIERCX1ZFUlNJT04pO1xuICAgICAgICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oZTpFdmVudCkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiUGxlYXNlIGFsbG93IHRoaXMgYXBwbGljYXRpb24gdG8gdXNlIEluZGV4ZWQgREI6XCIgKyBlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXF1ZXN0Lm9uc3VjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGRiID0gcmVxdWVzdC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3NDYikge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2IoZGIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBTZXQgYSBjYWxsYmFjayBmdW5jdGlvbiBXaGVuIHRoZSBJbmRleGVkIERCIGlzIGNyZWF0ZWQgZmlyc3QsXG4gICAgICAgICAgICAvLyBvciB1cGdyYWRlIGlzIG5lZWRlZFxuICAgICAgICAgICAgcmVxdWVzdC5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgZGIgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgX2NyZWF0ZVRhYmxlKGRiKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIC8vQHRzLWlnbm9yZSBXZWJTUUwgXG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93Lm9wZW5EYXRhYmFzZSkge1xuICAgICAgICAgICAgZGJUeXBlID0gXCJTUUxcIjtcbiAgICAgICAgICAgIC8vQHRzLWlnbm9yZSBXZWJTUUxcbiAgICAgICAgICAgIHdkYiA9IG9wZW5EYXRhYmFzZShEQl9OQU1FLCBEQl9WRVJTSU9OLCBEQl9ESVNQTEFZX05BTUUsIERCX1NJWkUpO1xuICAgICAgICAgICAgX2NyZWF0ZVRhYmxlKGRiKTtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzQ2IpIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzQ2IoZGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJJbmRleGVkIERCL1dlYlNRTCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4iLCJpbXBvcnQge1BhZ2VDb250cm9sbGVyfSBmcm9tIFwiLi9wYWdlXCJcbmltcG9ydCB7ZGIsZGJUeXBlLERCX1RBQkxFX05BTUUsZGVsZXRlRGF0YSxJV2ViU1FMRGF0YWJhc2UsIElJdGVtUHJpY2UsXG5pbnNlcnREYXRhLGdldERhdGVUaW1lU3RyaW5nLG9wZW5EQixkZWxldGVEYXRhQWxsfSBmcm9tIFwiLi9kYmFwaVwiXG5pbnRlcmZhY2UgSURhdGFUb0RlbGV0ZSB7XG4gICAgaWQ6IG51bWJlcixcbiAgICB0YWJsZTogSFRNTERpdkVsZW1lbnQsXG4gICAgcm93OiBIVE1MRGl2RWxlbWVudCxcbn07XG5pbnRlcmZhY2UgSVBvcHVwQ2FsbGJhY2sge1xuICAgIGNiT0s6KCk9PnZvaWQsXG4gICAgY2JDYW5jZWw6KCgpPT52b2lkKSB8IG51bGwsXG59XG5cbmxldCBwYWdlQ29udHJvbGxlciA9IG5ldyBQYWdlQ29udHJvbGxlcigpXG5cbi8qZ2xvYmFsIGluZGV4ZWREQiwgb3BlbkRhdGFiYXNlLCBwYWdlQ29udHJvbGxlciovXG52YXIgXG4gICAgZGF0YVR5cGVMaXN0ID0gW1wiaWRcIiwgXCJpdGVtXCIsIFwicHJpY2VcIiwgXCJpbnNlcnRkYXlcIl0sXG4gICAgcGFnZUxpc3QgPSBbXCJwYWdlLXJlc3VsdFwiLCBcInBhZ2UtaW5wdXRcIl0sXG4gICAgcG9wdXBTdGF0dXMgPSBcIkRlYWN0aXZlXCI7XG5cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGNoaWxkIG9mIHRoZSBlbGVtZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsbSAtIFRoZSBvYmplY3QgdG8gYmUgZW1wdGllZFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIGVtcHRpZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVtcHR5RWxlbWVudChlbG06RWxlbWVudCkge1xuICAgICAgICBpZihlbG0pIHdoaWxlIChlbG0uZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgZWxtLnJlbW92ZUNoaWxkKGVsbS5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxtO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlcyB0aGUgcG9wdXAgZGl2LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2xvc2VQb3B1cCgpIHtcbiAgICAgICAgY29uc3QgZGl2UG9wdXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BvcHVwXCIpO1xuICAgICAgICBpZihkaXZQb3B1cCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSBkaXZQb3B1cC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIHBvcHVwU3RhdHVzID0gXCJEZWFjdGl2ZVwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIHRoZSBwb3B1cCBkaXYuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHN0cmluZyB0byBiZSBzaG93biBpbiB0aGUgcG9wdXBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG9mIHRoZSBwb3B1cChPSy9PS0NhbmNlbClcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY2FsbGJhY2tMaXN0IC0gVGhlIGxpc3Qgb2YgY2FsbGJhY2sgZnVuY3Rpb25zIHRvIGJlIGNhbGxlZFxuICAgICAqICAgICAgd2hlbiB0aGUgYnV0dG9uIGluIHRoZSBwb3B1cCBpcyBjbGlja2VkXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcG9wdXAgaXMgc3VjY2Vzc2Z1bGx5IHNob3dlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzaG93UG9wdXAobWVzc2FnZTpzdHJpbmcsIHR5cGU6c3RyaW5nLCBjYWxsYmFja0xpc3Q/OklQb3B1cENhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IGRpdlBvcHVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwb3B1cFwiKSxcbiAgICAgICAgICAgIGRpdkRldGFpbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGV0YWlsLXBvcHVwXCIpLFxuICAgICAgICAgICAgZGl2Rm9vdGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmb290ZXItcG9wdXBcIilcbiAgICAgICAgLy8gVGVybWluYXRlIGlmIHBhcmFtZXRlcnMgaXMgbm90IHBhc3NlZCBvciB0aGUgcG9wdXAgaXMgYWxyZWFkeSBzaG93blxuICAgICAgICBpZiAoIW1lc3NhZ2UgfHwgIXR5cGUgfHwgcG9wdXBTdGF0dXMgPT09IFwiQWN0aXZlXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZighZGl2Rm9vdGVyKSB0aHJvdyBuZXcgRXJyb3IoXCIjZm9vdGVyLXBvcHVwIG5vdCBmb3VuZFwiKVxuICAgICAgICBpZighZGl2RGV0YWlsKSB0aHJvdyBuZXcgRXJyb3IoXCIjZGV0YWlsLXBvcHVwIG5vdCBmb3VuZFwiKVxuICAgICAgICBpZighKGRpdlBvcHVwICYmIGRpdlBvcHVwIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB0aHJvdyBuZXcgRXJyb3IoXCIjcG9wdXAgbm90IGZvdW5kXCIpXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcIk9LXCI6IHtcbiAgICAgICAgICAgICAgICAvLyBFbXB0eSB0aGUgZm9vdGVyIGFyZWFcbiAgICAgICAgICAgICAgICBlbXB0eUVsZW1lbnQoZGl2Rm9vdGVyKTtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IE9LIGJ1dHRvblxuICAgICAgICAgICAgICAgIGNvbnN0IG9iakJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgb2JqQnV0dG9uLmNsYXNzTmFtZSA9IFwiYnRuLXBvcHVwLW9rXCI7XG4gICAgICAgICAgICAgICAgb2JqQnV0dG9uLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiT0tcIikpO1xuICAgICAgICAgICAgICAgIC8vIFNldCBjYWxsYmFjayBpZiB0aGUgcGFyYW1ldGVyIHdhcyBwYXNzZWRcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tMaXN0ICYmIGNhbGxiYWNrTGlzdC5jYk9LICYmIHR5cGVvZihjYWxsYmFja0xpc3QuY2JPSykgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBvYmpCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tMaXN0LmNiT0soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlUG9wdXAoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlUG9wdXAoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFB1dCB0aGUgYnV0dG9uIHRvIHRoZSBmb290ZXIgYXJlYVxuICAgICAgICAgICAgICAgIGRpdkZvb3Rlci5hcHBlbmRDaGlsZChvYmpCdXR0b24pO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHRoZSBtZXNzYWdlXG4gICAgICAgICAgICAgICAgZW1wdHlFbGVtZW50KGRpdkRldGFpbCk7XG4gICAgICAgICAgICAgICAgZGl2RGV0YWlsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKTtcblxuICAgICAgICAgICAgICAgIGRpdlBvcHVwLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgICAgICAgcG9wdXBTdGF0dXMgPSBcIkFjdGl2ZVwiO1xuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiT0tDYW5jZWxcIjpcbiAgICAgICAgICAgICAgICAvLyBFbXB0eSB0aGUgZm9vdGVyIGFyZWFcbiAgICAgICAgICAgICAgICBlbXB0eUVsZW1lbnQoZGl2Rm9vdGVyKTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgT0sgYnV0dG9uXG4gICAgICAgICAgICAgICAgbGV0IG9iakJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgb2JqQnV0dG9uLmNsYXNzTmFtZSA9IFwiYnRuLXBvcHVwLW9rLWhhbGZcIjtcbiAgICAgICAgICAgICAgICBvYmpCdXR0b24uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJPS1wiKSk7XG4gICAgICAgICAgICAgICAgLy8gU2V0IGNhbGxiYWNrIGlmIHRoZSBwYXJhbWV0ZXIgd2FzIHBhc3NlZFxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja0xpc3QgJiYgY2FsbGJhY2tMaXN0LmNiT0sgJiYgdHlwZW9mKGNhbGxiYWNrTGlzdC5jYk9LKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iakJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja0xpc3QuY2JPSygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQb3B1cCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvYmpCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VQb3B1cCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gUHV0IHRoZSBidXR0b24gdG8gdGhlIGZvb3RlciBhcmVhXG4gICAgICAgICAgICAgICAgZGl2Rm9vdGVyLmFwcGVuZENoaWxkKG9iakJ1dHRvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IENhbmNlbCBidXR0b25cbiAgICAgICAgICAgICAgICBvYmpCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIG9iakJ1dHRvbi5jbGFzc05hbWUgPSBcImJ0bi1wb3B1cC1jYW5jZWwtaGFsZlwiO1xuICAgICAgICAgICAgICAgIG9iakJ1dHRvbi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkNhbmNlbFwiKSk7XG4gICAgICAgICAgICAgICAgLy8gU2V0IGNhbGxiYWNrIGlmIHRoZSBwYXJhbWV0ZXIgd2FzIHBhc3NlZFxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja0xpc3QgJiYgY2FsbGJhY2tMaXN0LmNiQ2FuY2VsICYmIHR5cGVvZihjYWxsYmFja0xpc3QuY2JDYW5jZWwpID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNhbGxiYWNrTGlzdC5jYkNhbmNlbCkgY2FsbGJhY2tMaXN0LmNiQ2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBvcHVwKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9iakJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVBvcHVwKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBQdXQgdGhlIGJ1dHRvbiB0byB0aGUgZm9vdGVyIGFyZWFcbiAgICAgICAgICAgICAgICBkaXZGb290ZXIuYXBwZW5kQ2hpbGQob2JqQnV0dG9uKTtcblxuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgbWVzc2FnZVxuICAgICAgICAgICAgICAgIGVtcHR5RWxlbWVudChkaXZEZXRhaWwpO1xuICAgICAgICAgICAgICAgIGRpdkRldGFpbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKSk7XG5cbiAgICAgICAgICAgICAgICBkaXZQb3B1cC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICAgICAgICAgIHBvcHVwU3RhdHVzID0gXCJBY3RpdmVcIjtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBFbXB0eSB0aGUgZm9vdGVyIGFyZWFcbiAgICAgICAgICAgICAgICBlbXB0eUVsZW1lbnQoZGl2Rm9vdGVyKTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgQ2xvc2UgYnV0dG9uXG4gICAgICAgICAgICAgICAgb2JqQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICBvYmpCdXR0b24uY2xhc3NOYW1lID0gXCJidG4tcG9wdXAtb2tcIjtcbiAgICAgICAgICAgICAgICBvYmpCdXR0b24uYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJDbG9zZVwiKSk7XG4gICAgICAgICAgICAgICAgZGl2Rm9vdGVyLmFwcGVuZENoaWxkKG9iakJ1dHRvbik7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICBlbXB0eUVsZW1lbnQoZGl2RGV0YWlsKTtcbiAgICAgICAgICAgICAgICBkaXZEZXRhaWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSkpO1xuXG4gICAgICAgICAgICAgICAgZGl2UG9wdXAuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICAgICAgICBwb3B1cFN0YXR1cyA9IFwiQWN0aXZlXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGRlbGV0ZSBhIGRhdGEgZnJvbSB0aGUgdGFibGUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaWQgLSBUaGUgaWQgb2YgdGhlIGRhdGEgdG8gYmUgZGVsZXRlZFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpUYWJsZSAtIEEgdGFibGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmpSb3cgLSBBIHJvdyBlbGVtZW50IGZyb20gdGhlIHRhYmxlXG4gICAgICogQHJldHVybiB7ZnVuY3Rpb259IFRoZSBjcmVhdGVkIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlRGVsZXRlQ2FsbGJhY2soaWQ6bnVtYmVyLCBvYmpUYWJsZTogSFRNTERpdkVsZW1lbnQsIG9ialJvdzogSFRNTERpdkVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHJldEZ1bmMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBkYXRhOiBJRGF0YVRvRGVsZXRlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgICB0YWJsZTogb2JqVGFibGUsXG4gICAgICAgICAgICAgICAgcm93OiBvYmpSb3dcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNob3dQb3B1cChcIkRvIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGUgRGF0YSBcIiArIGlkICsgXCI/XCIsIFwiT0tDYW5jZWxcIiwge1xuICAgICAgICAgICAgICAgIGNiT0s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGVEYXRhKGRiLCBkYXRhLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS50YWJsZS5yZW1vdmVDaGlsZChkYXRhLnJvdyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYkNhbmNlbDogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHJldEZ1bmM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvd3MgdGhlIGRhdGEgaW4gdGhlIGFycmF5IGJ5IHRhYmxlIGZvcm1hdC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7YXJyYXl9IGRhdGFBcnJheSAtIFRoZSBhcnJheSBjb250YWlucyBkYXRhIHRvIGJlIHNob3duXG4gICAgICovXG4gICAgLy9AdHMtaWdub3JlXG4gICAgZnVuY3Rpb24gc2hvd0RhdGFWaWV3KGRhdGFBcnJheTphbnlbXSkge1xuICAgICAgICBjb25zdCBvYmpSZXN1bHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RldGFpbC1yZXN1bHRcIilcbiAgICAgICAgbGV0ICAgIG9ialRhYmxlOkhUTUxEaXZFbGVtZW50LFxuICAgICAgICAgICAgb2JqUm93OkhUTUxEaXZFbGVtZW50LFxuICAgICAgICAgICAgb2JqQ29sOkhUTUxEaXZFbGVtZW50LFxuICAgICAgICAgICAgcHJvcDpzdHJpbmc7XG5cbiAgICAgICAgaWYob2JqUmVzdWx0KSBlbXB0eUVsZW1lbnQob2JqUmVzdWx0KTtcblxuICAgICAgICAvLyBDcmVhdGUgbmV3IGVtcHR5IHRhYmxlXG4gICAgICAgIG9ialRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgb2JqVGFibGUuY2xhc3NOYW1lID0gXCJ0YWJsZS1yZXN1bHRcIjtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGFBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIG5ldyBlbXB0eSB0YWJsZSByb3dcbiAgICAgICAgICAgIG9ialJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICBvYmpSb3cuY2xhc3NOYW1lID0gXCJyb3ctdGFibGUtcmVzdWx0XCI7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGRhdGFUeXBlTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIHByb3AgPSBkYXRhVHlwZUxpc3Rbal07XG4gICAgICAgICAgICAgICAgLy8gUHV0IGVhY2ggZGF0YSB0byB0aGUgY29sdW1uIGluIHRoZSB0YWJsZSByb3dcbiAgICAgICAgICAgICAgICBpZiAoZGF0YUFycmF5W2ldLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iakNvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wID09PSBcImlkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iakNvbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY3JlYXRlRGVsZXRlQ2FsbGJhY2soZGF0YUFycmF5W2ldW3Byb3BdLCBvYmpUYWJsZSwgb2JqUm93KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2JqQ29sLmNsYXNzTmFtZSA9IHByb3AgKyBcIi1kZXRhaWxcIjtcbiAgICAgICAgICAgICAgICAgICAgb2JqQ29sLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGFBcnJheVtpXVtwcm9wXSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIG9ialJvdy5hcHBlbmRDaGlsZChvYmpDb2wpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUHV0IHRoZSB0YWJsZSByb3cgdG8gdGhlIHRhYmxlXG4gICAgICAgICAgICBvYmpUYWJsZS5hcHBlbmRDaGlsZChvYmpSb3cpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFB1dCB0aGUgdGFibGUgdG8gdGhlIHJlc3VsdCBkaXZcbiAgICAgICAgaWYob2JqUmVzdWx0KSBvYmpSZXN1bHQuYXBwZW5kQ2hpbGQob2JqVGFibGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIHRoZSBkYXRhIGZyb20gZGF0YWJhc2UgYW5kIHNob3cgdGhlIGRhdGEgd2l0aCBzaG93RGF0YVZpZXcuXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGIgLSBUaGUgZGF0YWJhc2Ugb2JqZWN0XG4gICAgICogQHJldHVybiB7YXJyYXl9IFRoZSBhcnJheSBjb250YWlucyB0aGUgcmVzdWx0IGRhdGFcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsb2FkRGF0YVZpZXcoZGI6SURCRGF0YWJhc2UgfCBJV2ViU1FMRGF0YWJhc2UpIHtcbiAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgIGxldCByZXN1bHRCdWZmZXI6YW55W10gPSBbXTtcbiAgICAgICAgaWYgKGRiVHlwZSA9PT0gXCJJREJcIiAmJiBkYiBpbnN0YW5jZW9mIElEQkRhdGFiYXNlKSB7XG4gICAgICAgICAgICBjb25zdCBpZGJPYmplY3RTdG9yZSA9IGRiLnRyYW5zYWN0aW9uKERCX1RBQkxFX05BTUUsIFwicmVhZG9ubHlcIikub2JqZWN0U3RvcmUoREJfVEFCTEVfTkFNRSk7XG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgIGlkYk9iamVjdFN0b3JlLm9wZW5DdXJzb3IoKS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgY29uc3QgY3Vyc29yID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICAgIGlmIChjdXJzb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0QnVmZmVyLnB1c2goY3Vyc29yLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0RhdGFWaWV3KHJlc3VsdEJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRCdWZmZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChkYlR5cGUgPT09IFwiU1FMXCIgJiYgIShkYiBpbnN0YW5jZW9mIElEQkRhdGFiYXNlKSkge1xuICAgICAgICAgICAgZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbChcIlNFTEVDVCAqIEZST00gXCIgKyBEQl9UQUJMRV9OQU1FLCBbXSxcbiAgICAgICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHQsIHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHRCdWZmZXIgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgci5yb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0QnVmZmVyLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogci5yb3dzLml0ZW0oaSkuaWQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogci5yb3dzLml0ZW0oaSkuaXRlbSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmljZTogci5yb3dzLml0ZW0oaSkucHJpY2UgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zZXJ0ZGF5OiByLnJvd3MuaXRlbShpKS5pbnNlcnRkYXkgfHwgXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93RGF0YVZpZXcocmVzdWx0QnVmZmVyKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdEJ1ZmZlcjtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHQsIGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiRXJyb3IgZGF0YXZpZXc6IFwiICsgZS5tZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJbnB1dEVsZW1lbnQoaWQ6c3RyaW5nKTpIVE1MSW5wdXRFbGVtZW50IHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcbiAgICAgICAgaWYoZWwgJiYgZWwgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSByZXR1cm4gZWxcbiAgICAgICAgZWxzZSB0aHJvdyBFcnJvcihcIkhUTUxJbnB1dEVsZW1lbnQgbm90IGZvdW5kIHdpdGggaWQgXCIgKyBpZClcbiAgICB9IFxuICAgIGNvbnN0IGlucHV0SXRlbSA9ICgpID0+IGdldElucHV0RWxlbWVudChcImlucHV0LWl0ZW1cIikgXG4gICAgY29uc3QgaW5wdXRQcmljZSA9ICgpID0+IGdldElucHV0RWxlbWVudChcImlucHV0LXByaWNlXCIpIFxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCBhIG5ldyByZWNvcmQgdG8gdGhlIGRhdGFiYXNlLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcmVjb3JkIGlzIGFkZGVkIGludG8gdGhlIGRhdGFiYXNlLlxuICAgICAqL1xuZnVuY3Rpb24gc3VibWl0TmV3UmVjb3JkKCkge1xuICAgIGxldCBkYXRhOklJdGVtUHJpY2UgPSB7XG4gICAgICAgICAgICBpdGVtOiBcIk5vTmFtZVwiLFxuICAgICAgICAgICAgcHJpY2U6IDBcbiAgICAgICAgfVxuICAgIGxldCB0eHRJdGVtID0gaW5wdXRJdGVtKClcbiAgICBsZXQgdHh0UHJpY2UgPSBpbnB1dFByaWNlKClcbiAgICBpZiAoIXR4dEl0ZW0udmFsdWUgJiYgIXR4dFByaWNlLnZhbHVlKSB7XG4gICAgICAgIHNob3dQb3B1cChcIkl0ZW0gbmFtZSBhbmQgUHJpY2UgZGF0YSBhcmUgbmVlZGVkLlwiLCBcIk9LXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0eHRJdGVtLnZhbHVlKSB7XG4gICAgICAgIGRhdGEuaXRlbSA9IHR4dEl0ZW0udmFsdWU7XG4gICAgfVxuICAgIGlmICh0eHRQcmljZS52YWx1ZSkge1xuICAgICAgICBkYXRhLnByaWNlID0gTnVtYmVyKHR4dFByaWNlLnZhbHVlKVxuICAgIH1cbiAgICBkYXRhLmluc2VydGRheSA9IGdldERhdGVUaW1lU3RyaW5nKCk7XG4gICAgaW5zZXJ0RGF0YShkYiwgZGF0YSk7XG4gICAgdHh0SXRlbS52YWx1ZSA9IFwiXCI7XG4gICAgdHh0UHJpY2UudmFsdWUgPSBcIlwiO1xuICAgIHR4dEl0ZW0uZm9jdXMoKVxuICAgIHJldHVybiB0cnVlO1xufVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyB0aGUgaGFyZHdhcmUga2V5IGV2ZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gVGhlIGhhcmR3YXJlIGtleSBldmVudCBvYmplY3RcbiAgICAgKi9cbiAgICAvL0B0cy1pZ25vcmVcbiAgICBmdW5jdGlvbiBrZXlFdmVudENCKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5rZXlOYW1lID09PSBcImJhY2tcIikge1xuICAgICAgICAgICAgaWYgKHBvcHVwU3RhdHVzID09PSBcIkFjdGl2ZVwiKSB7XG4gICAgICAgICAgICAgICAgY2xvc2VQb3B1cCgpO1xuICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhZ2VDb250cm9sbGVyLmlzUGFnZU1haW4oKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICB0aXplbi5hcHBsaWNhdGlvbi5nZXRDdXJyZW50QXBwbGljYXRpb24oKS5leGl0KCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoaWdub3JlKSB7fVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICBwYWdlQ29udHJvbGxlci5tb3ZlQmFja1BhZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBkZWZhdWx0IHZhbHVlIHRvIHRoZSB2YXJpYWJsZXMgYW5kIGFwcGxpY2F0aW9uIGVudmlyb25tZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2V0RGVmYXVsdFZhcmlhYmxlcygpIHtcbiAgICAgICAgY29uc3QgZGl2UmVzdWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZXRhaWwtcmVzdWx0XCIpXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5oZWlnaHQgPT09IDM2MCkge1xuICAgICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIChkaXZSZXN1bHQgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmhlaWdodCA9IChkb2N1bWVudC5oZWlnaHQgLSA4MCkgKyBcInB4XCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIGRpdlJlc3VsdC5zdHlsZS5oZWlnaHQgPSAoZG9jdW1lbnQuaGVpZ2h0IC0gNTApICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhZ2VMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYWdlQ29udHJvbGxlci5hZGRQYWdlKHBhZ2VMaXN0W2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGRlZmF1bHQgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGV2ZW50cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNldERlZmF1bHRFdmVudHMoKSB7XG4gICAgICAgIHZhciBidG5TdWJtaXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2J0bi1zdWJtaXRcIiksXG4gICAgICAgICAgICBidG5DbGVhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYnRuLWNsZWFyXCIpLFxuICAgICAgICAgICAgYnRuSW5wdXRQYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNidG4taW5wdXQtcGFnZVwiKSxcbiAgICAgICAgICAgIGJ0bklucHV0QmFjayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYnRuLWlucHV0LWJhY2tcIik7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRpemVuaHdrZXlcIiwga2V5RXZlbnRDQik7XG4gICAgICAgIGlmKCFidG5JbnB1dEJhY2spIHRocm93IG5ldyBFcnJvcihcIk5vIGJ0bi1pbnB1dC1iYWNrXCIpIFxuICAgICAgICBidG5JbnB1dEJhY2suYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbG9hZERhdGFWaWV3KGRiKTtcbiAgICAgICAgICAgIHBhZ2VDb250cm9sbGVyLm1vdmVQYWdlKFwicGFnZS1yZXN1bHRcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBpZighYnRuU3VibWl0KSB0aHJvdyBuZXcgRXJyb3IoXCJObyBidG4tc3VibWl0XCIpIFxuICAgICAgICBidG5TdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHR4dEl0ZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2lucHV0LWl0ZW1cIiksXG4gICAgICAgICAgICAgICAgdHh0UHJpY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2lucHV0LXByaWNlXCIpO1xuXG4gICAgICAgICAgICBpZiAoISh0eHRJdGVtIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlICYmICEodHh0UHJpY2UgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBzaG93UG9wdXAoXCJJdGVtIG5hbWUgYW5kIFByaWNlIGRhdGEgYXJlIG5lZWRlZC5cIiwgXCJPS1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd1BvcHVwKFwiRG8geW91IHdhbnQgYWRkIG5ldyBkYXRhP1wiLCBcIk9LQ2FuY2VsXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgY2JPSzogc3VibWl0TmV3UmVjb3JkLFxuICAgICAgICAgICAgICAgICAgICBjYkNhbmNlbDogbnVsbFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYoIWJ0bklucHV0UGFnZSkgdGhyb3cgbmV3IEVycm9yKFwiTm8gI2J0bi1pbnB1dC1wYWdlXCIpIFxuICAgICAgICBidG5JbnB1dFBhZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcGFnZUNvbnRyb2xsZXIubW92ZVBhZ2UoXCJwYWdlLWlucHV0XCIpO1xuICAgICAgICAgICAgaW5wdXRJdGVtKCkuZm9jdXMoKVxuICAgICAgICB9KTtcbiAgICAgICAgaWYoIWJ0bkNsZWFyKSB0aHJvdyBuZXcgRXJyb3IoXCJObyAjYnRuLWNsZWFyXCIpIFxuICAgICAgICBidG5DbGVhci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzaG93UG9wdXAoXCJEbyB5b3Ugd2FudCB0byBkZWxldGUgYWxsIGRhdGE/XCIsIFwiT0tDYW5jZWxcIiwge1xuICAgICAgICAgICAgICAgIGNiT0s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2JqUmVzdWx0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZXRhaWwtcmVzdWx0XCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKG9ialJlc3VsdCkgZW1wdHlFbGVtZW50KG9ialJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZURhdGFBbGwoZGIpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2JDYW5jZWw6IG51bGxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICBpbnB1dEl0ZW0oKS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNvdXRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKCFpbnB1dEl0ZW0oKS52YWx1ZSkgaW5wdXRQcmljZSgpLmZvY3VzKClcbiAgICAgICAgfSlcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBhcHBsaWNhdGlvbi5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIG9wZW5EQihsb2FkRGF0YVZpZXcpO1xuICAgICAgICBzZXREZWZhdWx0VmFyaWFibGVzKCk7XG4gICAgICAgIHNldERlZmF1bHRFdmVudHMoKTtcbiAgICB9XG5cbiAgICB3aW5kb3cub25sb2FkID0gaW5pdDsiXX0=