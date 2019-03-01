const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

//set up redirects
const postUrl = {
  '/addSubject': jsonHandler.addSubject,
  '/addStudySet': jsonHandler.addStudySet,
  '/addQA': jsonHandler.addQA,
};

const headUrl = {
  '/getSubject': jsonHandler.getSubjectMeta,
  '/getStudySet': jsonHandler.getStudySetMeta,
  '/getQA': jsonHandler.getQAMeta,
};

const getUrl = {
  '/getSubject': jsonHandler.getSubject,
  '/getStudySet': jsonHandler.getStudySet,
  '/getQA': jsonHandler.getQA,
  '/index': htmlHandler.getIndex,
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/bundle.js': htmlHandler.getBundle,
  '/documentation.html': htmlHandler.getDoc,
};

//handles post requests, waiting for all data
const handlePost = (request, response, parsedUrl) => {
  //check if a valid request
  if (postUrl[parsedUrl.pathname]) {
    const body = [];

    //alert on error
    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    //wait for all data
    request.on('data', (chunk) => {
      body.push(chunk);
    });

    //format data and send to proper handler method
    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      postUrl[parsedUrl.pathname](request, response, bodyParams);
    });
  }
};

//handles all incoming requests
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  //send to correct handler method based on type of request
  switch (request.method) {
    case 'GET':
      if (getUrl[parsedUrl.pathname]) {
        getUrl[parsedUrl.pathname](request, response, params);
      } else {
        jsonHandler.notReal(request, response);
      }
      break;
    case 'HEAD':
      if (headUrl[parsedUrl.pathname]) {
        headUrl[parsedUrl.pathname](request, response);
      } else {
        jsonHandler.notRealMeta(request, response);
      }
      break;
    case 'POST':
      handlePost(request, response, parsedUrl);
      break;
    default:
      jsonHandler.notReal(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
