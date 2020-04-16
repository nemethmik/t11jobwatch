/*exported pageController*/
export type PageType = string
export class PageController {
    private pageNow = ""
    private pageNowIndex = -1
    private pageMain = ""
    private pageMainIndex = -1
    private pageList:string[] = []
    private pageHistory:PageType[] = []

    /**
     * Pushes a page to the history list.
     * @private
     * @param {string} page Name of the page to be pushed.
     */
    private pushHistory(page:PageType):void {
        this.pageHistory.push(page);
    }
    /**
     * Pops a page from the history list.
     * @private
     * @return {string} name of the popped page.
     */
    private popHistory():PageType {
        if (this.pageHistory.length > 0) {
            const p = this.pageHistory.pop()
            if(p) return p
        }
        throw new Error("Failed to popHistory - PageHistory is Empty")
    }
    /**
     * Shows selected page and hide all other pages.
     * @private
     * @param {string} page Name of the page to be displayed.
     * @return {boolean} true if the page is successfully displayed.
     */
    private showPage(page:PageType):boolean {
        const destPage = document.querySelector("#" + page)
        if (destPage !== null) {
            for (let i = 0; i < this.pageList.length; i++) {
                const objPage = document.querySelector("#" + this.pageList[i]);
                if(objPage instanceof HTMLElement) objPage.style.display = "none";
            }
            if(destPage instanceof HTMLElement) destPage.style.display = "block";
            this.pageNow = page;
            return true;
        } else {
            throw new Error("ERROR: Page named " + page + " is not exist.")
        }
    }

    /**
     * Adds a new page to the page list.
     * @public
     * @param {string} page The name of a page to be added.
     * @param {number} index The index of a page to be added.
     * @return {boolean} true if the page is successfully added.
     */
    public addPage = (page:PageType, index?:number):boolean => {
        const objPage = document.querySelector("#" + page);
        if (objPage) {
            if (index) {
                this.pageList.splice(index, 0, page);
            } else {
                this.pageList.push(page);
                index = this.pageList.length;
            }
        } else {
            throw new Error("ERROR: Failed to addPage - The page doesn't exist")
        }
        if (this.pageList.length === 1) {
            this.movePage(page) ;
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
    public removePage = (page:PageType):boolean => {
        const pageIndex = this.pageList.indexOf(page);
        if (pageIndex > -1) {
            if (pageIndex === this.pageMainIndex) {
                this.pageMain = "";
                this.pageMainIndex = -1;
            }
            this.pageList.splice(pageIndex, 1);
        } else {
            throw new Error("ERROR: Failed to removePage - The page doesn't exist in pageList")
        }
        return true;
    };
    /**
     * Moves to the selected page.
     * @public
     * @param {string} page The name of a page to be displayed.
     * @return {boolean} true if the page is successfully displayed.
     */
    public movePage = (dest:PageType) => {
        const lastPage = this.pageNow;
        if (this.showPage(dest)) {
            this.pushHistory(lastPage);
            this.pageNow = dest;
            this.pageNowIndex = this.pageList.indexOf(this.pageNow);
        } else {
            return false;
        }
        return true;
    }
    /**
     * Moves back to the last page of the history list.
     * @public
     * @return {boolean} true if the page is successfully displayed.
     */
    public moveBackPage = ():boolean => {
        const beforePage = this.popHistory();
        if (beforePage !== null) {
            this.showPage(beforePage);
            this.pageNow = beforePage;
            this.pageNowIndex = this.pageList.indexOf(this.pageNow);
        } else {
            throw new Error("ERROR: Failed to backPage - popHistory returned null")

        }
        return true;
    }
    /**
     * Moves to the previous page of the page list.
     * @public
     * @return {boolean} true if the page is successfully displayed.
     */
    public movePrevPage = ():boolean => {
        if (this.pageNowIndex > 0) {
            this.movePage(this.pageList[this.pageNowIndex - 1]);
        } else {
            throw new Error("ERROR: Failed to movePrevPage - There is no previous page")
        }
        return true;
    };
    /**
     * Moves to the next page of the page list.
     * @public
     * @return {boolean} true if the page is successfully displayed.
     */
    public moveNextPage = ():boolean => {
        if (this.pageNowIndex < this.pageList.length - 1) {
            this.movePage(this.pageList[this.pageNowIndex + 1]);
        } else {
            throw new Error("ERROR: Failed to moveNextPage - There is no next page")
        }
        return true;
    }
    /**
     * Gets the name of the current page.
     * @public
     * @return {string} The name of the current page.
     */
    public getPageNow = ():PageType => {
        return this.pageNow;
    }
    /**
     * Returns the boolean value whether the current page is the main page or not.
     * @public
     * @return {boolean} true if the current page is the main page.
     */
    public isPageMain = ():boolean => {
        return (this.pageNow === this.pageMain);
    }
    /**
     * Returns the boolean value whether the page is already added to the page list or not.
     * @public
     * @return {boolean} true if the page is already added.
     */
    public isPageExist = (page:PageType):boolean => {
        return (this.pageList.indexOf(page) > -1);
    };
    /**
     * Sets the background image of the page.
     * @param {string} page - Name of the page to be set the background image.
     * @param {string} imagePath - Path of the background image.
     * @public
     */
    public setPageBgImage = (page:PageType, imagePath:string) => {
        if (this.isPageExist(page)) {
            const elmPage = document.querySelector("#" + page);
            if(elmPage instanceof HTMLElement) {
                if (imagePath && typeof imagePath === "string") {
                    elmPage.style.backgroundImage = "url(" + imagePath + ")";
                } else {
                    elmPage.style.backgroundImage = "";
                }
            }
        }
    }
}
