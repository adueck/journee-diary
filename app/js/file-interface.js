var fs = require('fs');
const storage = require('electron-json-storage');
var path = require('path');
var app = require('electron').remote;
var moment = require('moment');
var async = require('async');
var dialog = app.dialog;
var journalDirectory = "";
var dialogAnswer = "";

// TODO: remove the use of the first RegExp

var datePattern = new RegExp(/^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])/);

var datePatternWithExt = new RegExp(/^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])\.txt/);


function checkIfDirectoryIsClean(dir) {
  // TODO: Error if there's no journal here!!!
  var entryList = fs.readdirSync(dir);
  for (var i=0; i < entryList.length; i++) {
    // entryList[i] = entryList[i].replace(/\.[^/.]+$/, "");
    if (datePatternWithExt.test(entryList[i]) === false) {
      return false;
      break;
    }
  }
}

function chooseDirectory() {
  dialogAnswer =  dialog.showOpenDialog(
    { properties: [ 'openDirectory' ] }
  );
  if (typeof dialogAnswer == 'object') {
    if (checkIfDirectoryIsClean(dialogAnswer[0].toString()) === false) {
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
    if (checkIfDirectoryIsClean(dialogAnswer[0].toString()) === false) {
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
  // TODO: Error if there's no journal here!!!
  var entryList = fs.readdirSync(journalDirectory);
  for (var i=0; i < entryList.length; i++) {
    entryList[i] = entryList[i].replace(/\.[^/.]+$/, "");
    if (datePattern.test(entryList[i]) === false) {
      entryList.splice(i, 1);
      i--;
    }
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

function getIndicesOf(searchStr, str) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function printSearchResults(file, buffer, indices, searchLength) {
  // var buffer = buffer.toString();
  var snippetLength = 72;
  var halfSnippet = snippetLength / 2;
  var insertedFile = "'" + file + "'";
  var niceDate = moment(file).format('MMMM D[,] YYYY');
  function printOut(html) {
    document.getElementById("searchResultsDisplay").insertAdjacentHTML("beforeend", html);
  }
  printOut("<h5>" + niceDate + "</h5>");
  for (var i=0; i < indices.length; i++) {
    if (indices[i] < snippetLength && indices[i] !== 0) {
      printOut("<a class=\"list-group-item\" href=\"#\" onclick=\"fromSearchDate(" + insertedFile + ")\;\">" + buffer.substr(0, indices[i]) + "<strong>" + buffer.substr(indices[i], searchLength) + "</strong>" + buffer.substr(indices[i] + searchLength, snippetLength-indices[i]) + "</a>");
    }
    else if (indices[i] == 0) {
      printOut("<a class=\"list-group-item\" href=\"#\" onclick=\"fromSearchDate(" + insertedFile + ")\;\"><strong>" + buffer.substr(indices[i], searchLength) + "</strong>" + buffer.substr(indices[i] + searchLength, snippetLength) + "</a>");
    }
    else {
      printOut("<a class=\"list-group-item\" href=\"#\" onclick=\"fromSearchDate(" + insertedFile + ")\;\">" + buffer.substr(indices[i] - halfSnippet, halfSnippet) + "<strong>" + buffer.substr(indices[i], searchLength) + "</strong>" + buffer.substr(indices[i] + searchLength, halfSnippet) + "</a>");
    }
  }
}

function printEmptySearchResults() {
  function printOut(html) {
    document.getElementById("searchResultsBody").insertAdjacentHTML("beforeend", html);
  }
  printOut("<h5>Nothing found...</h5>");
}

function searchJournal() {
  var searchString;
  var matchCount = 0;
  var returnedResult = false
  if (document.getElementById("searchArea").value !== "") {
    document.getElementById("searchResultsBody").innerHTML = "<div class='list-group' id='searchResultsDisplay'></ul></div>";
    $('#searchModal').modal('show');
    searchString = document.getElementById("searchArea").value.toLowerCase();
    searchStrLen = searchString.length;
    // Loop through list of files (getEntryList)
    var entryList = getEntryList();
    // TODO: find a way to see if it doesn't return any results using the commented async version.... async issue
    // for (let file of entryList) {
    //   fs.readFile(path.join(journalDirectory, (file + ".txt")), function (err, data) {
    //     if (err) throw err;
    //       var startIndex = 0, index, indices = [];
    //       data = data.toString().toLowerCase();
    //       while ((index = data.indexOf(searchString, startIndex)) > -1) {
    //           indices.push(index);
    //           startIndex = index + searchStrLen;
    //       }
    //       if (indices.length != 0) {
    //         printSearchResults(file, data, indices, searchString.length);
    //         returnedResult = true;
    //       }
    //   });
    for (let file of entryList) {
      var data = fs.readFileSync(path.join(journalDirectory, (file + ".txt")));
      var startIndex = 0, index, indices = [];
      data = data.toString().toLowerCase();
      while ((index = data.indexOf(searchString, startIndex)) > -1) {
          indices.push(index);
          startIndex = index + searchStrLen;
      }
      if (indices.length != 0) {
        printSearchResults(file, data, indices, searchString.length);
        returnedResult = true;
      }
    }
    if (returnedResult === false) {
      printEmptySearchResults();
    }
  }
}
