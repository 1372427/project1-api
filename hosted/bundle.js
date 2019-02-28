"use strict";
'use strict';

var id = 'index';
var add = false;
var qNum = 0;

var handleResponse = function handleResponse(xhr, callback) {
  add = true;
  if (callback) callback(xhr);

  /*
  //TODO: REMOVE
  switch (xhr.status) {
    case 200:
      break;
    case 201:
      break;
    case 204:
    break;
    case 404:
      break;
    case 400:
      break;
    default:
      break;
    }
    */
};

var handleGetSubjectPg = function handleGetSubjectPg(xhr) {
  id = 'index';
  if (add) {
    history.pushState({}, "title", '/getSubject');
  }
  var parsed = JSON.parse(xhr.response).message;
  var body = document.querySelector("#mainBody");
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

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

  document.querySelector("#subjectForm").classList.remove("hide");
  document.querySelector("#studySetForm").classList.add("hide");
  document.querySelector("#qaForm").classList.add("hide");
};

var refreshPage = function refreshPage(xhr) {
  add = false;
  if (id === 'index') sendGet('/getSubject', 'GET', handleGetSubjectPg);
  var parsed = id.split('-');
  if (parsed.length === 2) {
    sendGet('/getStudySet?subject=' + parsed[1], 'GET', handleGetStudySetPg);
  }if (parsed.length === 4) {
    sendGet('/getQA?subject=' + parsed[1] + '&studySet=' + parsed[3], 'GET', handleGetQAPg);
  }
};

var handleGetStudySetPg = function handleGetStudySetPg(xhr) {
  var parsed = JSON.parse(xhr.response).message;
  id = 'subject-' + parsed.subject;
  if (add) {
    history.pushState({}, "title", '/getStudySet?subject=' + parsed.subject);
  }
  var body = document.querySelector("#mainBody");
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }
  var header = document.createElement('h1');
  header.innerHTML = '' + parsed.subject;
  body.append(header);

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

  document.querySelector("#studySetForm").classList.remove("hide");
  document.querySelector("#subjectForm").classList.add("hide");
  document.querySelector("#qaForm").classList.add("hide");
};

var handleGetQAPg = function handleGetQAPg(xhr) {

  qNum = 0;
  var parsed = JSON.parse(xhr.response).message;
  id = 'subject-' + parsed.subject + '-studySet-' + parsed.studySet;
  if (add) {
    history.pushState({}, "title", '/getQA?subject=' + parsed.subject + '&studySet=' + parsed.studySet);
  }

  var body = document.querySelector("#mainBody");
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  var header = document.createElement('span');
  header.innerHTML = '<h1>' + parsed.subject + '</h1><h2>' + parsed.studySet + '</h2>';
  body.append(header);

  var qaLength = Object.keys(parsed.qa).length;
  //Movement Buttons
  var prevButton = document.createElement('button');
  prevButton.innerText = 'Previous';
  prevButton.classList.add('mov');
  prevButton.addEventListener('click', function (e) {
    qNum--;
    if (qNum < 0) qNum = qaLength - 1;
    document.querySelector('#indexCard').innerHTML = '<strong>Question: </strong><br/><br/>' + parsed.qa[qNum].q;
    document.querySelector('#qNum').innerText = qNum + 1 + '/' + qaLength;
  });
  body.append(prevButton);

  var spn = document.createElement('span');
  spn.id = "qNum";
  spn.innerText = qNum + 1 + '/' + qaLength;
  body.append(spn);

  var nextButton = document.createElement('button');
  nextButton.innerText = 'Next';
  nextButton.classList.add('mov');
  nextButton.addEventListener('click', function (e) {
    qNum++;
    if (qNum >= qaLength) qNum = 0;
    document.querySelector('#indexCard').innerHTML = '<strong>Question: </strong><br/><br/>' + parsed.qa[qNum].q;
    document.querySelector('#qNum').innerText = qNum + 1 + '/' + qaLength;
  });
  body.append(nextButton);

  // index card
  var newChild = document.createElement('p');
  newChild.id = "indexCard";
  newChild.innerHTML = '<strong>Question: </strong><br/><br/>' + parsed.qa[0].q;
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

  var _loop3 = function _loop3(i) {
    var newChild = document.createElement('p');
    newChild.innerHTML = 'Question: ' + parsed.qa[i].q + '<br/>Answer: ' + parsed.qa[i].a;
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

  document.querySelector("#qaForm").classList.remove("hide");
  document.querySelector("#studySetForm").classList.add("hide");
  document.querySelector("#subjectForm").classList.add("hide");
};

var sendSubjectPost = function sendSubjectPost(e, nameForm) {
  var nameAction = nameForm.getAttribute('action');
  var nameMethod = nameForm.getAttribute('method');

  var subjectField = nameForm.querySelector('#subjectField');

  var xhr = new XMLHttpRequest();
  xhr.open(nameMethod, nameAction);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    handleResponse(xhr, refreshPage);
  };

  var formData = 'subject=' + subjectField.value;
  xhr.send(formData);

  e.preventDefault();
  return false;
};

var sendStudySetPost = function sendStudySetPost(e, nameForm) {
  var nameAction = nameForm.getAttribute('action');
  var nameMethod = nameForm.getAttribute('method');

  var subjectField = nameForm.querySelector('#subjectField');
  var studySetField = nameForm.querySelector('#studySetField');

  var xhr = new XMLHttpRequest();
  xhr.open(nameMethod, nameAction);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    handleResponse(xhr, refreshPage);
  };
  var subj = id.split('-')[1];
  var formData = 'subject=' + subj + '&studySet=' + studySetField.value;
  xhr.send(formData);

  e.preventDefault();
  return false;
};

var sendQAPost = function sendQAPost(e, nameForm) {
  var nameAction = nameForm.getAttribute('action');
  var nameMethod = nameForm.getAttribute('method');

  var qField = nameForm.querySelector('#qField');
  var aField = nameForm.querySelector('#aField');

  var xhr = new XMLHttpRequest();
  xhr.open(nameMethod, nameAction);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function () {
    handleResponse(xhr, refreshPage);
  };

  var parsed = id.split('-');
  var formData = 'subject=' + parsed[1] + '&studySet=' + parsed[3] + '&q=' + qField.value + '&a=' + aField.value;
  xhr.send(formData);

  e.preventDefault();
  return false;
};

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

var init = function init() {

  window.onpopstate = function (e) {
    sendGet(document.location, 'get', function (xhr) {
      add = false;
      if (document.location.href.includes('getSubject')) handleGetSubjectPg(xhr);else if (document.location.href.includes('getStudySet')) handleGetStudySetPg(xhr);else if (document.location.href.includes('getQA')) handleGetQAPg(xhr);
    });
  };

  var subjectForm = document.querySelector('#subjectForm');
  var addSubject = function addSubject(e) {
    return sendSubjectPost(e, subjectForm);
  };
  subjectForm.addEventListener('submit', addSubject);

  var studySetForm = document.querySelector('#studySetForm');
  var addStudySet = function addStudySet(e) {
    return sendStudySetPost(e, studySetForm);
  };
  studySetForm.addEventListener('submit', addStudySet);

  var qaForm = document.querySelector('#qaForm');
  var addQA = function addQA(e) {
    return sendQAPost(e, qaForm);
  };
  qaForm.addEventListener('submit', addQA);

  sendGet('/getSubject', 'GET', handleGetSubjectPg);
};

window.onload = init;
