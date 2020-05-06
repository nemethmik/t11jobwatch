/*
main.js shouldn't have any reference to IDs of the HTML pages
*/

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
/**
 * Extract text info from error object if possible 
 * @param {*} error 
 */
function textFrom(error) {
    if(error.responseJSON) {
        if(error.responseJSON.Message) return error.responseJSON.Message
        if(error.responseJSON.errorText) return error.responseJSON.errorText
    } else return "" + error
}

function showLoadingIndicator(text = "Loading ...") {
    console.log("show indicator")
    $.mobile.loading("show", { text, textVisible: true, theme: "b" })
}
function hideLoadingIndicator(text = "Loading ...") {
    console.log("hide indicator")
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
function bo() { return localStorage.getItem("sqlbroker") + "BO" }
function uq() { return localStorage.getItem("sqlbroker") + "UQ/JobWatch/" }
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
};
