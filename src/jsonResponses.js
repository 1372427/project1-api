// Note this object is purely in memory
const users = {};
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
    },
  },
  Japanese: {

  },
};

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  response.writeHead(status, headers);
  response.end();
};


// GET REQUESTS
const getUsers = (request, response) => {
  const responseJSON = {
    users,
  };
  return respondJSON(request, response, 200, responseJSON);
};

const getUsersMeta = (request, response) => respondJSONMeta(request, response, 200);

const getSubject = (request, response) => {
  const responseJSON = {
    message: Object.keys(data),
  };
  return respondJSON(request, response, 200, responseJSON);
};

const getSubjectMeta = (request, response) => {
  respondJSONMeta(request, response, 200);
};

const getStudySet = (request, response, params) => {
  const responseJSON = {
    message: 'Missing subject param',
  };
  // check for params
  if (!params.subject) {
    responseJSON.id = 'badRequest';
    respondJSON(request, response, 400, responseJSON);
  }

  responseJSON.message = { subject: params.subject, studySet: Object.keys(data[params.subject]) };
  return respondJSON(request, response, 200, responseJSON);
};

const getStudySetMeta = (request, response, params) => {
  if (!params.subject) {
    respondJSONMeta(request, response, 400);
  }
  respondJSONMeta(request, response, 200);
};

const getQA = (request, response, params) => {
  const responseJSON = {
    message: 'Missing subject or study set param',
  };
  // check for params
  if (!params.subject || !params.studySet) {
    responseJSON.id = 'badRequest';
    respondJSON(request, response, 400, responseJSON);
  }

  responseJSON.message = {subject: params.subject, 
    studySet: params.studySet, qa: data[params.subject][params.studySet] };
  return respondJSON(request, response, 200, responseJSON);
};

const getQAMeta = (request, response, params) => {
  if (!params.subject || !params.studySet) {
    respondJSONMeta(request, response, 400);
  }
  respondJSONMeta(request, response, 200);
};

// POST REQUESTS
const addUser = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required',
  };
  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
  let responseCode = 201; // created response code
  if (users[body.name]) {
    responseCode = 204; // updated response code
  } else {
    users[body.name] = {};
  }
  users[body.name].name = body.name;
  users[body.name].age = body.age;
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};

const addSubject = (request, response, body) => {
  const responseJSON = {
    message: 'Subject name is required',
  };
  if (!body.subject) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
  let responseCode = 201; // created response code
  if (data[body.subject]) {
    responseCode = 204; // updated response code
  } else {
    data[body.subject] = {};
  }
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};

const addStudySet = (request, response, body) => {
  const responseJSON = {
    message: 'Subject name and study set name is required',
  };
  if (!body.subject || !body.studySet) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
  let responseCode = 201; // created response code
  if (data[body.subject] && data[body.subject][body.studySet]) {
    responseCode = 204; // updated response code
  } else {
    data[body.subject][body.studySet] = {};
  }
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const addQA = (request, response, body) => {
  console.log(body);
// TODO - FIX ME!!!
let bodId = body.id;
  const responseJSON = {
    message: 'Subject name and study set name is required',
  };
  if (!body.subject || !body.studySet || !body.q || !body.a ) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
  let responseCode = 201; // created response code
  if (data[body.subject] && data[body.subject][body.studySet]){
    if( !bodId) {
      bodId = Object.keys(data[body.subject][body.studySet]).length;
    } else if (data[body.subject][body.studySet][bodId]) {
      responseCode = 204; // updated response code
    }
    data[body.subject][body.studySet][bodId] = { q: body.q, a: body.a };
  }else {
    //bad request
    console.log('bad');
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
  getUsers,
  getUsersMeta,
  addUser,
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
