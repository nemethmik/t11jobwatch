function _trimText(text:string | null, maxLength:number) {
    let trimmedString;
    if (text && text.length > maxLength) {
        trimmedString = text.substring(0, maxLength - 3) + "...";
    } else {
        trimmedString = text;
    }
    return trimmedString;
}

export interface INewsItem {
    title: string | null,
    link: string | null,
}
type TNewsItemCallbackFunction = (newsArray:INewsItem[]) => void
export const fetchNews = (url:string, callback:TNewsItemCallbackFunction):void => {
    const XML_METHOD = "GET"
    const MSG_ERR_NODATA = "There is no news from tizen.org"
    const MSG_ERR_NOTCONNECTED = "Connection aborted. Check your internet connection."
    let xmlhttp:XMLHttpRequest | null = new XMLHttpRequest();
    let xmlDoc;
    let dataItem:HTMLCollectionOf<Element>;

    xmlhttp.open(XML_METHOD, url, false);
    xmlhttp.onreadystatechange = function _requestCompleted():void {
        if (xmlhttp && xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            xmlDoc = xmlhttp.responseXML;
            if(xmlDoc) dataItem = xmlDoc.getElementsByTagName("item");
            if (dataItem.length > 0) {
                const NUM_MAX_NEWS = 5, NUM_MAX_LENGTH_SUBJECT = 64
                let lengthNews = 0;
                let arrayNews:INewsItem[] = [];
                lengthNews = (dataItem.length > NUM_MAX_NEWS) ? NUM_MAX_NEWS : dataItem.length;
                for (let i = 0; i < lengthNews; i++) {
                    arrayNews.push({
                        title: dataItem[i].getElementsByTagName("title")[0].childNodes[0].nodeValue,
                        link: dataItem[i].getElementsByTagName("link")[0].childNodes[0].nodeValue,
                    });
                    arrayNews[i].title = _trimText(arrayNews[i].title, NUM_MAX_LENGTH_SUBJECT)
                }
                callback(arrayNews)
            } else {
                throw new Error(MSG_ERR_NODATA)
            }
            xmlhttp = null
        } else {
            throw new Error(MSG_ERR_NOTCONNECTED)
        }
    };
    xmlhttp.send()
}
