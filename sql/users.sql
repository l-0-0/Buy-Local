 DROP TABLE IF EXISTS users;
 
 
 CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      first VARCHAR(255) NOT NULL,
      last VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )



     --  CREATE TABLE user_profiles(
     --       id SERIAL PRIMARY KEY,
     --       age INT,
     --       city VARCHAR,
     --       url VARCHAR,
     --       user_id INT UNIQUE REFRENCES users(id)
     --  )