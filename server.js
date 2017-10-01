const express = require('express');
const path = require('path');
const fs = require('fs');

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

// Init app
const app = express();

// Template engine -- EJS
app.set('view engine', 'ejs');

// Routing
app.get('/', (req, res) => {
  res.render('index', { config: JSON.stringify(patternsObject) });
});

// Serve static in root folder
app.use(express.static('.'));

// Port listening
app.listen(port, () => {});
