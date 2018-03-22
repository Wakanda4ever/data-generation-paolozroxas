CREATE KEYSPACE IF NOT EXISTS chompy_ks WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': '1'
};
USE chompy_ks;

CREATE COLUMNFAMILY business (
business_key INT,
business_id INT,
name VARCHAR,
claimed BOOLEAN,
review_count INT,
stars FLOAT,
dollar_signs FLOAT,
categories SET<TEXT>,
PRIMARY KEY (business_key)
);
