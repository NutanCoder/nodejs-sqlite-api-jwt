const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const SECRET = "your_jwt_secret";
const REFRESH_SECRET = "your_refresh_secret";

const registerUser = async (name, email, password) => {
  const hash = await bcrypt.hash(password, 8);
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, hash],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, name, email });
      }
    );
  });
};

const loginUser = (email) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
      if (err) return reject(err);
      resolve(user);
    });
  });
};

const storeRefreshToken = (userId, token) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)`,
      [userId, token],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, name, email FROM users`, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Get all refresh tokens for a specific user.
 * @param {string} token
 * @returns {Promise<Array<{ token: string, created_at: string }>>}
 */
const getRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT token, created_at FROM refresh_tokens WHERE token = ?`,
      [token],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
};

/**
 * Delete a specific refresh token from the database.
 * @param {string} token - The refresh token to delete
 * @returns {Promise<number>} - Number of deleted rows
 */
const deleteRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM refresh_tokens WHERE token = ?`,
      [token],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes); // number of rows deleted
      }
    );
  });
};

module.exports = {
  registerUser,
  loginUser,
  storeRefreshToken,
  getAllUsers,
  getRefreshToken,
  deleteRefreshToken,
  SECRET,
  REFRESH_SECRET,
};
