const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const bodyParser = require('body-parser');

// Объект с конфигами
const patternsObject = {};

// Путь к директории с конфигами
const dirPath = path.join(`${__dirname}/patterns/`);

// Считываем в конфигурационный файл объект вида
// String: String
const filenames = fs.readdirSync(dirPath);
filenames.forEach((item) => {
  const filePath = dirPath + item;
  const content = fs.readFileSync(filePath, 'utf8');
  patternsObject[item] = content;
});

// port
const port = 3000;

// // Init app
const app = express();
const server = http.Server(app);

// Template engine -- EJS
app.set('view engine', 'ejs');

// Routing
app.get('/', (req, res) => {
  res.render('index', { config: JSON.stringify(patternsObject) });
});

app.use(bodyParser.json());

// Принять запрос от клиента
app.post('/', (req, res) => {
  const newDataJSON = JSON.stringify(req.body);
  const newData = JSON.parse(newDataJSON);
  const newDataLen = newData.length;

  const ext = '.json';
  for (let i = 0; i < newDataLen; i += 1) {
    const fileName = newData[i].name;
    const dataToWrite = JSON.stringify(newData[i]);
    const fullPath = dirPath + fileName + ext;
    fs.writeFileSync(fullPath, dataToWrite);
  }

  res.end();
});

// Serve static in root static folder
app.use(express.static('./static'));

// Port listening
server.listen(port);
