///<reference path="../../node_modules/@types/jquery/index.d.ts"/>
///<reference path="../../node_modules/@types/jquerymobile/index.d.ts"/>
$(document).one("pageinit", function () {
  console.log("JQM page initialized")
})
// Tizen specific section
window.onload = function () {
  document.addEventListener('tizenhwkey', function (e) {
    //@ts-ignore //TODO Fix it later
    if (e.hasOwnProperty("keyName") && e.keyName == "back")
      try {
        //@ts-ignore //TODO: I'll sort it out later
        tizen.application.getCurrentApplication().exit();
      } catch (ignore) {
      }
  });
};
