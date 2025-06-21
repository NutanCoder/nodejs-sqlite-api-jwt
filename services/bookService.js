const db = require("../db");

exports.createBook = (title, author, userId) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO books (title, author, user_id) VALUES (?, ?, ?)`,
      [title, author, userId],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, title, author, user_id: userId });
      }
    );
  });
};

exports.getAllBooks = (userId) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM books WHERE user_id = ?`, [userId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

exports.getBookById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM books WHERE id = ?`, [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

exports.updateBookById = (id, title, author) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE books SET title = ?, author = ? WHERE id = ?`,
      [title, author, id],
      function (err) {
        if (err) return reject(err);
        resolve(getBookById(id));
      }
    );
  });
};

exports.deleteBookById = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM books WHERE id = ?`, [id], function (err) {
      if (err) return reject(err);
      resolve(this.changes);
    });
  });
};
