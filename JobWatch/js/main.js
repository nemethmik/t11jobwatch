/*
main.js shouldn't have any reference to IDs of the HTML pages
*/
function deleteAllPropsExcept(obj,keepProps) {
    for(const k in obj) {
        if(!keepProps.includes(k) && obj.hasOwnProperty(k)) delete obj[k]
    }
}
function ifNaN(n,replacementValue) {
    return isNaN(n) ? replacementValue : n
}

function getFloat(anything) {
    return ifNaN(parseFloat(anything),0)
}

function resIcon(resType) {
    return resType === 'M' ? 'gear' : 'user'
}
function formatDate(dt) {
    const d = new Date(dt)
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`
}
function formatTime(intTime) {
    let t = "0000" + intTime
    t = t.substring(t.length - 4,t.length)
    t = t.substring(0,2) + ":" + t.substring(2,4)
    //console.log(t)
    return t
}
function sapTimeToMinutes(sapTime) {
    let t = "0000" + sapTime
    t = t.substring(t.length - 4,t.length)
    const h = parseInt(t.substring(0,2))
    const m = parseInt(t.substring(2,4))
    return (h * 60) + m
}
function minuteDiff(date1,date2) {
    const diffMillis = Math.abs(date2 - date1)
    return Math.ceil(diffMillis/(1000 * 60))
}
function formatMinDiff(minutes) {
    const quot = Math.floor(minutes/60)
    const rem = minutes % 60
    return `${quot}:${rem}` 
}
function sapDTToDate(dateStr,timeStr) {
    const sd = new Date(dateStr)
    const bt = sapTimeToMinutes(timeStr)
    sd.setMinutes(bt)
    return sd
}
/**
 * Extract text info from error object if possible 
 * @param {*} error 
 */
function textFrom(error) {
    if(error.responseJSON) {
        if(error.responseJSON.Message) return error.responseJSON.Message
        if(error.responseJSON.errorText) return error.responseJSON.errorText
    } else if (error.Message) {
        return error.Message
    } else if (error.errorText) {
        return error.errorText
    } else return "" + error
}

function showLoadingIndicator(text = "Loading ...") {
    // console.log("show indicator")
    $.mobile.loading("show", { text, textVisible: true, theme: "b" })
}
function hideLoadingIndicator(text = "Loading ...") {
    // console.log("hide indicator")
    $.mobile.loading("hide")
}
//This is much better, since then interactive programming is a lot more simpler since 
//the status of the app is saved in the local store
function saveServiceURLToLocalStore(bHttp,sHostName,nPort,sServiceName) {
    let url = (bHttp ? "http" : "https") + "://"
    url += sHostName + ":" + nPort + "/"
    url += sServiceName + "/api/"
    console.log(url)
    localStorage.setItem("sqlbroker", url)
}
function sql() { return localStorage.getItem("sqlbroker") + "SQL" }
function bo() { return localStorage.getItem("sqlbroker") + "BO/" }
function uq() { return localStorage.getItem("sqlbroker") + "UQ/JobWatch/" }
function mr() { return localStorage.getItem("sqlbroker") + "MR/" }

async function SQLBroker(SQL) {
    try {
        showLoadingIndicator()
        return await $.ajax({
            url: sql(), type: "POST", dataType: "json",
            contentType: "application/json", processData: false,
            data: JSON.stringify({ SQL })
        })
    } finally {
        hideLoadingIndicator()
    }
}
async function userQuery(name, p0, p1, p2, p3, p4, p5, p6, p7, p8, p9) {
    try {
        // console.log("Show loading indicator for " + name)
        showLoadingIndicator()
        // This jQuery get had some issues, so I changed over to fetch
        // return await $.get(uq() + name, { p0, p1, p2, p3, p4, p5, p6, p7, p7, p9 })
        const uri = encodeURI(uq() + name + "?" + (p0?"p0=" + p0 : "")
        + (p1?"&p1=" + p1 : "") + (p2?"&p2=" + p2 : ""))
        console.log(uri)
        let response = await fetch(uri)
        let data = await response.json()
        return data
    } catch (error) {
        throw error
    } finally {
        // console.log("Hide loading indicator for " + name)
        hideLoadingIndicator()
    }
}

function userQueryReg(onData, onError, name, p0, p1, p2, p3, p4, p5, p6, p7, p8, p9) {
    // console.log("Show loading indicator for " + name)
    showLoadingIndicator()
    // This jQuery get had some issues, so I changed over to fetch
    // return await $.get(uq() + name, { p0, p1, p2, p3, p4, p5, p6, p7, p7, p9 })
    const uri = encodeURI(uq() + name + "?" + (p0?"p0=" + p0 : "")
    + (p1?"&p1=" + p1 : "") + (p2?"&p2=" + p2 : ""))
    console.log(uri)
    let response = fetch(uri)
        .catch(error => onError(error))
        .then(r => {
            if(r.status === 400) {
                return r.json()
            } else return r.json
        })
        .then(data => onData(data))
        .finally(hideLoadingIndicator())
}


async function sleepAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
function saveUserToLocalStore(userDetails) {
    localStorage.setItem("userDetails", JSON.stringify(userDetails))
}
function getUserDetailsFromLocalStore() {
    return JSON.parse(localStorage.getItem("userDetails"))
}
function saveResCodeToLocalStore(resCode) {
    localStorage.setItem("resCode", resCode)
}
function getResCodeFromLocalStore() {
    return localStorage.getItem("resCode")
}
function saveOperationDetailsToLocalStore(opDetails) {
    localStorage.setItem("operationDetails", JSON.stringify(opDetails))
}
function getOperationDetailsFromLocalStore() {
    return JSON.parse(localStorage.getItem("operationDetails"))
}
function saveRunningJobToLocalStore(data) {
    localStorage.setItem("RunningJob", JSON.stringify(data))
}
function getRunningJobFromLocalStore() {
    return JSON.parse(localStorage.getItem("RunningJob"))
}
function saveProductionOrderToLocalStore(data) {
    localStorage.setItem("ProductionOrder", JSON.stringify(data))
}
function getProductionOrderFromLocalStore() {
    return JSON.parse(localStorage.getItem("ProductionOrder"))
}

function newActivity(profile, docEntry,details,durationSeconds,userid,status,lineNum) {
    if(!docEntry) throw new Error("No docEntry defined for newActivity")
    if(!lineNum) throw new Error("No lineNum defined for newActivity")
    return {
        connection: { Profile: profile }, //"MikiTest"
        bo: {
            Activity: {
                // "ActivityCode": "15",
                Subject: "-1",
                "DocType": "202",
                "DocEntry": docEntry,
                "Priority": "pr_Normal",
                "Details": details, //"Operation Started for operation 155-4",
                "Activity": "cn_Task",
                "ActivityType": "-1",
                "Duration": durationSeconds,
                "DurationType": "du_Seconds",
                "HandledBy": userid, //"22",
                "U_LineNum": lineNum, //"5",
                "Status": status, // -3 completed, -2 not started, "1",
                "Notes": `Created by JobWatch for user ${userid}`,
            }
        }
    }
}

function makeActivityObjectForUpdate(profile, activityCode, durationSeconds, status) {
    return {
        connection: { Profile: profile }, //"MikiTest"
        bo: {
            Activity: {
                "ActivityCode": activityCode,
                "Duration": durationSeconds,
                "DurationType": "du_Seconds",
                "Status": status, // -3 completed, -2 not started, "1",
            }
        }
    }
}

function newMR(profile,reqType,boName,boReq) {
    const mr = {
        connection: { Profile: profile }, //"MikiTest"
        requests: []
    }
    if(boReq) addBoReqToMR(mr,reqType,boName,boReq)
    return mr
}

function addBoReqToMR(mr,reqType,boName,boReq,boId) {
    if(!boReq) throw new Error("No boReq defined for addBoReqToMR of " + boName)
    mr.requests.push({
        reqType: reqType,
        boName: boName,
        boId: boId,
        boReq: boReq
    })
    return mr
}

function newIssueForProd(profile, ref2, comments, jrnlMemo, docEntry, lineNum, quantity, whsCode) {
    const ifpReq = {
        connection: { Profile:profile}, 
        "bo": {
            "BOM": {
                "BO": {
                    "AdmInfo": {
                        "Object": "60"
                    },
                    "OIGE": {
                        "row": {
                            "Ref2": ref2,
                            "Comments": comments,
                            "JrnlMemo": jrnlMemo,
                        }
                    },
                    "IGE1": {
                        "row": []
                    }
                }
            }
        }
    }
    addLineToIssueForProd(ifpReq,docEntry, lineNum, quantity, whsCode)
    return ifpReq
}
function addLineToIssueForProd(ifpReq,docEntry, lineNum, quantity, whsCode) {
    ifpReq.bo.BOM.BO.IGE1.row.push({
        "BaseRef": docEntry,
        "BaseType": "202",
        "BaseEntry": docEntry,
        "BaseLine": lineNum,
        "Quantity": quantity,
        "WhsCode": whsCode,
    })
    return ifpReq
}



window.onload = function () {
    // TODO:: Do your initialization job
    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function (e) {
        if (e.keyName == "back")
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {
            }
    });
    // Sample code
    // var textbox = document.querySelector('.contents');
    // textbox.addEventListener("click", function(){
    // 	box = document.querySelector('#textbox');
    // 	box.innerHTML = box.innerHTML == "Basic" ? "Sample" : "Basic";
    // });    
}
