const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "Welcome to user Auth API",
    message: "This message confirms API is working",
  });
});

router.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const checkUserResponse = await db.query(
    `select * from users where username = '${username}'`
  );
  if (checkUserResponse.rows.length == 0) {
    const createUserQuery = `insert into users(username, name, password, gender, location) 
      values('${username}','${name}','${hashedPassword}','${gender}','${location}')`;
    if (password.length > 5) {
      const createUser = await db.query(createUserQuery);
      return response.status(200).json({
        message: "User created successfully",
        statusCode: 1
      });
    } else {
      return response.status(200).json({
        message: "Password is too short",
        statusCode: 0
      });
    }
  } else {
    return response.status(200).json({
      message: "User with this ID already exists!",
      statusCode: 0
    });
  }
});

router.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const checkUserQuery = `select * from users where username = '${username}'`;
  const userNameResponse = await db.query(checkUserQuery);
  if (userNameResponse.rows.length > 0) {
    const isPasswordMatched = await bcrypt.compare(
      password,
      userNameResponse.rows[0].password
    );
    if (isPasswordMatched) {
      return response.status(200).json({
        status: "success",
        name: userNameResponse.rows[0].name
      });
    } else {
      return response.status(200).json({
        status: "failure",
        name: ''
      });
    }
  } else {
    return response.status(200).json({
      status: "failure",
      name: ''
    });
  }
});

router.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const checkUserQuery = `select * from users where username = '${username}'`;
  const userDetails = await db.query(checkUserQuery);
  if (userDetails.rows.length > 0) {
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      userDetails.rows[0].password
    );
    if (isPasswordValid) {
      if (newPassword.length > 5) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = `update users set 
        password = '${hashedPassword}' where username = '${username}';`;
        const updatePasswordResponse = await db.query(updatePasswordQuery);
        return response.status(200).json({
          message: "Password updated",
          statusCode: 1
        });
      } else {
        return response.status(200).json({
          message: "Password is too short",
          statusCode: 0
        });
      }
    } else {
      return response.status(200).json({
        message: "Invalid current password",
        statusCode: 0
      });
    }
  } else {
    return response.status(200).json({
      message: "Invalid user",
      statusCode: 0
    });
  }
});

router.get("/message-list", async (request, response) => {
  const messageList = await db.query(
    "select message from users where message IS NOT NULL"
  );
  return response.status(200).json(messageList.rows);
});

router.post("/message", async (request, response) => {
  const { username, message } = request.body;
  const setMessageQuery = `update users set 
  message = '${message}' where username = '${username}';`;
  const dbResponse = await db.query(setMessageQuery);
  return response.status(200).json({
    status: "success"
  });
});

router.post("/checkmessage", async (request, response) => {
  const { username } = request.body;
  const setMessageQuery =  `select * from users where username = '${username}'`;
  const dbResponse = await db.query(setMessageQuery);
  if (dbResponse.rows.length > 0) {
    return response.status(200).json({
      status: "success",
      message: dbResponse.rows[0].message
    });
  } else {
    return response.status(200).json({
      status: "failure",
      message: "username does not exist"
    });
  }
});

module.exports = router;
