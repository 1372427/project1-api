'use strict';

//Variables for state management
var id = 'index'; //what page is currently showing
var add = false; //add to history?
var qNum = 0; //current question number

//sends the response from server to callback function
var handleResponse = function handleResponse(xhr, callback) {
  if (xhr.getResponseHeader('content-type') !== 'application/json') return console.log("response not in JSON");

  add = true;
  if (callback) callback(xhr);
};

/////////////////////HTML HANDLERS//////////////////////////////////////////
//Alters page to display all subjects returned from server
var handleGetSubjectPg = function handleGetSubjectPg(xhr) {
  //change id -no specific info here
  id = 'index';
  //push to history
  if (add) {
    history.pushState({}, "title", '/getSubject');
  }

  var parsed = JSON.parse(xhr.response).message;
  var body = document.querySelector("#mainBody");

  //clear the page!
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  //add a button for each subject

  var _loop = function _loop(i) {
    var newChild = document.createElement('button');
    newChild.innerHTML = '' + parsed[i];
    newChild.addEventListener('click', function () {
      return sendGet('/getStudySet?subject=' + parsed[i], 'GET', handleGetStudySetPg);
    });
    body.append(newChild);
  };

  for (var i = 0; i < parsed.length; i++) {
    _loop(i);
  }

  //hide and show necessary forms 
  document.querySelector("#subjectForm").classList.remove("hide");
  document.querySelector("#studySetForm").classList.add("hide");
  document.querySelector("#qaForm").classList.add("hide");
};

//show all study sets in given subject as returned from server
var handleGetStudySetPg = function handleGetStudySetPg(xhr) {
  var parsed = JSON.parse(xhr.response).message;
  //change id to say the subject these study sets came from
  id = 'subject-' + parsed.subject;
  //add to history!
  if (add) {
    history.pushState({}, "title", '/getStudySet?subject=' + parsed.subject);
  }

  //clear the page!
  var body = document.querySelector("#mainBody");
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  //add header stating subject
  var header = document.createElement('h1');
  header.innerHTML = '' + parsed.subject;
  body.append(header);

  //add buttons for all the study sets

  var _loop2 = function _loop2(i) {
    var newChild = document.createElement('button');
    newChild.innerHTML = '' + parsed.studySet[i];
    newChild.addEventListener('click', function () {
      return sendGet('/getQA?subject=' + parsed.subject + '&studySet=' + parsed.studySet[i], 'GET', handleGetQAPg);
    });
    body.append(newChild);
  };

  for (var i = 0; i < parsed.studySet.length; i++) {
    _loop2(i);
  }

  //show and hide forms as needed
  document.querySelector("#studySetForm").classList.remove("hide");
  document.querySelector("#subjectForm").classList.add("hide");
  document.querySelector("#qaForm").classList.add("hide");
};

//handles displaying all questions and answers as returned from server
var handleGetQAPg = function handleGetQAPg(xhr) {
  //hide or show all forms (might exit early later, so do this now!)
  document.querySelector("#qaForm").classList.remove("hide");
  document.querySelector("#studySetForm").classList.add("hide");
  document.querySelector("#subjectForm").classList.add("hide");

  //clear the index for which card is showing
  qNum = 0;

  var parsed = JSON.parse(xhr.response).message;

  //change id to show which subjet and study set this page is for
  id = 'subject-' + parsed.subject + '-studySet-' + parsed.studySet;

  //push to history!
  if (add) {
    history.pushState({}, "title", '/getQA?subject=' + parsed.subject + '&studySet=' + parsed.studySet);
  }

  //clear the page
  var body = document.querySelector("#mainBody");
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  //add header for subject and study set
  var header = document.createElement('span');
  header.innerHTML = '<h1>' + parsed.subject + '</h1><h2>' + parsed.studySet + '</h2>';
  body.append(header);

  //check if there are no questions! if so, exit
  var qaLength = Object.keys(parsed.qa).length;
  if (qaLength == 0) {
    var info = document.createElement('span');
    info.innerHTML = '<p>No flashcards yet!</p>';
    body.append(info);
    return;
  }

  //add movement Buttons
  //previous
  var prevButton = document.createElement('button');
  prevButton.innerText = 'Previous';
  prevButton.classList.add('mov');
  prevButton.addEventListener('click', function (e) {
    qNum--;
    if (qNum < 0) qNum = qaLength == 0 ? 0 : qaLength - 1;
    //update card and counter info
    document.querySelector('#indexCard').innerHTML = '<strong>Question: </strong><br/><br/>' + parsed.qa[qNum].q;
    document.querySelector('#qNum').innerText = qNum + 1 + '/' + qaLength;
  });
  body.append(prevButton);

  //counter
  var spn = document.createElement('span');
  spn.id = "qNum";
  spn.innerText = qNum + 1 + '/' + qaLength;
  body.append(spn);

  //next
  var nextButton = document.createElement('button');
  nextButton.innerText = 'Next';
  nextButton.classList.add('mov');
  nextButton.addEventListener('click', function (e) {
    qNum++;
    if (qNum >= qaLength) qNum = 0;
    //update card and counter info
    document.querySelector('#indexCard').innerHTML = '<strong>Question: </strong><br/><br/>' + parsed.qa[qNum].q;
    document.querySelector('#qNum').innerText = qNum + 1 + '/' + qaLength;
  });
  body.append(nextButton);

  // index card
  var newChild = document.createElement('p');
  newChild.id = "indexCard";
  newChild.innerHTML = '<strong>Question: </strong><br/><br/>' + parsed.qa[0].q;
  //flip between question and answer on click
  newChild.addEventListener('click', function (e) {
    var indexCard = document.querySelector('#indexCard');
    if (indexCard.innerText.includes("Question")) {
      indexCard.innerHTML = '<strong>Answer: </strong><br/><br/>' + parsed.qa[qNum].a;
    } else {
      indexCard.innerHTML = '<strong>Question: </strong><br/><br/>' + parsed.qa[qNum].q;
    }
  });
  body.append(newChild);

  //all questions
  var allQheader = document.createElement('span');
  allQheader.innerHTML = '<h2>All Questions</h2><h2>(Click to Edit)</h2>';
  body.append(allQheader);

  //add info for each question and answer

  var _loop3 = function _loop3(i) {
    var newChild = document.createElement('p');
    newChild.innerHTML = 'Question: ' + parsed.qa[i].q + '<br/>Answer: ' + parsed.qa[i].a;
    //on click spawn alerts to edit the selected question and answer
    newChild.addEventListener('click', function (e) {
      var q = prompt("Please edit the question:", '' + parsed.qa[i].q);
      var a = prompt("Please edit the answer:", '' + parsed.qa[i].a);
      if (!q || !a || q === '' || a === '') return;
      var xhr = new XMLHttpRequest();
      xhr.open('post', '/addQA');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Accept', 'application/json');

      xhr.onload = function () {
        handleResponse(xhr, refreshPage);
      };

      var parsed2 = id.split('-');
      var formData = 'subject=' + parsed2[1] + '&studySet=' + parsed2[3] + '&q=' + q + '&a=' + a + '&id=' + i;
      xhr.send(formData);
    });
    body.append(newChild);
  };

  for (var i = 0; i < Object.keys(parsed.qa).length; i++) {
    _loop3(i);
  }
};

