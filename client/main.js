//Variables for state management
let id = 'index'; //what page is currently showing
let add = false; //add to history?
let qNum = 0; //current question number

//sends the response from server to callback function
const handleResponse = (xhr, callback) => {
  if(xhr.getResponseHeader('content-type')!=='application/json')return console.log("response not in JSON");

  add=true;
  if(callback)callback(xhr);
};


/////////////////////HTML HANDLERS//////////////////////////////////////////
//Alters page to display all subjects returned from server
const handleGetSubjectPg = (xhr) => {
  //change id -no specific info here
  id = 'index';
  //push to history
  if(add){
    history.pushState({}, "title", '/getSubject');
  }

  let parsed = JSON.parse(xhr.response).message;
  let body = document.querySelector("#mainBody");
 
  //clear the page!
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }
  
  //add a button for each subject
  for(let i = 0; i< parsed.length; i++){
    let newChild = document.createElement('button');
    newChild.innerHTML = `${parsed[i]}`;
    newChild.addEventListener('click', () =>sendGet(`/getStudySet?subject=${parsed[i]}`, 'GET', handleGetStudySetPg))
    body.append(newChild);
  }

  //hide and show necessary forms 
  document.querySelector("#subjectForm").classList.remove("hide");
  document.querySelector("#studySetForm").classList.add("hide");
  document.querySelector("#qaForm").classList.add("hide");
}

//show all study sets in given subject as returned from server
const handleGetStudySetPg = (xhr) => {
  let parsed = JSON.parse(xhr.response).message;
  //change id to say the subject these study sets came from
  id = `subject-${parsed.subject}`;
  //add to history!
  if(add){
    history.pushState({}, "title", `/getStudySet?subject=${parsed.subject}`);
  }

  //clear the page!
  let body = document.querySelector("#mainBody");
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  //add header stating subject
  let header = document.createElement('h1');
  header.innerHTML = `${parsed.subject}`;
  body.append(header);

  //add buttons for all the study sets
  for(let i = 0; i< parsed.studySet.length; i++){
    let newChild = document.createElement('button');
    newChild.innerHTML = `${parsed.studySet[i]}`;
    newChild.addEventListener('click', () =>sendGet(`/getQA?subject=${parsed.subject}&studySet=${parsed.studySet[i]}`, 'GET', handleGetQAPg))
    body.append(newChild);
  }

  //show and hide forms as needed
  document.querySelector("#studySetForm").classList.remove("hide");
  document.querySelector("#subjectForm").classList.add("hide");
  document.querySelector("#qaForm").classList.add("hide");
}

//handles displaying all questions and answers as returned from server
const handleGetQAPg = (xhr) => {
  //hide or show all forms (might exit early later, so do this now!)
  document.querySelector("#qaForm").classList.remove("hide");
  document.querySelector("#studySetForm").classList.add("hide");
  document.querySelector("#subjectForm").classList.add("hide");

  //clear the index for which card is showing
  qNum=0;

  let parsed = JSON.parse(xhr.response).message;
  
  //change id to show which subjet and study set this page is for
  id = `subject-${parsed.subject}-studySet-${parsed.studySet}`

  //push to history!
  if(add){
    history.pushState({}, "title", `/getQA?subject=${parsed.subject}&studySet=${parsed.studySet}`);
  }

  //clear the page
  let body = document.querySelector("#mainBody");
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }

  //add header for subject and study set
  let header = document.createElement('span');
  header.innerHTML = `<h1>${parsed.subject}</h1><h2>${parsed.studySet}</h2>`;
  body.append(header);

  //check if there are no questions! if so, exit
  let qaLength = Object.keys(parsed.qa).length;
  if(qaLength==0){
    let info = document.createElement('span');
    info.innerHTML = `<p>No flashcards yet!</p>`;
    body.append(info);
    return;
  }

  //add movement Buttons
  //previous
  let prevButton = document.createElement('button');
  prevButton.innerText = 'Previous';
  prevButton.classList.add('mov');
  prevButton.addEventListener('click', function(e){
    qNum--;
    if(qNum<0)qNum=qaLength==0?0:qaLength-1;
    //update card and counter info
    document.querySelector('#indexCard').innerHTML = `<strong>Question: </strong><br/><br/>${parsed.qa[qNum].q}`;
    document.querySelector('#qNum').innerText = `${qNum+1}/${qaLength}`;
  });
  body.append(prevButton);

  //counter
  let spn = document.createElement('span');
  spn.id = "qNum";
  spn.innerText= `${qNum+1}/${qaLength}`;
  body.append(spn)

  //next
  let nextButton = document.createElement('button');
  nextButton.innerText = 'Next';
  nextButton.classList.add('mov');
  nextButton.addEventListener('click', function(e){
    qNum++;
    if(qNum>=qaLength)qNum=0;
    //update card and counter info
    document.querySelector('#indexCard').innerHTML = `<strong>Question: </strong><br/><br/>${parsed.qa[qNum].q}`;
    document.querySelector('#qNum').innerText = `${qNum+1}/${qaLength}`;
  });
  body.append(nextButton);

  // index card
  let newChild = document.createElement('p');
  newChild.id="indexCard";
  newChild.innerHTML = `<strong>Question: </strong><br/><br/>${parsed.qa[0].q}`;
  //flip between question and answer on click
  newChild.addEventListener('click', function(e) {
    let indexCard = document.querySelector('#indexCard');
    if(indexCard.innerText.includes("Question")){
      indexCard.innerHTML=`<strong>Answer: </strong><br/><br/>${parsed.qa[qNum].a}`;
    }else{
      indexCard.innerHTML=`<strong>Question: </strong><br/><br/>${parsed.qa[qNum].q}`;
    }
  })
  body.append(newChild);



  //all questions
  let allQheader = document.createElement('span');
  allQheader.innerHTML = `<h2>All Questions</h2><h2>(Click to Edit)</h2>`;
  body.append(allQheader);

  //add info for each question and answer
  for(let i = 0; i< Object.keys(parsed.qa).length; i++){
    let newChild = document.createElement('p');
    newChild.innerHTML = `Question: ${parsed.qa[i].q}<br/>Answer: ${parsed.qa[i].a}`;
    //on click spawn alerts to edit the selected question and answer
    newChild.addEventListener('click', function(e){
        let q  = prompt("Please edit the question:", `${parsed.qa[i].q}`);
        let a= prompt("Please edit the answer:", `${parsed.qa[i].a}`);
        if(!q || !a || q==='' || a==='')return;
        const xhr = new XMLHttpRequest();
        xhr.open('post', '/addQA');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.onload = () =>{
            handleResponse(xhr, refreshPage);
        }
        
        let parsed2 = id.split('-');
        const formData  = `subject=${parsed2[1]}&studySet=${parsed2[3]}&q=${q}&a=${a}&id=${i}`;
        xhr.send(formData);


    });
    body.append(newChild);
  }
  
}


