const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  storeRefreshToken,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  deleteRefreshToken,
  getRefreshToken,
  SECRET,
  REFRESH_SECRET,
} = require("../services/userService");
const { sendResponse } = require("../utils/responseHelper");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management & authentication
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await registerUser(name, email, password);
    return sendResponse(res, 201, "User registered successfully", user);
  } catch (err) {
    return sendResponse(res, 400, err.message);
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await loginUser(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return sendResponse(res, 401, "Invalid credentials");
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await storeRefreshToken(user.id, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, 200, "Login successful", {
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return sendResponse(res, 500, "Login failed", err.message);
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Server error
 */
router.get("/", auth, async (req, res) => {
  try {
    const users = await getAllUsers();
    return sendResponse(res, 200, "Users fetched", users);
  } catch (err) {
    return sendResponse(res, 500, "Failed to fetch users", err.message);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return sendResponse(res, 404, "User not found");
    return sendResponse(res, 200, "User fetched", user);
  } catch (err) {
    return sendResponse(res, 500, "Failed to get user", err.message);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Bad request
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const changes = await updateUserById(req.params.id, name, email);
    return sendResponse(res, 200, "User updated", { updated: changes });
  } catch (err) {
    return sendResponse(res, 400, "Update failed", err.message);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       500:
 *         description: Server error
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const changes = await deleteUserById(req.params.id);
    return sendResponse(res, 200, "User deleted", { deleted: changes });
  } catch (err) {
    return sendResponse(res, 500, "Delete failed", err.message);
  }
});

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Generate a new access token using refresh token
 *     tags: [Auth]
 *     description: Deletes old refresh token and creates a new one.
 *     responses:
 *       200:
 *         description: New access token and refresh token
 *       403:
 *         description: Forbidden - invalid or missing refresh token
 */
router.post("/token", async (req, res) => {
  const oldToken = req.headers["refresh-token"];
  if (!oldToken) return sendResponse(res, 403, "Refresh token missing");

  try {
    const row = await getRefreshToken(oldToken);
    if (!row) return sendResponse(res, 403, "Invalid refresh token");

    jwt.verify(oldToken, REFRESH_SECRET, async (err, user) => {
      if (err) return sendResponse(res, 403, "Invalid or expired token");

      // Delete old token
      await deleteRefreshToken(oldToken);

      // Issue new tokens
      const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, {
        expiresIn: "15m",
      });

      const newRefreshToken = jwt.sign(
        { id: user.id, email: user.email },
        REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      await storeRefreshToken(user.id, newRefreshToken);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendResponse(res, 200, "New tokens issued", {
        accessToken,
        refreshToken: newRefreshToken,
      });
    });
  } catch (err) {
    return sendResponse(res, 403, "Token refresh failed", err.message);
  }
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout the user and clear refresh token
 *     tags: [Auth]
 *     description: Deletes refresh token from DB and clears the cookie.
 *     responses:
 *       204:
 *         description: Successfully logged out
 */
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  try {
    await deleteRefreshToken(refreshToken);
    res.clearCookie("refreshToken");
    return res.sendStatus(204);
  } catch (err) {
    return sendResponse(res, 500, "Logout failed", err.message);
  }
});

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: Get all active refresh token sessions for the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions (refresh tokens)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       token:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/sessions", auth, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT token, created_at FROM refresh_tokens WHERE user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) {
        return sendResponse(
          res,
          500,
          "Failed to fetch active sessions",
          err.message
        );
      }

      sendResponse(res, 200, "Active sessions fetched", rows);
    }
  );
});

module.exports = router;
