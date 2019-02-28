let id = 'index';
    let add = false;
    let qNum = 0;

    const handleResponse = (xhr, callback) => {
      add=true;
      if(callback)callback(xhr);

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

    const handleGetSubjectPg = (xhr) => {
      id = 'index';
      if(add){
        history.pushState({}, "title", '/getSubject');
      }
      let parsed = JSON.parse(xhr.response).message;
      let body = document.querySelector("#mainBody");
      while (body.firstChild) {
        body.removeChild(body.firstChild);
      }
      for(let i = 0; i< parsed.length; i++){
        let newChild = document.createElement('button');
        newChild.innerHTML = `${parsed[i]}`;
        newChild.addEventListener('click', () =>sendGet(`/getStudySet?subject=${parsed[i]}`, 'GET', handleGetStudySetPg))
        body.append(newChild);
      }

      
      document.querySelector("#subjectForm").classList.remove("hide");
      document.querySelector("#studySetForm").classList.add("hide");
      document.querySelector("#qaForm").classList.add("hide");
    }

    const refreshPage = (xhr) => {
      add=false;
      if(id === 'index')
        sendGet('/getSubject', 'GET', handleGetSubjectPg);
      let parsed = id.split('-');
      if(parsed.length === 2){
        sendGet(`/getStudySet?subject=${parsed[1]}`, 'GET', handleGetStudySetPg);
      } if(parsed.length === 4){
        sendGet(`/getQA?subject=${parsed[1]}&studySet=${parsed[3]}`, 'GET', handleGetQAPg);
      }
    }

    const handleGetStudySetPg = (xhr) => {
      let parsed = JSON.parse(xhr.response).message;
      id = `subject-${parsed.subject}`;
      if(add){
        history.pushState({}, "title", `/getStudySet?subject=${parsed.subject}`);
      }
      let body = document.querySelector("#mainBody");
      while (body.firstChild) {
        body.removeChild(body.firstChild);
      }
      let header = document.createElement('h1');
      header.innerHTML = `${parsed.subject}`;
      body.append(header);

      for(let i = 0; i< parsed.studySet.length; i++){
        let newChild = document.createElement('button');
        newChild.innerHTML = `${parsed.studySet[i]}`;
        newChild.addEventListener('click', () =>sendGet(`/getQA?subject=${parsed.subject}&studySet=${parsed.studySet[i]}`, 'GET', handleGetQAPg))
        body.append(newChild);
      }

      document.querySelector("#studySetForm").classList.remove("hide");
      document.querySelector("#subjectForm").classList.add("hide");
      document.querySelector("#qaForm").classList.add("hide");
    }

    const handleGetQAPg = (xhr) => {
      
      qNum=0;
      let parsed = JSON.parse(xhr.response).message;
        id = `subject-${parsed.subject}-studySet-${parsed.studySet}`
      if(add){
      history.pushState({}, "title", `/getQA?subject=${parsed.subject}&studySet=${parsed.studySet}`);
      }

      let body = document.querySelector("#mainBody");
      while (body.firstChild) {
        body.removeChild(body.firstChild);
      }

      
      let header = document.createElement('span');
      header.innerHTML = `<h1>${parsed.subject}</h1><h2>${parsed.studySet}</h2>`;
      body.append(header);

      let qaLength = Object.keys(parsed.qa).length;
      //Movement Buttons
      let prevButton = document.createElement('button');
      prevButton.innerText = 'Previous';
      prevButton.classList.add('mov');
      prevButton.addEventListener('click', function(e){
        qNum--;
        if(qNum<0)qNum=qaLength-1;
        document.querySelector('#indexCard').innerHTML = `<strong>Question: </strong><br/><br/>${parsed.qa[qNum].q}`;
        document.querySelector('#qNum').innerText = `${qNum+1}/${qaLength}`;
      });
      body.append(prevButton);

      let spn = document.createElement('span');
      spn.id = "qNum";
      spn.innerText= `${qNum+1}/${qaLength}`;
      body.append(spn)

      let nextButton = document.createElement('button');
      nextButton.innerText = 'Next';
      nextButton.classList.add('mov');
      nextButton.addEventListener('click', function(e){
        qNum++;
        if(qNum>=qaLength)qNum=0;
        document.querySelector('#indexCard').innerHTML = `<strong>Question: </strong><br/><br/>${parsed.qa[qNum].q}`;
        document.querySelector('#qNum').innerText = `${qNum+1}/${qaLength}`;
      });
      body.append(nextButton);

      // index card
      let newChild = document.createElement('p');
      newChild.id="indexCard";
      newChild.innerHTML = `<strong>Question: </strong><br/><br/>${parsed.qa[0].q}`;
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

      for(let i = 0; i< Object.keys(parsed.qa).length; i++){
        let newChild = document.createElement('p');
        newChild.innerHTML = `Question: ${parsed.qa[i].q}<br/>Answer: ${parsed.qa[i].a}`;
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
      
      document.querySelector("#qaForm").classList.remove("hide");
      document.querySelector("#studySetForm").classList.add("hide");
      document.querySelector("#subjectForm").classList.add("hide");
    }

    const sendSubjectPost = (e, nameForm) => {
      const nameAction = nameForm.getAttribute('action');
      const nameMethod = nameForm.getAttribute('method');
      
      const subjectField = nameForm.querySelector('#subjectField');

      const xhr = new XMLHttpRequest();
      xhr.open(nameMethod, nameAction);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.setRequestHeader('Accept', 'application/json');

      xhr.onload = () =>{
        handleResponse(xhr, refreshPage);
      }
      
      const formData  = `subject=${subjectField.value}`;
      xhr.send(formData);
    
      e.preventDefault();
      return false;
    };

    const sendStudySetPost = (e, nameForm) => {
      const nameAction = nameForm.getAttribute('action');
      const nameMethod = nameForm.getAttribute('method');
      
      const subjectField = nameForm.querySelector('#subjectField');
      const studySetField = nameForm.querySelector('#studySetField');

      const xhr = new XMLHttpRequest();
      xhr.open(nameMethod, nameAction);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.setRequestHeader('Accept', 'application/json');

      xhr.onload = () =>{
        handleResponse(xhr, refreshPage);
      }
      let subj = id.split('-')[1];
      const formData  = `subject=${subj}&studySet=${studySetField.value}`;
      xhr.send(formData);
    
      e.preventDefault();
      return false;
    };


    const sendQAPost = (e, nameForm) => {
      const nameAction = nameForm.getAttribute('action');
      const nameMethod = nameForm.getAttribute('method');
      
      const qField = nameForm.querySelector('#qField');
      const aField = nameForm.querySelector('#aField');

      const xhr = new XMLHttpRequest();
      xhr.open(nameMethod, nameAction);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.setRequestHeader('Accept', 'application/json');

      xhr.onload = () =>{
        handleResponse(xhr, refreshPage);
      }
      
      let parsed = id.split('-');
      const formData  = `subject=${parsed[1]}&studySet=${parsed[3]}&q=${qField.value}&a=${aField.value}`;
      xhr.send(formData);
    
      e.preventDefault();
      return false;
    };

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

    const init = () => {

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

      const subjectForm = document.querySelector('#subjectForm');
      const addSubject = (e) => sendSubjectPost(e, subjectForm);
      subjectForm.addEventListener('submit', addSubject);


      const studySetForm = document.querySelector('#studySetForm');
      const addStudySet = (e) => sendStudySetPost(e, studySetForm);
      studySetForm.addEventListener('submit', addStudySet);

      
      const qaForm = document.querySelector('#qaForm');
      const addQA = (e) => sendQAPost(e, qaForm);
      qaForm.addEventListener('submit', addQA);

      sendGet('/getSubject', 'GET', handleGetSubjectPg);
    };

    window.onload = init;