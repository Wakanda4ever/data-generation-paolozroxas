var Promise = require('bluebird');
var fs = require('fs');
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({
  contactPoints: ['localhost'],
  keyspace: 'chompy_ks'
});

//PLEASE REFACTOR: don't use cassandra batches - these are designed for ops on a single
//partition. bad performance when inserting multiple partitions.

var counter = 1;
var startTime = Date.now();
var endTime;
var finished = false;
var openedFile = fs.openSync('./dataset/business.json', 'r');

var getLineFromFile = (openedFile) => {
  var buff = new Buffer([1]);
  var readChars = '';
  while (fs.readSync(openedFile, buff, 0, 1, null) !== 0) {
    if (buff.toString() === '\n') {
      break;
    }
    readChars += buff;
  }
  return readChars;
};

var getXBusinesses = (x) => {
  var businesses = [];
  for (var i = 0; i < x; i++) {
    var businessJson = getLineFromFile(openedFile);
    if (businessJson === '') {
      finished = true;
      break;
    }
    businesses.push(JSON.parse(businessJson));
  }
  return businesses;
};

var finishSeeding = () => {
  endTime = Date.now();
  console.log(`Successfully seeded database! Time taken: ${endTime - startTime} milliseconds`);
  client.close();
  return;
};

var insertBatch = () => {
  if (finished) {
    return finishSeeding();
  }
  var businesses = getXBusinesses(500);
  var insertionPromises = [];
  const queryString = `INSERT INTO business
    (business_key, business_id, name, claimed,
    review_count, stars, dollar_signs, categories)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

  for (var x = 0; x < businesses.length; x++) {
    for(var y = 0; y < 2; y++) {
      var queries = [];
      var { name, review_count, stars, categories } = businesses[x];
      for (var i = 0; i < 30; i++) {
        var replacements = [
          counter,
          counter,
          name,
          true,
          review_count,
          stars,
          stars,
          categories
        ];
        counter++;
        queries.push({ query: queryString, params: replacements });
      }
      insertionPromises.push(
        client.batch(queries, { prepare: true })
          .catch((err) => console.error('Failed to insert', err))
      );
    }
  }

  return Promise.all(insertionPromises).then(() => {
    console.log(`Successfully inserted ${counter - 1} items into database`);
    return insertBatch();
  }).catch(err => console.error('Failed to seed database', err));

};

insertBatch();
