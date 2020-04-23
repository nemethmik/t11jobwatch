(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
$(document).one("pageinit", function () {
    console.log("JQM Page init called");
});
window.onload = function () {
    // TODO:: Do your initialization job
    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function (e) {
        //@ts-ignore //TODO to be fixed later
        if (e.keyName == "back")
            try {
                //@ts-ignore //TODO to be fixed when have Tizen type definitions
                tizen.application.getCurrentApplication().exit();
            }
            catch (ignore) {
            }
    });
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNDQSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBQztJQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUE7QUFDckMsQ0FBQyxDQUFDLENBQUE7QUFFRixNQUFNLENBQUMsTUFBTSxHQUFHO0lBQ2Qsb0NBQW9DO0lBRXBDLG1DQUFtQztJQUNuQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQztRQUNqRCxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLE1BQU07WUFDckIsSUFBSTtnQkFDRixnRUFBZ0U7Z0JBQ2hFLEtBQUssQ0FBQyxXQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNsRDtZQUFDLE9BQU8sTUFBTSxFQUFFO2FBQ2hCO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFTCxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcbiQoZG9jdW1lbnQpLm9uZShcInBhZ2Vpbml0XCIsZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2coXCJKUU0gUGFnZSBpbml0IGNhbGxlZFwiKVxufSlcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVE9ETzo6IERvIHlvdXIgaW5pdGlhbGl6YXRpb24gam9iXG5cbiAgLy8gYWRkIGV2ZW50TGlzdGVuZXIgZm9yIHRpemVuaHdrZXlcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndGl6ZW5od2tleScsIGZ1bmN0aW9uIChlKSB7XG4gICAgLy9AdHMtaWdub3JlIC8vVE9ETyB0byBiZSBmaXhlZCBsYXRlclxuICAgIGlmIChlLmtleU5hbWUgPT0gXCJiYWNrXCIpXG4gICAgICB0cnkge1xuICAgICAgICAvL0B0cy1pZ25vcmUgLy9UT0RPIHRvIGJlIGZpeGVkIHdoZW4gaGF2ZSBUaXplbiB0eXBlIGRlZmluaXRpb25zXG4gICAgICAgIHRpemVuLmFwcGxpY2F0aW9uLmdldEN1cnJlbnRBcHBsaWNhdGlvbigpLmV4aXQoKTtcbiAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge1xuICAgICAgfVxuICB9KTtcblxufTtcbiJdfQ==
