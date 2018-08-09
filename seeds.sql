-- Drops the bamazon_db if it exists currently --
DROP DATABASE IF EXISTS bamazon_db;
-- Creates the "bamazon_db" database --
CREATE DATABASE bamazon_db;

-- Makes it so all of the following code will affect bamazon_db --
USE bamazon_db;

-- Creates the table "products" within bamazon_db --
CREATE TABLE products (
  -- Creates a numeric column called "id" which will automatically increment its default value as we create new rows --
  id INTEGER AUTO_INCREMENT NOT NULL,
  -- Gives items unique item numbers --
  item_id INTEGER(10) NULL,
  -- Makes a string column called "product_name" --
  product_name VARCHAR(100) NULL,
  -- Makes a string column called "department_name" --
  department_name VARCHAR(100) NULL,
  -- Makes an numeric column called "price" --
  price DECIMAL(10,2) NULL,
  -- Makes an numeric column called "quantity" --
  quantity INTEGER(10) NULL,
  -- Sets id as this table's primary key which means all data contained within it will be unique --
  PRIMARY KEY (id)
);

SELECT 
    *
FROM
    products;