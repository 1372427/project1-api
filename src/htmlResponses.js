const fs = require('fs'); // pull in the file system module

//read in all files
const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const css = fs.readFileSync(`${__dirname}/../hosted/style.css`);
const bundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);
const doc = fs.readFileSync(`${__dirname}/../hosted/documentation.html`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getDoc = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(doc);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

//bundled JS file
const getBundle = (request, response) => {
  response.writeHead(200, {'Content-Type': 'application/javascript'});
  response.write(bundle);
  response.end();
}

module.exports = {
  getIndex,
  getCSS,
  getBundle,
  getDoc,
};
