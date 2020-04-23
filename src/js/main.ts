
$(document).one("pageinit",function(){
  console.log("JQM Page init called")
})

window.onload = function () {
  // TODO:: Do your initialization job

  // add eventListener for tizenhwkey
  document.addEventListener('tizenhwkey', function (e) {
    //@ts-ignore //TODO to be fixed later
    if (e.keyName == "back")
      try {
        //@ts-ignore //TODO to be fixed when have Tizen type definitions
        tizen.application.getCurrentApplication().exit();
      } catch (ignore) {
      }
  });

};
