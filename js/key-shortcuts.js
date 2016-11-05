document.addEventListener("keydown", function(e) {
      if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        save();
      }
    }, false);

// TODO  add ctrl - w close shortcut
// TODO  add ctrl - m minimize shortcut


// document.addEventListener("keydown", function(e) {
//       if (e.keyCode == 37 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
//         e.preventDefault();
//         // todo: a function toPreviousDay that changes the current day, saves/deletes, refreshes calendar, and then puts current badge on
//       }
//     }, false);
//
// document.addEventListener("keydown", function(e) {
//       if (e.keyCode == 39 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
//         e.preventDefault();
//         // todo: a function toNextDay that changes the current day, saves/deletes, refreshes calendar, and then puts current badge on
//       }
//     }, false);
