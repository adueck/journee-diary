var fs = require('fs');
const storage = require('electron-json-storage');
var path = require('path');
var glob = require('glob');
var app = require('electron').remote;
var dialog = app.dialog;
var journalDirectory = "";
var dialogAnswer = "";


function chooseDirectory() {
  dialogAnswer =  dialog.showOpenDialog(
    { properties: [ 'openDirectory' ] }
  );
  if (typeof dialogAnswer == 'object') {
    if (glob.sync("????-??-??.txt", ({ cwd: dialogAnswer[0].toString() })).length !== glob.sync("*.*", ({ cwd: dialogAnswer[0].toString() })).length) {
      document.getElementById("nonEmptyAlertSpace").innerHTML = "<div class='alert alert-danger alert-dismissible fade in' role=alert> <button type=button class=close data-dismiss=alert aria-label=Close><span aria-hidden=true>&times;</span></button> <h4>Are you sure you want that directoy?</h4> <p>It looks like you've chosen a directory, <code id='directory1'></code> that already has other kinds of files in it. This can still work, but things could get messy for you because you will have a whole bunch of journal entries mixed in with your other files. We would <strong>strongly recommend</strong> you create and choose a <strong>new, empty directory</strong> to hold your journal.</p> <p> <button type=button class='btn btn-danger' data-dismiss='alert' onclick='chooseDirectory()'>Choose Another Directory</button> <button type=button class='btn btn-default' data-dismiss='alert' onclick='chooseDirectoryApplied(dialogAnswer)'>I understand, it's ok</button></p></div>"
      document.getElementById("directory1").innerHTML = dialogAnswer[0];
    }
    else {
      chooseDirectoryApplied(dialogAnswer);
    }
  }
}

function chooseDirectoryApplied(directoryChosen) {
  journalDirectory = directoryChosen[0];

  storage.set('journalPath', { journalPath: journalDirectory }, function(error) {
    if (error) throw error;
    document.getElementById("journal-directory").innerHTML = journalDirectory;
    document.getElementById("journal-directory2").innerHTML = journalDirectory;
    refreshCalendar();
  });
}

function initialChooseDirectory() {
  dialogAnswer =  dialog.showOpenDialog(
    { properties: [ 'openDirectory' ] }
  );
  if (typeof dialogAnswer == 'object') {
    if (glob.sync("????-??-??.txt", ({ cwd: dialogAnswer[0].toString() })).length !== glob.sync("*.*", ({ cwd: dialogAnswer[0].toString() })).length) {
      document.getElementById("nonEmptyAlertSpaceStart").innerHTML = "<div class='alert alert-danger alert-dismissible fade in' role=alert> <button type=button class=close data-dismiss=alert aria-label=Close><span aria-hidden=true>&times;</span></button> <h4>Are you sure you want that directoy?</h4> <p>It looks like you've chosen a directory, <code id='directory2'></code> that already has other kinds of files in it. This will still work, but things could get messy for you because you will have a whole bunch of journal entries mixed in with your other files. We would <strong>strongly recommend</strong> you create and choose a <strong>new, empty directory</strong> to hold your journal.</p> <p> <button type=button class='btn btn-danger' data-dismiss='alert' onclick='initialChooseDirectory()'>Choose Another Directory</button> <button type=button class='btn btn-default' data-dismiss='alert' onclick='$(\x22#introModal\x22).modal(\x22hide\x22);chooseDirectoryApplied(dialogAnswer);alert(journalDirectory);'>I understand, it's ok</button></p></div>"
      document.getElementById("directory2").innerHTML = dialogAnswer[0];
    }
    else {
      $('#introModal').modal('hide')
      document.getElementById("textArea").focus();
      chooseDirectoryApplied(dialogAnswer);
    }
  }
}

function getEntryList() {
  var entryList = glob.sync("????-??-??.txt", ({ cwd: journalDirectory.toString() }));
  for (i = 0; i < entryList.length; i++) {
    entryList[i] = entryList[i].replace(/\.[^/.]+$/, "");
  }
  return entryList;
}

function readEntry(filename) {
  return fs.readFileSync(path.join(journalDirectory, filename), 'utf8');
}

function saveEntry(filename, content) {
  fs.writeFile(path.join(journalDirectory, filename), content, (err, fd) => {
    if (err) {
      document.getElementById("below-text").innerHTML = "ERROR: Unable to save " + journalDirectory + currentFileOpen;
    }
    else {
      document.getElementById("below-text").innerHTML = journalDirectory + currentFileOpen + " saved";
      setTimeout(restingStatusText, 3500);
      refreshCalendar();
    }
  });
}

function deleteEntry(filename) {
  fs.unlink(path.join(journalDirectory, filename), (err, fd) => {
    if (err) {
      ;
    }
    else {
      document.getElementById("below-text").innerHTML = journalDirectory + currentFileOpen + " deleted";
      setTimeout(restingStatusText, 3500);
      refreshCalendar();
    }
  });
}

function restingStatusText () {
  document.getElementById("below-text").innerHTML = currentFileOpen + ' - CTRL+S to Save';
}