//sends a POST request with information passed in as formData 
var sendPost = function sendPost(e, nameForm, formData) {
  var nameAction = nameForm.getAttribute('action');
  var nameMethod = nameForm.getAttribute('method');

  var xhr = new XMLHttpRequest();
  xhr.open(nameMethod, nameAction);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    handleResponse(xhr, refreshPage);
  };

  xhr.send(formData);

  e.preventDefault();
  return false;
};

//generic GET request method
var sendGet = function sendGet(url, methodType, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open(methodType, url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    handleResponse(xhr, callback);
  };

  xhr.send();
  return false;
};

//used to refresh page data when a post request is made
var refreshPage = function refreshPage(xhr) {
  //don't add this to the history! Just refreshing same page!
  add = false;

  //check id variable to know which page is being displayed
  if (id === 'index') sendGet('/getSubject', 'GET', handleGetSubjectPg);

  var parsed = id.split('-');
  if (parsed.length === 2) {
    sendGet('/getStudySet?subject=' + parsed[1], 'GET', handleGetStudySetPg);
  }if (parsed.length === 4) {
    sendGet('/getQA?subject=' + parsed[1] + '&studySet=' + parsed[3], 'GET', handleGetQAPg);
  }
};

/////////////////////INITIALIZATION ////////////////////////////////////

//Init function. Sets up form links
var init = function init() {

  //catch the back/forward button clicks and send to proper page handler
  window.onpopstate = function (e) {
    sendGet(document.location, 'get', function (xhr) {
      add = false;
      if (document.location.href.includes('getSubject')) handleGetSubjectPg(xhr);else if (document.location.href.includes('getStudySet')) handleGetStudySetPg(xhr);else if (document.location.href.includes('getQA')) handleGetQAPg(xhr);
    });
  };

  //hook up different forms to respective post handler functions

  var subjectForm = document.querySelector('#subjectForm');
  var addSubject = function addSubject(e) {
    //get subject info from form input field
    var subjectField = subjectForm.querySelector('#subjectField');
    var formData = 'subject=' + subjectField.value;
    sendSubjectPost(e, subjectForm, formData);
  };
  subjectForm.addEventListener('submit', addSubject);

  var studySetForm = document.querySelector('#studySetForm');
  var addStudySet = function addStudySet(e) {
    //get study set name from form input field
    var studySetField = studySetForm.querySelector('#studySetField');
    //get subject info from page id 
    var subj = id.split('-')[1];
    var formData = 'subject=' + subj + '&studySet=' + studySetField.value;
    sendPost(e, studySetForm, formData);
  };
  studySetForm.addEventListener('submit', addStudySet);

  var qaForm = document.querySelector('#qaForm');
  var addQA = function addQA(e) {
    //get question and answer from form input
    var qField = qaForm.querySelector('#qField');
    var aField = qaForm.querySelector('#aField');
    //get subject and study set from page id
    var parsed = id.split('-');
    var formData = 'subject=' + parsed[1] + '&studySet=' + parsed[3] + '&q=' + qField.value + '&a=' + aField.value;
    sendPost(e, qaForm, formData);
  };
  qaForm.addEventListener('submit', addQA);

  sendGet('/getSubject', 'GET', handleGetSubjectPg);
};

window.onload = init;
