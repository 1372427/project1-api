// Base data since not using a database
const data = {
  English: {
    Greetings: {
      0: {
        q: 'Said in the evening',
        a: 'Good Evening',
      },
      1: {
        q: "To ask after one's well being",
        a: 'How are you?',
      } },
    People: {
      0:
      {
        q: 'Current President of the US',
        a: 'Trump',
      },
      1:
      {
        q: '35th US President. Was Assassinated',
        a: 'Kennedy',
      },
      2:
      {
        q: 'Civil rights leader advocating non-violent civil disobedience. Had a dream',
        a: 'Martin Luther King Jr.',
      },
      3:
      {
        q: 'Sat on a bus',
        a: 'Rosa Parks',
      },
    },
  },
  Japanese: {
    Greetings: {
      0: {
        q: 'Said in the evening',
        a: 'こんばんは',
      },
      1: {
        q: "To ask after one's well being",
        a: 'おげんき です か',
      } },
  },
};

//format for sending any JSON response
const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

//format for sending any head response
const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  response.writeHead(status, headers);
  response.end();
};


/////////////////////////////////// GET REQUESTS////////////////////////////
//returns all of the subject names in data
const getSubject = (request, response) => {
  const responseJSON = {
    message: Object.keys(data),
  };
  return respondJSON(request, response, 200, responseJSON);
};

//head for all subjects in data request
const getSubjectMeta = (request, response) => {
  respondJSONMeta(request, response, 200);
};

//returns the study set for a requested subject
const getStudySet = (request, response, params) => {
  const responseJSON = {
    message: 'Missing subject param',
  };

  // check for params (exist and is valid)
  if (!params.subject ||!data[params.subject]) {
    responseJSON.id = 'badRequest';
    return respondJSON(request, response, 400, responseJSON);
  }

  responseJSON.message = { subject: params.subject, studySet: Object.keys(data[params.subject]) };
  return respondJSON(request, response, 200, responseJSON);
};

//returns the head response for a request on the study sets for a subject
const getStudySetMeta = (request, response, params) => {
  //check if params exist and are valid
  if (!params.subject || !data[params.subject]) {
    respondJSONMeta(request, response, 400);
  }

  respondJSONMeta(request, response, 200);
};

//returns the questions and answers for a given study set in a subject.
const getQA = (request, response, params) => {
  const responseJSON = {
    message: 'Missing subject or study set param',
  };

  // check for params subject and studySet (existing and valid)
  if (!params.subject || !params.studySet || !data[params.subject] || !data[params.subject][params.studySet]) {
    responseJSON.id = 'badRequest';
    return respondJSON(request, response, 400, responseJSON);
  }

  //format the repsonse
  responseJSON.message = { subject: params.subject,
    studySet: params.studySet,
    qa: data[params.subject][params.studySet] };
  return respondJSON(request, response, 200, responseJSON);
};

//return the head response for a request on the questions and answers of a given study set and subject
const getQAMeta = (request, response, params) => {
  //check if params exist and are valid
  if (!params.subject || !params.studySet || !data[params.subject] || !data[params.subject][params.studySet]) {
    return respondJSONMeta(request, response, 400);
  }
  return respondJSONMeta(request, response, 200);
};

/////////////////////////// POST REQUESTS///////////////////////////////////
//Allows the user to add or modify a subject
//Since the name is the only value for a subject, modifying it does nothing
const addSubject = (request, response, body) => {
  const responseJSON = {
    message: 'Subject name is required',
  };

  //check if param exists
  if (!body.subject) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201; // created response code
  
  if (data[body.subject]) {
    responseCode = 204; // updated response code
    //do nothing if it already exists -do not want to override data
  } else {
    data[body.subject] = {};
  }
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};

//Allows user to add a study set to a subject
const addStudySet = (request, response, body) => {
  const responseJSON = {
    message: 'Subject name and study set name is required',
  };

  //check if params exist
  if (!body.subject || !body.studySet) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
  
  //check if params are valid
  if(!data[body.subject]){
    responseJSON.id = 'badRequest';
    responseJSON.message= `${body.subject} is not a valid subject.`
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201; // created response code
  if (data[body.subject] && data[body.subject][body.studySet]) {
    responseCode = 204; // updated response code
    //does nothing if already exists so as not to override info
  } else {
    data[body.subject][body.studySet] = {};
  }
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};


//Allows the user to add a question and answer to a subject/studyset combo.
//Lets the user change existing questions and answers by id.
const addQA = (request, response, body) => {
  let bodId = body.id;
  const responseJSON = {
    message: 'Subject name and study set name is required',
  };

  //check if params exist
  if (!body.subject || !body.studySet || !body.q || !body.a) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201; // created response code
  
  //check validity of subject and study set params
  if (data[body.subject] && data[body.subject][body.studySet]) {
    
    //check if this is a new entry
    if (!bodId) {
      bodId = Object.keys(data[body.subject][body.studySet]).length;
    } else if (data[body.subject][body.studySet][bodId]) {
      responseCode = 204; // updated response code
    }

    //update the data
    data[body.subject][body.studySet][bodId] = { q: body.q, a: body.a };
  } else {
    // bad request due to invalid params
    responseJSON.id = 'badRequest';
    responseJSON.message= `Please check your subject and study set information.`
    return respondJSON(request, response, 400, responseJSON);
  }

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

// ERROR
const notReal = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found',
    id: 'notReal',
  };
  return respondJSON(request, response, 404, responseJSON);
};

const notRealMeta = (request, response) => respondJSONMeta(request, response, 404);

module.exports = {
  notReal,
  notRealMeta,
  addSubject,
  addStudySet,
  addQA,
  getSubject,
  getStudySet,
  getQA,
  getSubjectMeta,
  getStudySetMeta,
  getQAMeta,
};