//sends a POST request with information passed in as formData 
const sendPost = (e, nameForm, formData) => {
  const nameAction = nameForm.getAttribute('action');
  const nameMethod = nameForm.getAttribute('method');
  
  const xhr = new XMLHttpRequest();
  xhr.open(nameMethod, nameAction);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () =>{
    handleResponse(xhr, refreshPage);
  }
  
  xhr.send(formData);

  e.preventDefault();
  return false;
};

//generic GET request method
const sendGet = (url, methodType, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.open(methodType, url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () =>{
    handleResponse(xhr, callback);
  }
  
  xhr.send();
  return false;
}

//used to refresh page data when a post request is made
const refreshPage = (xhr) => {
  //don't add this to the history! Just refreshing same page!
  add=false;

  //check id variable to know which page is being displayed
  if(id === 'index')
    sendGet('/getSubject', 'GET', handleGetSubjectPg);
  
    let parsed = id.split('-');
  if(parsed.length === 2){
    sendGet(`/getStudySet?subject=${parsed[1]}`, 'GET', handleGetStudySetPg);
  } if(parsed.length === 4){
    sendGet(`/getQA?subject=${parsed[1]}&studySet=${parsed[3]}`, 'GET', handleGetQAPg);
  }
}

/////////////////////INITIALIZATION ////////////////////////////////////

//Init function. Sets up form links
const init = () => {

  //catch the back/forward button clicks and send to proper page handler
  window.onpopstate = (e) =>{ 
    sendGet(document.location, 'get', (xhr) => {
    add=false;
    if(document.location.href.includes('getSubject'))
      handleGetSubjectPg(xhr)
    else if (document.location.href.includes('getStudySet'))
      handleGetStudySetPg(xhr)
    else if (document.location.href.includes('getQA'))
      handleGetQAPg(xhr)

  })};

  //hook up different forms to respective post handler functions

  const subjectForm = document.querySelector('#subjectForm');
  const addSubject = (e) => {
    //get subject info from form input field
    const subjectField = subjectForm.querySelector('#subjectField');
    const formData  = `subject=${subjectField.value}`;
    sendSubjectPost(e, subjectForm, formData)
  };
  subjectForm.addEventListener('submit', addSubject);


  const studySetForm = document.querySelector('#studySetForm');
  const addStudySet = (e) => {
    //get study set name from form input field
    const studySetField = studySetForm.querySelector('#studySetField');
    //get subject info from page id 
    let subj = id.split('-')[1];
    const formData  = `subject=${subj}&studySet=${studySetField.value}`;
    sendPost(e, studySetForm, formData)
  };
  studySetForm.addEventListener('submit', addStudySet);

  
  const qaForm = document.querySelector('#qaForm');
  const addQA = (e) => {
    //get question and answer from form input
    const qField = qaForm.querySelector('#qField');
    const aField = qaForm.querySelector('#aField');
    //get subject and study set from page id
    let parsed = id.split('-');
    const formData  = `subject=${parsed[1]}&studySet=${parsed[3]}&q=${qField.value}&a=${aField.value}`;
    sendPost(e, qaForm, formData)
  };
  qaForm.addEventListener('submit', addQA);

  sendGet('/getSubject', 'GET', handleGetSubjectPg);
};

window.onload = init;