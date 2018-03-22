var Promise = require('bluebird');
var Sequelize = require('sequelize');
var fs = require('fs');
var sequelizeChompy = new Sequelize('chompy_db', 'root', 'mrsanders',
  { host: 'localhost', dialect: 'mysql', logging: false });

var startTime;
var endTime;
var categories;

var auth = sequelizeChompy
  .authenticate()
  .then(() => console.log('Connected to chompy_db'))
  .catch(err => console.error('Unable to connect to chompy_db', err));

var getCategoriesFromFile = Promise.promisify(fs.readFile.bind(fs))('./categories.json')
  .then(result => {
    console.log('Successfully read categories.json');
    categories = JSON.parse(result);
    return;
  }).catch(err => console.error('Unable to read categories.json', err));

var getRandomNumberOfCategories = () => {
  var randNum = Math.random();
  var numberOfCategories;
  if (randNum < 0.25) {
    numberOfCategories = 0;
  } else if (randNum < 0.75) {
    numberOfCategories = 1;
  } else if (randNum < 0.95) {
    numberOfCategories = 2;
  } else {
    numberOfCategories = 3;
  }
  return numberOfCategories;
}

var getRandomCategory = () => {
  return categories[Math.floor(Math.random() * categories.length)];
}

var insertBatch = (businessCounter, categoryCounter) => {
  if (businessCounter >= 10474020) {
    sequelizeChompy.close();
    endTime = Date.now();
    console.log('CATEGORY TABLE SEED COMPLETE! TIME TAKEN:', (endTime - startTime) / 1000);
    return;
  }
  var queryString = `INSERT INTO category (id, business_id, category) VALUES `;
  var replacements = [];
  var firstItem = true;
  for (var i = 0; i < 10000; i++) {
    var numberOfCategories = getRandomNumberOfCategories();
    for (var j = 0; j < numberOfCategories; j++) {
      if (firstItem) {
        queryString += '(?, ?, ?)';
        firstItem = false;
      } else {
        queryString += ', (?, ?, ?)';
      }
      replacements.push(categoryCounter, businessCounter, getRandomCategory());
      categoryCounter++;
    }
    businessCounter++;
    if (businessCounter >= 10474020) {
      break;
    }
  }
  queryString += ';';
  return sequelizeChompy.query(queryString, { replacements: replacements })
    .then(() => {
      console.log(`Successfully inserted ${categoryCounter - 1} categories for ${businessCounter - 1} businesses`);
      return insertBatch(businessCounter, categoryCounter);
    })
    .catch(err => console.error('Failed to seed database', err))
};


auth.then(() => getCategoriesFromFile)
  .then(() => {
    startTime = Date.now();
    return insertBatch(1, 1);
  })
