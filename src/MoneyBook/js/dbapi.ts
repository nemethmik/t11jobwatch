export type IWebSQLDatabase = Database
export interface IItemPrice {
    item:string,
    price:number,
    insertday?:string,
}

export let db:IDBDatabase | IWebSQLDatabase
export let dbType = "none"
let idbObjectStore: IDBObjectStore
const DB_VERSION = 5
const DB_NAME = "MoneyBook"
const DB_DISPLAY_NAME = "moneybook_db"
const DB_SIZE = 2 * 1024 * 1024
export const  DB_TABLE_NAME = "tizenMoneybook"
/**
     * Creates the table if not exists.
     * @private
     * @param {Object} db - The database object(WebSQL or IndexedDB)
     */
function _createTable(db:IDBDatabase | IWebSQLDatabase) {
        if (dbType === "IDB" && db instanceof IDBDatabase) {
            if (db.objectStoreNames.contains(DB_TABLE_NAME)) {
                db.deleteObjectStore(DB_TABLE_NAME);
            }
            idbObjectStore = db.createObjectStore(DB_TABLE_NAME, {
                keyPath: "id",
                autoIncrement: true
            });
        } else if (dbType === "SQL" && !(db instanceof IDBDatabase)) {
            // You cannot write db instanceof IWebSQLDatabase, since it is just a type definition
            // while IDBDatabase is a real JavaScript class
            // Wow! TypeScrip can infer that if db is not IDBDatabase then it must be an IWebSQLDatabase
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
export    function insertData(db:IDBDatabase | IWebSQLDatabase, data:IItemPrice) {
        if (dbType === "IDB" && db instanceof IDBDatabase) {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readwrite").objectStore(DB_TABLE_NAME);
            idbObjectStore.put(data);
        } else if (dbType === "SQL" && !(db instanceof IDBDatabase)) {
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
export    function deleteData(db:IDBDatabase | IWebSQLDatabase, id:number) {
        if (dbType === "IDB" && db instanceof IDBDatabase) {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readwrite").objectStore(DB_TABLE_NAME);
            idbObjectStore.delete(id);
        } else if (dbType === "SQL" && !(db instanceof IDBDatabase)) {
            db.transaction(function(t) {
                t.executeSql("DELETE FROM " + DB_TABLE_NAME + " WHERE id = ?", [id]);
            });
        }
    }

    /**
     * Deletes all data from the table.
     * @private
     * @param {Object} db - The database object(WebSQL or IndexedDB)
     */
export    function deleteDataAll(db:IDBDatabase | IWebSQLDatabase) {
        if (dbType === "IDB" && db instanceof IDBDatabase) {
            idbObjectStore = db.transaction(DB_TABLE_NAME, "readwrite").objectStore(DB_TABLE_NAME);
            idbObjectStore.clear();
        } else if (dbType === "SQL" && !(db instanceof IDBDatabase)) {
            db.transaction(function(t) {
                t.executeSql("DELETE FROM " + DB_TABLE_NAME + " WHERE id > 0", []);
            });
        }
    }
    /**
     * Gets the string of current datetime by "MM/dd HH:mm" format.
     * @private
     * @return {string} The result string
     */
export function getDateTimeString():string {
        const day = new Date();
        return (addLeadingZero(day.getMonth() + 1, 2) + "/" + addLeadingZero(day.getDate(), 2) + " " +
            addLeadingZero(day.getHours(), 2) + ":" + addLeadingZero(day.getMinutes(), 2));
    }
    /**
     * Adds leading zero(s) to a number and make a string of fixed length.
     * @private
     * @param {number} number - A number to make a string.
     * @param {number} digit - The length of the result string.
     * @return {string} The result string
     */
    function addLeadingZero(number:number, digit:number):string {
        const n = number.toString()
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
export function openDB(successCb) {
        var request:IDBOpenDBRequest;

        if (window.indexedDB) {
            dbType = "IDB";

            request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = function(e:Event) {
                alert("Please allow this application to use Indexed DB:" + e);
            };
            request.onsuccess = function() {
                db = request.result;
                if (successCb) {
                    successCb(db);
                }
            };
            // Set a callback function When the Indexed DB is created first,
            // or upgrade is needed
            request.onupgradeneeded = function(e) {
                //@ts-ignore
                db = e.target.result;
                _createTable(db);
            };
        //@ts-ignore WebSQL 
        } else if (window.openDatabase) {
            dbType = "SQL";
            //@ts-ignore WebSQL
            wdb = openDatabase(DB_NAME, DB_VERSION, DB_DISPLAY_NAME, DB_SIZE);
            _createTable(db);
            if (successCb) {
                successCb(db);
            }
        } else {
            console.log("Indexed DB/WebSQL is not supported");
        }
    }

