import {fetchNews,INewsItem} from "./fetchNews"
import NewsRepo from "./newsRepo"

let globalNewsRepo = new NewsRepo()

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

function addTextElement(objElm:Element | null, textClass:string, textContent:string | null) {
    var newElm = document.createElement("p");
    newElm.className = textClass;
    if(textContent) newElm.appendChild(document.createTextNode(textContent));
    if(objElm) objElm.appendChild(newElm);
}

const areaNews = () =>  document.querySelector("#area-news")
const areaPageNum = () => document.querySelector("#area-pagenum")
function addSubject(text:string | null) {addTextElement(areaNews(),"subject",text)}
function showNews(newsRepo:NewsRepo):void {
    const objNews = areaNews(), objPagenum = areaPageNum()
    emptyElement(objNews);
    addSubject(newsRepo.arrayNews[newsRepo.indexDisplay].title);
    emptyElement(objPagenum);
    addTextElement(objPagenum, "pagenum", "Page " + (newsRepo.indexDisplay + 1) + "/" + newsRepo.arrayNews.length);
}

function showNextNews() {
    const lengthNews = globalNewsRepo.arrayNews.length;
    if (lengthNews > 0) {
        globalNewsRepo.indexDisplay = (globalNewsRepo.indexDisplay + 1) % lengthNews;
        showNews(globalNewsRepo);
    }
}

function getDataFromXML() {
    const XML_ADDRESS = "https://www.tizen.org/blogs/feed"
    globalNewsRepo.indexDisplay = 0;
    try {
        fetchNews(XML_ADDRESS,(localArrayNews) => {
            globalNewsRepo.arrayNews = localArrayNews; //Store news data in global repository
            emptyElement(areaNews());
            showNews(globalNewsRepo);
        })
    } catch(e) {
        if(e instanceof Error) addSubject(e.message)
        else addSubject(e)
    }
}

function setDefaultEvents():void {
    //@ts-ignore This is a Tizen device specific event and should be defined
    document.addEventListener("tizenhwkey", keyEventHandler)
    const an = areaNews()
    if(an) an.addEventListener("click", showNextNews)
}

function init():void {
    setDefaultEvents()
    getDataFromXML()
}

window.onload = init
