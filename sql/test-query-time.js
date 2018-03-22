var Promise = require('bluebird');
var Sequelize = require('sequelize');
var sequelizeChompy = new Sequelize('chompy_db', 'root', 'mrsanders',
  { host: 'localhost', dialect: 'mysql', logging: false });

var startTime;
var endTime;
var testTimes = [];

var auth = sequelizeChompy
  .authenticate()
  .then(() => console.log('Connected to chompy_db'))
  .catch(err => console.error('Unable to connect to chompy_db', err));

var testDatabase = (requestsPerTest, numberOfTests, numberOfRowsInTable) => {
  if (!(requestsPerTest && numberOfTests) || requestsPerTest < 0 || numberOfTests < 0) {
    return null;
  }
  if (numberOfTests === 0) {
    return;
  }

  var readPromises = [];
  startTime = Date.now();

  for (var i = 0; i < requestsPerTest; i++) {
    var readPromise = sequelizeChompy.query(`SELECT * FROM business WHERE id = ${getRandomCategoryId(numberOfRowsInTable)}`);
    readPromises.push(readPromise);
  }

  return Promise.all(readPromises).then(() => {
    endTime = Date.now();
    var testTime = endTime - startTime;
    testTimes.push(testTime);
    console.log(`Test Completed: ${requestsPerTest} read queries completed in ${testTime} milliseconds`);
    return testDatabase(requestsPerTest, numberOfTests - 1, numberOfRowsInTable);
  })
}

var getRandomCategoryId = (rows) => {
  return Math.floor(Math.random() * rows) + 1;
}

auth.then(() => {
  return testDatabase(1, 10, 10997106);
}).then(() => {
  var sum = testTimes.reduce((x, y) => {
    return x + y;
  }, 0);
  var length = testTimes.length;
  console.log('Average query time:', sum / length, 'milliseconds');
  sequelizeChompy.close();
})
