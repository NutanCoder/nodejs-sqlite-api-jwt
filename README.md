# Node.js SQLite In-Memory Database Example

This project sets up an **in-memory SQLite database** using Node.js and the `sqlite3` package. It defines two tables:

- `users`: Stores user data with unique emails.
- `books`: Stores books with a foreign key referencing a user.

## Features

- Uses SQLite in-memory mode (data resets on every restart).
- Initializes `users` and `books` tables on server start.
- Demonstrates usage of foreign keys in SQLite.

## Prerequisites

- Node.js (v14 or above recommended)
- npm

## Installation

```bash
git clone https://github.com/NutanCoder/nodejs-sqlite-api-jwt.git
cd nodejs-sqlite-api-jwt
npm install
npm run start
```
