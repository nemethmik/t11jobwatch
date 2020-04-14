/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global indexedDB, openDatabase, pageController*/
/*jshint unused: vars*/

(function() {
    var DB_VERSION = 5,
        DB_NAME = "MoneyBook",
        DB_DISPLAY_NAME = "moneybook_db",
        DB_SIZE = 2 * 1024 * 1024,
        DB_TABLE_NAME = "tizenMoneybook",
        dataTypeList = ["id", "item", "price", "insertday"],
        pageList = ["page-result", "page-input"],
        db,
        dbType = "none",
        idbObjectStore,
        popupStatus = "Deactive";

    /**
     * Adds leading zero(s) to a number and make a string of fixed length.
     * @private
     * @param {number} number - A number to make a string.
     * @param {number} digit - The length of the result string.
     * @return {string} The result string
     */
    function addLeadingZero(number, digit) {
        var n = number.toString(),
            i,
            strZero = "";

        for (i = 0; i < digit - n.length; i++) {
            strZero += "0";
        }

        return strZero + n;
    }

    /**
     * Gets the string of current datetime by "MM/dd HH:mm" format.
     * @private
     * @return {string} The result string
     */
    function getDateTimeString() {
        var day = new Date();

        return (addLeadingZero(day.getMonth() + 1, 2) + "/" + addLeadingZero(day.getDate(), 2) + " " +
            addLeadingZero(day.getHours(), 2) + ":" + addLeadingZero(day.getMinutes(), 2));
    }

    /**
     * Removes all child of the element.
     * @private
     * @param {Object} elm - The object to be emptied
     * @return {Object} The emptied element
     */
    function emptyElement(elm) {
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
        var divPopup = document.querySelector("#popup");

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
        var divPopup = document.querySelector("#popup"),
            divDetail = document.querySelector("#detail-popup"),
            divFooter = document.querySelector("#footer-popup"),
            objButton;

        // Terminate if parameters is not passed or the popup is already shown
        if (!message || !type || popupStatus === "Active") {
            return false;
        }

        switch (type) {
            case "OK":
                // Empty the footer area
                emptyElement(divFooter);

                // Create new OK button
                objButton = document.createElement("div");
                objButton.className = "btn-popup-ok";
                objButton.appendChild(document.createTextNode("OK"));
                // Set callback if the parameter was passed
                if (callbackList && callbackList.cbOK && typeof(callbackList.cbOK) === "function") {
                    objButton.addEventListener("click", function() {
                        callbackList.cbOK();
                        closePopup();
                    });
                } else {
                    objButton.addEventListener("click", function() {
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
            case "OKCancel":
                // Empty the footer area
                emptyElement(divFooter);

                // Create new OK button
                objButton = document.createElement("div");
                objButton.className = "btn-popup-ok-half";
                objButton.appendChild(document.createTextNode("OK"));
                // Set callback if the parameter was passed
                if (callbackList && callbackList.cbOK && typeof(callbackList.cbOK) === "function") {
                    objButton.addEventListener("click", function() {
                        callbackList.cbOK();
                        closePopup();
                    });
                } else {
                    objButton.addEventListener("click", function() {
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
                if (callbackList && callbackList.cbCancel && typeof(callbackList.cbCancel) === "function") {
                    objButton.addEventListener("click", function() {
                        callbackList.cbCancel();
                        closePopup();
                    });
                } else {
                    objButton.addEventListener("click", function() {
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
     * Creates the table if not exists.
     * @private
     * @param {Object} db - The database object(WebSQL or IndexedDB)
     */
    function createTable(db) {
        if (dbType === "IDB") {
            if (db.objectStoreNames.contains(DB_TABLE_NAME)) {
                db.deleteObjectStore(DB_TABLE_NAME);
            }

            idbObjectStore = db.createObjectStore(DB_TABLE_NAME, {
                keyPath: "id",
                autoIncrement: true
            });
        } else if (dbType === "SQL") {
            db.transaction(function(t) {
                t.executeSql("CREATE TABLE IF NOT EXISTS " + DB_TABLE_NAME + " (id INTEGER PRIMARY KEY, item TEXT, price INTEGER, insertday DATETIME)", []);
            });
        } else {
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
        if (dbType === "IDB") {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readwrite").objectStore(DB_TABLE_NAME);
            idbObjectStore.put(data);
        } else if (dbType === "SQL") {
            db.transaction(function(t) {
                var dayString;

                dayString = getDateTimeString();
                t.executeSql("INSERT INTO " + DB_TABLE_NAME + " (item, price, insertday) VALUES (?, ?, ?)", [data.item, data.price, dayString]);
            });
        }
    }

    /**
     * Deletes a data from the table.
     * @private
     * @param {Object} db - The database object(WebSQL or IndexedDB)
     * @param {Object} data - The data to be deleted
     */
    function deleteData(db, data) {
        if (dbType === "IDB") {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readwrite").objectStore(DB_TABLE_NAME);
            idbObjectStore.delete(data.id);
        } else if (dbType === "SQL") {
            db.transaction(function(t) {
                t.executeSql("DELETE FROM " + DB_TABLE_NAME + " WHERE id = ?", [data.id]);
            });
        }
    }

    /**
     * Deletes all data from the table.
     * @private
     * @param {Object} db - The database object(WebSQL or IndexedDB)
     */
    function deleteDataAll(db) {
        if (dbType === "IDB") {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readwrite").objectStore(DB_TABLE_NAME);
            idbObjectStore.clear();
        } else if (dbType === "SQL") {
            db.transaction(function(t) {
                t.executeSql("DELETE FROM " + DB_TABLE_NAME + " WHERE id > 0", []);
            });
        }
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
        var retFunc = function() {
            var data = {
                id: id,
                table: objTable,
                row: objRow
            };

            showPopup("Do you want to delete the Data " + id + "?", "OKCancel", {
                cbOK: function() {
                    deleteData(db, data);
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
    function showDataView(dataArray) {
        var objResult = document.querySelector("#detail-result"),
            objTable,
            objRow,
            objCol,
            i,
            j,
            prop;

        emptyElement(objResult);

        // Create new empty table
        objTable = document.createElement("div");
        objTable.className = "table-result";

        for (i = 0; i < dataArray.length; i++) {
            // Create new empty table row
            objRow = document.createElement("div");
            objRow.className = "row-table-result";
            for (j = 0; j < dataTypeList.length; j++) {
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
        objResult.appendChild(objTable);
    }

    /**
     * Loads the data from database and show the data with showDataView.
     * @private
     * @param {Object} db - The database object
     * @return {array} The array contains the result data
     */
    function loadDataView(db) {
        var resultBuffer = [];

        if (dbType === "IDB") {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readonly").objectStore(DB_TABLE_NAME);
            idbObjectStore.openCursor().onsuccess = function(e) {
                var cursor = e.target.result;

                if (cursor) {
                    resultBuffer.push(cursor.value);
                    cursor.continue();
                } else {
                    showDataView(resultBuffer);

                    return resultBuffer;
                }
            };
        } else if (dbType === "SQL") {
            db.transaction(function(t) {
                t.executeSql("SELECT * FROM " + DB_TABLE_NAME, [],
                    function(t, r) {
                        var resultBuffer = [],
                            i;

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
                    function(t, e) {
                        alert("Error dataview: " + e.message);

                        return null;
                    });
            });
        }
    }

    /**
     * Opens the database.
     * @private
     * @param {function} successCb - The callback function should be called after open database.
     */
    function openDB(successCb) {
        var request;

        if (window.indexedDB) {
            dbType = "IDB";

            request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = function(e) {
                alert("Please allow this application to use Indexed DB");
            };
            request.onsuccess = function(e) {
                db = request.result;
                if (successCb) {
                    successCb(db);
                }
            };
            // Set a callback function When the Indexed DB is created first,
            // or upgrade is needed
            request.onupgradeneeded = function(e) {
                db = e.target.result;
                createTable(db);
            };
        } else if (window.openDatabase) {
            dbType = "SQL";

            db = openDatabase(DB_NAME, DB_VERSION, DB_DISPLAY_NAME, DB_SIZE);
            createTable(db);

            if (successCb) {
                successCb(db);
            }
        } else {
            console.log("Indexed DB/WebSQL is not supported");
        }
    }

    /**
     * Submit a new record to the database.
     * @private
     * @return {boolean} True if the record is added into the database.
     */
    function submitNewRecord() {
        var data = {
                item: "NoName",
                price: 0
            },
            txtItem = document.querySelector("#input-item"),
            txtPrice = document.querySelector("#input-price");

        if (!txtItem.value && !txtPrice.value) {
            showPopup("Item name and Price data are needed.", "OK");

            return false;
        }

        if (txtItem.value) {
            data.item = txtItem.value;
        }
        if (txtPrice.value) {
            data.price = txtPrice.value;
        }
        data.insertday = getDateTimeString();

        insertData(db, data);

        txtItem.value = "";
        txtPrice.value = "";

        return true;
    }

    /**
     * Handles the hardware key event.
     * @private
     * @param {Object} event - The hardware key event object
     */
    function keyEventCB(event) {
        if (event.keyName === "back") {
            if (popupStatus === "Active") {
                closePopup();
            } else if (pageController.isPageMain() === true) {
                try {
                    tizen.application.getCurrentApplication().exit();
                } catch (ignore) {}
            } else {
                pageController.moveBackPage();
            }
        }
    }

    /**
     * Sets the default value to the variables and application environment.
     * @private
     */
    function setDefaultVariables() {
        var divResult = document.querySelector("#detail-result"),
            i;

        setTimeout(function() {
            if (document.height === 360) {
                divResult.style.height = (document.height - 80) + "px";
            } else {
                divResult.style.height = (document.height - 50) + "px";
            }
        }, 1000);

        for (i = 0; i < pageList.length; i++) {
            pageController.addPage(pageList[i]);
        }
    }

    /**
     * Sets the default event handlers to the events.
     * @private
     */
    function setDefaultEvents() {
        var btnSubmit = document.querySelector("#btn-submit"),
            btnClear = document.querySelector("#btn-clear"),
            btnInputPage = document.querySelector("#btn-input-page"),
            btnInputBack = document.querySelector("#btn-input-back");

        document.addEventListener("tizenhwkey", keyEventCB);

        btnInputBack.addEventListener("click", function() {
            loadDataView(db);
            pageController.movePage("page-result");
        });
        btnSubmit.addEventListener("click", function() {
            var txtItem = document.querySelector("#input-item"),
                txtPrice = document.querySelector("#input-price");

            if (!txtItem.value && !txtPrice.value) {
                showPopup("Item name and Price data are needed.", "OK");
            } else {
                showPopup("Do you want add new data?", "OKCancel", {
                    cbOK: submitNewRecord,
                    cbCancel: null
                });
            }
        });

        btnInputPage.addEventListener("click", function() {
            pageController.movePage("page-input");
        });
        btnClear.addEventListener("click", function() {
            showPopup("Do you want to delete all data?", "OKCancel", {
                cbOK: function() {
                    var objResult = document.querySelector("#detail-result");

                    emptyElement(objResult);
                    deleteDataAll(db);
                },
                cbCancel: null
            });
        });
    }

    /**
     * Initializes the application.
     * @private
     */
    function init() {
        openDB(loadDataView);
        setDefaultVariables();
        setDefaultEvents();
    }

    window.onload = init;
}());