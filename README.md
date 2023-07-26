# Nicolas-Cage-API
One place for al the information you want for the best actor ever. 


# API Endpoints

---

## General

- **GET `/`**
  - Description: Welcome to my movie API!

---

## Users

- **POST `/users`**
  - Description: Add a user
  - Expected JSON:
    ```json
    {
      "ID": "Integer",
      "Username": "String",
      "Password": "String",
      "Email": "String",
      "Birthday": "Date"
    }
    ```

- **GET `/users`**
  - Description: Get all users

- **GET `/users/:Username`**
  - Description: Get a user by username

- **PUT `/users/:username`**
  - Description: Update a user's info by username
  - Expected JSON:
    ```json
    {
      "Username": "String (required)",
      "Password": "String (required)",
      "Email": "String (required)",
      "Birthday": "Date"
    }
    ```

- **DELETE `/users/:Username`**
  - Description: Delete a user by username

- **GET/POST/PUT/DELETE `/users/:Username/movies/:MovieId`**
  - Description: Handle operations related to a user's favorite movies

---

## Movies

- **GET `/movies`**
  - Description: Get all movies

- **GET `/movies/:title`**
  - Description: Get a movie by title

---

## Genre

- **GET `/genre/:name`**
  - Description: Get a genre by name

---

## Director

- **GET `/director/:name`**
  - Description: Get a director by name

---

