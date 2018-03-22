DROP DATABASE IF EXISTS chompy_db;
CREATE DATABASE chompy_db;
USE chompy_db;

CREATE TABLE business (
primary_key INT NOT NULL AUTO_INCREMENT,
id INT NOT NULL,
name VARCHAR(225) NOT NULL,
claimed BOOLEAN,
review_count INT,
stars FLOAT,
dollar_signs FLOAT,
PRIMARY KEY (primary_key)
);

CREATE TABLE category (
primary_key INT NOT NULL AUTO_INCREMENT,
id INT NOT NULL,
business_id INT NOT NULL,
category VARCHAR(225),
PRIMARY KEY (primary_key)
);
