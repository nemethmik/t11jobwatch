(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
///<reference path="../../node_modules/@types/jquery/index.d.ts"/>
///<reference path="../../node_modules/@types/jquerymobile/index.d.ts"/>
$(document).one("pageinit", function () {
    console.log("JQM page initialized");
});
// Tizen specific section
window.onload = function () {
    document.addEventListener('tizenhwkey', function (e) {
        //@ts-ignore //TODO Fix it later
        if (e.hasOwnProperty("keyName") && e.keyName == "back")
            try {
                //@ts-ignore //TODO: I'll sort it out later
                tizen.application.getCurrentApplication().exit();
            }
            catch (ignore) {
            }
    });
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBLGtFQUFrRTtBQUNsRSx3RUFBd0U7QUFDeEUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUU7SUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ3JDLENBQUMsQ0FBQyxDQUFBO0FBQ0YseUJBQXlCO0FBQ3pCLE1BQU0sQ0FBQyxNQUFNLEdBQUc7SUFDZCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQztRQUNqRCxnQ0FBZ0M7UUFDaEMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksTUFBTTtZQUNwRCxJQUFJO2dCQUNGLDJDQUEyQztnQkFDM0MsS0FBSyxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2xEO1lBQUMsT0FBTyxNQUFNLEVBQUU7YUFDaEI7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL25vZGVfbW9kdWxlcy9AdHlwZXMvanF1ZXJ5L2luZGV4LmQudHNcIi8+XG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ub2RlX21vZHVsZXMvQHR5cGVzL2pxdWVyeW1vYmlsZS9pbmRleC5kLnRzXCIvPlxuJChkb2N1bWVudCkub25lKFwicGFnZWluaXRcIiwgZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZyhcIkpRTSBwYWdlIGluaXRpYWxpemVkXCIpXG59KVxuLy8gVGl6ZW4gc3BlY2lmaWMgc2VjdGlvblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGl6ZW5od2tleScsIGZ1bmN0aW9uIChlKSB7XG4gICAgLy9AdHMtaWdub3JlIC8vVE9ETyBGaXggaXQgbGF0ZXJcbiAgICBpZiAoZS5oYXNPd25Qcm9wZXJ0eShcImtleU5hbWVcIikgJiYgZS5rZXlOYW1lID09IFwiYmFja1wiKVxuICAgICAgdHJ5IHtcbiAgICAgICAgLy9AdHMtaWdub3JlIC8vVE9ETzogSSdsbCBzb3J0IGl0IG91dCBsYXRlclxuICAgICAgICB0aXplbi5hcHBsaWNhdGlvbi5nZXRDdXJyZW50QXBwbGljYXRpb24oKS5leGl0KCk7XG4gICAgICB9IGNhdGNoIChpZ25vcmUpIHtcbiAgICAgIH1cbiAgfSk7XG59O1xuIl19
