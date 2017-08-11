document.addEventListener("keydown", function(e) {
      if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        save();
      }
    }, false);

$("#searchArea").on('keyup', function (e) {
    if (e.keyCode == 13) {
        searchJournal();
    }
});

// TODO  add ctrl - w close shortcut
