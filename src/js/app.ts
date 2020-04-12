var XML_ADDRESS = "https://www.tizen.org/blogs/feed",
    XML_METHOD = "GET",
    MSG_ERR_NODATA = "There is no news from tizen.org",
    MSG_ERR_NOTCONNECTED = "Connection aborted. Check your internet connection.",
    NUM_MAX_NEWS = 5,
    NUM_MAX_LENGTH_SUBJECT = 64,
    arrayNews:any = [],
    indexDisplay = 0,
    lengthNews = 0;

function emptyElement(elm:Element | null) {
    if(elm) while (elm.firstChild) {
        elm.removeChild(elm.firstChild);
    }
    return elm
}

//@ts-ignore The event is tiyen specific
function keyEventHandler(event:any) {
    if (event.keyName === "back") {
        try {
            //@ts-ignore Tizen declaration should be added
            if(tizen) tizen.application.getCurrentApplication().exit();
        } catch (ignore) {}
    }
}

function addTextElement(objElm:Element | null, textClass:string, textContent:string) {
    var newElm = document.createElement("p");
    newElm.className = textClass;
    newElm.appendChild(document.createTextNode(textContent));
    if(objElm) objElm.appendChild(newElm);
}

function trimText(text:string, maxLength:number) {
    var trimmedString;
    if (text.length > maxLength) {
        trimmedString = text.substring(0, maxLength - 3) + "...";
    } else {
        trimmedString = text;
    }
    return trimmedString;
}

function showNews(index:number):void {
    var objNews = document.querySelector("#area-news"),
        objPagenum = document.querySelector("#area-pagenum");
    emptyElement(objNews);
    addTextElement(objNews, "subject", arrayNews[index].title);
    emptyElement(objPagenum);
    addTextElement(objPagenum, "pagenum", "Page " + (index + 1) + "/" + lengthNews);
}

function showNextNews() {
    if (lengthNews > 0) {
        indexDisplay = (indexDisplay + 1) % lengthNews;
        showNews(indexDisplay);
    }
}

function getDataFromXML() {
    var objNews = document.querySelector("#area-news"),
        xmlhttp:XMLHttpRequest | null = new XMLHttpRequest(),
        xmlDoc,
        dataItem:any,
        i;
    arrayNews = [];
    lengthNews = 0;
    indexDisplay = 0;
    emptyElement(objNews);
    xmlhttp.open(XML_METHOD, XML_ADDRESS, false);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp && xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            xmlDoc = xmlhttp.responseXML;
            if(xmlDoc) dataItem = xmlDoc.getElementsByTagName("item");
            if (dataItem.length > 0) {
                lengthNews = (dataItem.length > NUM_MAX_NEWS) ? NUM_MAX_NEWS : dataItem.length;
                for (i = 0; i < lengthNews; i++) {
                    arrayNews.push({
                        title: dataItem[i].getElementsByTagName("title")[0].childNodes[0].nodeValue,
                        link: dataItem[i].getElementsByTagName("link")[0].childNodes[0].nodeValue
                    });
                    arrayNews[i].title = trimText(arrayNews[i].title, NUM_MAX_LENGTH_SUBJECT);
                }
                showNews(indexDisplay);
            } else {
                addTextElement(objNews, "subject", MSG_ERR_NODATA);
            }
            xmlhttp = null;
        } else {
            addTextElement(objNews, "subject", MSG_ERR_NOTCONNECTED);
        }
    };
    xmlhttp.send()
}

function setDefaultEvents():void {
    //@ts-ignore This is a Tizen device specific event and should be defined
    document.addEventListener("tizenhwkey", keyEventHandler)
    const an = document.querySelector("#area-news")
    if(an) an.addEventListener("click", showNextNews)
}

function init():void {
    setDefaultEvents()
    getDataFromXML()
}

window.onload = init
