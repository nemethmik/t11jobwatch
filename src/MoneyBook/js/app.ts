import {PageController} from "./page"
import {db,dbType,DB_TABLE_NAME,deleteData,IWebSQLDatabase, IItemPrice,
insertData,getDateTimeString,openDB,deleteDataAll} from "./dbapi"
interface IDataToDelete {
    id: number,
    table: HTMLDivElement,
    row: HTMLDivElement,
};
interface IPopupCallback {
    cbOK:()=>void,
    cbCancel:(()=>void) | null,
}

let pageController = new PageController()

/*global indexedDB, openDatabase, pageController*/
var 
    dataTypeList = ["id", "item", "price", "insertday"],
    pageList = ["page-result", "page-input"],
    popupStatus = "Deactive";


    /**
     * Removes all child of the element.
     * @private
     * @param {Object} elm - The object to be emptied
     * @return {Object} The emptied element
     */
    function emptyElement(elm:Element) {
        if(elm) while (elm.firstChild) {
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
        if(divPopup instanceof HTMLElement) divPopup.style.display = "none";
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
    function showPopup(message:string, type:string, callbackList?:IPopupCallback) {
        const divPopup = document.querySelector("#popup"),
            divDetail = document.querySelector("#detail-popup"),
            divFooter = document.querySelector("#footer-popup")
        // Terminate if parameters is not passed or the popup is already shown
        if (!message || !type || popupStatus === "Active") {
            return false;
        }
        if(!divFooter) throw new Error("#footer-popup not found")
        if(!divDetail) throw new Error("#detail-popup not found")
        if(!(divPopup && divPopup instanceof HTMLElement)) throw new Error("#popup not found")
        switch (type) {
            case "OK": {
                // Empty the footer area
                emptyElement(divFooter);
                // Create new OK button
                const objButton = document.createElement("div");
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
            }
            case "OKCancel":
                // Empty the footer area
                emptyElement(divFooter);

                // Create new OK button
                let objButton = document.createElement("div");
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
                        if(callbackList.cbCancel) callbackList.cbCancel();
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
     * Creates a callback function to delete a data from the table.
     * @private
     * @param {number} id - The id of the data to be deleted
     * @param {Object} objTable - A table element
     * @param {Object} objRow - A row element from the table
     * @return {function} The created callback function
     */
    function createDeleteCallback(id:number, objTable: HTMLDivElement, objRow: HTMLDivElement) {
        var retFunc = function() {
            var data: IDataToDelete = {
                id: id,
                table: objTable,
                row: objRow
            };

            showPopup("Do you want to delete the Data " + id + "?", "OKCancel", {
                cbOK: function() {
                    deleteData(db, data.id);
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
    function showDataView(dataArray:any[]) {
        const objResult = document.querySelector("#detail-result")
        let    objTable:HTMLDivElement,
            objRow:HTMLDivElement,
            objCol:HTMLDivElement,
            prop:string;

        if(objResult) emptyElement(objResult);

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
        if(objResult) objResult.appendChild(objTable);
    }

    /**
     * Loads the data from database and show the data with showDataView.
     * @private
     * @param {Object} db - The database object
     * @return {array} The array contains the result data
     */
    function loadDataView(db:IDBDatabase | IWebSQLDatabase) {
        //@ts-ignore
        let resultBuffer:any[] = [];
        if (dbType === "IDB" && db instanceof IDBDatabase) {
            const idbObjectStore = db.transaction(DB_TABLE_NAME, "readonly").objectStore(DB_TABLE_NAME);
            //@ts-ignore
            idbObjectStore.openCursor().onsuccess = function(e) {
                //@ts-ignore
                const cursor = e.target.result;
                if (cursor) {
                    resultBuffer.push(cursor.value);
                    cursor.continue();
                } else {
                    showDataView(resultBuffer);
                    return resultBuffer;
                }
            };
        } else if (dbType === "SQL" && !(db instanceof IDBDatabase)) {
            db.transaction(function(t) {
                t.executeSql("SELECT * FROM " + DB_TABLE_NAME, [],
                    //@ts-ignore
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
                    //@ts-ignore
                    function(t, e) {
                        alert("Error dataview: " + e.message);

                        return null;
                    });
            });
        }
    }

    function getInputElement(id:string):HTMLInputElement {
        const el = document.getElementById(id)
        if(el && el instanceof HTMLInputElement) return el
        else throw Error("HTMLInputElement not found with id " + id)
    } 
    const inputItem = () => getInputElement("input-item") 
    const inputPrice = () => getInputElement("input-price") 
    /**
     * Submit a new record to the database.
     * @private
     * @return {boolean} True if the record is added into the database.
     */
function submitNewRecord() {
    let data:IItemPrice = {
            item: "NoName",
            price: 0
        }
    let txtItem = inputItem()
    let txtPrice = inputPrice()
    if (!txtItem.value && !txtPrice.value) {
        showPopup("Item name and Price data are needed.", "OK");
        return false;
    }
    if (txtItem.value) {
        data.item = txtItem.value;
    }
    if (txtPrice.value) {
        data.price = Number(txtPrice.value)
    }
    data.insertday = getDateTimeString();
    insertData(db, data);
    txtItem.value = "";
    txtPrice.value = "";
    txtItem.focus()
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
            } else if (pageController.isPageMain() === true) {
                try {
                    //@ts-ignore
                    tizen.application.getCurrentApplication().exit();
                } catch (ignore) {}
            } else {
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
        const divResult = document.querySelector("#detail-result")
        setTimeout(function() {
            //@ts-ignore
            if (document.height === 360) {
                //@ts-ignore
                (divResult as HTMLElement).style.height = (document.height - 80) + "px";
            } else {
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
        var btnSubmit = document.querySelector("#btn-submit"),
            btnClear = document.querySelector("#btn-clear"),
            btnInputPage = document.querySelector("#btn-input-page"),
            btnInputBack = document.querySelector("#btn-input-back");

        document.addEventListener("tizenhwkey", keyEventCB);
        if(!btnInputBack) throw new Error("No btn-input-back") 
        btnInputBack.addEventListener("click", function() {
            loadDataView(db);
            pageController.movePage("page-result");
        });
        if(!btnSubmit) throw new Error("No btn-submit") 
        btnSubmit.addEventListener("click", function() {
            var txtItem = document.querySelector("#input-item"),
                txtPrice = document.querySelector("#input-price");

            if (!(txtItem as HTMLInputElement).value && !(txtPrice as HTMLInputElement).value) {
                showPopup("Item name and Price data are needed.", "OK");
            } else {
                showPopup("Do you want add new data?", "OKCancel", {
                    cbOK: submitNewRecord,
                    cbCancel: null
                });
            }
        });
        if(!btnInputPage) throw new Error("No #btn-input-page") 
        btnInputPage.addEventListener("click", function() {
            pageController.movePage("page-input");
            inputItem().focus()
        });
        if(!btnClear) throw new Error("No #btn-clear") 
        btnClear.addEventListener("click", function() {
            showPopup("Do you want to delete all data?", "OKCancel", {
                cbOK: function() {
                    var objResult = document.querySelector("#detail-result");

                    if(objResult) emptyElement(objResult);
                    deleteDataAll(db);
                },
                cbCancel: null
            });
        })
        inputItem().addEventListener("focusout", function(){
            if(!inputItem().value) inputPrice().focus()
        })

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