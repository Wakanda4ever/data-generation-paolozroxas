var Promise = require('bluebird');
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({
  contactPoints: ['localhost'],
  keyspace: 'chompy_ks'
});

var startTime;
var endTime;
var testTimes = [];

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
    var queryString = `SELECT * FROM business WHERE business_key = ${getRandomCategoryId(numberOfRowsInTable)}`;
    var readPromise = client.execute(queryString, []);
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

testDatabase(1, 10, 10997106)
.then(() => {
  var sum = testTimes.reduce((x, y) => {
    return x + y;
  }, 0);
  var length = testTimes.length;
  console.log('Average query time:', sum / length, 'milliseconds');
})
