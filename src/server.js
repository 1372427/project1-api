const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

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
};

const handlePost = (request, response, parsedUrl) => {
  if (postUrl[parsedUrl.pathname]) {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });


    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      postUrl[parsedUrl.pathname](request, response, bodyParams);
    });
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  const params = query.parse(parsedUrl.query);

  switch (request.method) {
    case 'GET':
      console.log(params);
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
