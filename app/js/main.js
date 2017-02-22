var calendarData = [];
var activeBadge = "";
var calendarMonth;
var calendarYear;

//TODO: research this: https://shapeshed.com/writing-cross-platform-node/

//TODO: check to see if chosen folder exists when opening

//TODO: only save files on file change if the file has been modified. (Make a variable for file has been modified on first keystroke?)

//TODO: Help with Keyboard Shortcuts

//TODO: Add help icon '?' beside the settings cog, explaining shortcuts etc. (And autosave)

//TODO: better practice re this: http://stackoverflow.com/questions/3910736/how-to-call-multiple-javascript-functions-in-onclick-event

//TODO: better practice re querySelectorALl() https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll instead of directory1 and directory2 seperate calling - overspecific ID??iii

// solution to get properly formatted dates thanks to @Serhioromano. https://gist.github.com/Serhioromano/5170203
Date.prototype.getMonthFormatted = function() {
	var month = this.getMonth() + 1;
	return month < 10 ? '0' + month : month;
}
Date.prototype.getDateFormatted = function() {
	var date = this.getDate();
	return date < 10 ? '0' + date : date;
}

// set fontsize to start

storage.has('fontSizePreference', function(error, hasKey) {
  if (error) throw error;
  if (hasKey) {
		storage.get('fontSizePreference', function(error, data) {
		  if (error) throw error;
			document.getElementById("textArea").style.fontSize = data.fontSizePreference + 'px';
	    document.getElementById("option" + data.fontSizePreference + "Label").className += " active";
	    // little fix to undo bootstrap js from setting the first button active
	    document.getElementById("option12Label").className += "btn btn-default";
		});
  }
	else {
		storage.set('fontSizePreference', { fontSizePreference: "14" }, function(error) {
			if (error) throw error;
		});
    document.getElementById("option" + 14 + "Label").className += " active";
    document.getElementById("option12Label").className += "btn btn-default";
	}
});


// set current date and open/select the entry for today
var todayRaw = new Date();
var today = (todayRaw.getFullYear() + '-' + todayRaw.getMonthFormatted() + '-' + todayRaw.getDateFormatted());
var currentFileOpen = today + ".txt";

// check for journal path
// then after finding the journal path it goes to load things
// if there is no journal path the user will be prompted to set one

storage.has('journalPath', function(error, hasKey) {
  if (error) throw error;

  if (hasKey) {
		storage.get('journalPath', function(error, data) {
		  if (error) $('#introModal').modal('show');

		  journalDirectory = data.journalPath;

		  if (journalDirectory == "") {
		      $('#introModal').modal('show');
		  }

			// load the calendar for the first time
			var entryList = getEntryList();
			for (i = 0; i < entryList.length; i++) {
			   calendarData.push({"date": entryList[i], "badge": false, "title": "entry"});
			}
			$(document).ready(function () {
			  $("#my-calendar").zabuto_calendar({language: "en", today: true, data: calendarData, action: function() { giveMeDate(this.id); }, action_nav: function() { myNavFunction(this.id); }});
			});
			calendarYear = todayRaw.getFullYear();
			calendarMonth = todayRaw.getMonthFormatted();

			fs.readFile(path.join(journalDirectory, currentFileOpen), (err, fd) => {
			  if (err) {
					;
			  }
			  else {
			    document.getElementById("textArea").value = fd;
			  }
			});

			restingStatusText();
			// All ready to go -- the rest are functions that can be called
		});
  }
	else {
		$("#my-calendar").zabuto_calendar({language: "en", today: true, data: calendarData, action: function() { giveMeDate(this.id); }, action_nav: function() { myNavFunction(this.id); }});
		$('#introModal').modal('show');
	}
});

function refreshCalendar() {
  calendarData = [];
  var entryList = getEntryList();
  for (i = 0; i < entryList.length; i++) {
     calendarData.push({"date": entryList[i], "badge": false, "title": "entry"});
  }
  $("#my-calendar").empty()
  var workingMonth = currentFileOpen[5] + currentFileOpen[6];
	var workingYear = currentFileOpen[0] + currentFileOpen[1] + currentFileOpen[2] + currentFileOpen[3];
  $("#my-calendar").zabuto_calendar({language: "en", today: true, data: calendarData, month: workingMonth, year: workingYear, action: function() { giveMeDate(this.id); }, action_nav: function() { myNavFunction(this.id); }});
  putCurrentBadgeOn();
}

function putCurrentBadgeOn() {
  var plainFile = currentFileOpen.split('.')[0];
	// remove previous badge if one exists
  if (activeBadge !== "" && (activeBadge.split('-')[1] == calendarMonth)) {
		var numberToInsert = activeBadge.split('-')[2];
		if (numberToInsert < 10) {
			numberToInsert = numberToInsert[1];
		}
  	var rp = document.getElementById("my-calendar_" + activeBadge + "_day");
    // todo: this is trowing error cannot read property 'firstchild' of null
		while (rp.firstChild) {
        rp.removeChild(rp.firstChild);
    }
    if (activeBadge !== today) {
      rp.insertAdjacentHTML("afterBegin", numberToInsert);
    }
    else {
      rp.insertAdjacentHTML("afterBegin", "<span class='badge badge-today'>" + numberToInsert + "</span>");
    }
  }
  var rb = document.getElementById("my-calendar_" + plainFile + "_day");
  while (rb.firstChild) {
       rb.removeChild(rb.firstChild);
   }
	 var numberToInsert = plainFile.split('-')[2];
	 if (numberToInsert < 10) {
		 numberToInsert = numberToInsert[1];
	 }
   rb.insertAdjacentHTML("afterBegin", "<span class='badge badge-event'>" + numberToInsert + "</span>");
   activeBadge = plainFile;
}

function giveMeDate(id) {
    var date = $("#" + id).data("date");
    var hasEvent = $("#" + id).data("hasEvent");
    var previousFileOpen = currentFileOpen;
    currentFileOpen = date + '.txt';
    if (document.getElementById("textArea").value !== "") {
      saveEntry(previousFileOpen, document.getElementById("textArea").value);
    }
		// TODO: do something more efficient than trying to delete a file on every change.
    else if (document.getElementById("textArea").value == "" && previousFileOpen !== currentFileOpen)  {
      deleteEntry(previousFileOpen);
    }
    if (hasEvent && currentFileOpen !== previousFileOpen) {
      document.getElementById("textArea").value = readEntry(currentFileOpen);
    }
    else if (currentFileOpen !== previousFileOpen) {
      document.getElementById("textArea").value = "";
    }
    restingStatusText();
    putCurrentBadgeOn();
}

function save() {
    if (document.getElementById("textArea").value !== "") {
      saveEntry(currentFileOpen, document.getElementById("textArea").value);
    }
    else {
      deleteEntry(currentFileOpen);
    }
}

function setFont(size) {
  document.getElementById("textArea").style.fontSize = size + 'px';
	storage.set('fontSizePreference', { fontSizePreference: size }, function(error) {
		if (error) throw error;
	});
}

$('#settingsModal').on('show.bs.modal', function (event) {
  document.getElementById("journal-directory").innerHTML = journalDirectory;
})

$('#helpModal').on('show.bs.modal', function (event) {
  document.getElementById("journal-directory2").innerHTML = journalDirectory;
})

// Automatic save before closing
window.onbeforeunload = function(){
   save();
}

function myNavFunction(id) {
    var to = $("#" + id).data("to");
		calendarYear = to.year;
		calendarMonth = to.month;
}
