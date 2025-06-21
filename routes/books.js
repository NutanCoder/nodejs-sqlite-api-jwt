const express = require("express");
const auth = require("../middleware/auth");
const {
  createBook,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBookById,
} = require("../services/bookService");
const { sendResponse } = require("../utils/responseHelper");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management
 */

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book created
 *       400:
 *         description: Bad request
 */
router.post("/", auth, async (req, res) => {
  const { title, author } = req.body;
  const userId = req.user.id;

  try {
    const result = await createBook(title, author, userId);
    return sendResponse(res, 201, "Book created", result);
  } catch (err) {
    return sendResponse(res, 400, "Book creation failed", err.message);
  }
});

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of books
 *       500:
 *         description: Server error
 */
router.get("/", auth, async (req, res) => {
  try {
    const books = await getAllBooks(req.user.id);
    return sendResponse(res, 200, "Books fetched", books);
  } catch (err) {
    return sendResponse(res, 500, "Failed to fetch books", err.message);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
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
 *         description: Book data
 *       404:
 *         description: Book not found
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const book = await getBookById(req.params.id, req.user.id);
    if (!book) return sendResponse(res, 404, "Book not found");
    return sendResponse(res, 200, "Book fetched", book);
  } catch (err) {
    return sendResponse(res, 500, err ?? "Failed to get book");
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
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
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated
 *       400:
 *         description: Update failed
 */
router.put("/:id", auth, async (req, res) => {
  const { title, author } = req.body;

  try {
    const result = await updateBookById(req.params.id, title, author);
    return sendResponse(res, 200, "Book updated", { updated: result });
  } catch (err) {
    return sendResponse(res, 400, "Update failed", err.message);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
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
 *         description: Book deleted
 *       500:
 *         description: Server error
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await deleteBookById(req.params.id);
    return sendResponse(res, 200, "Book deleted", { deleted: result });
  } catch (err) {
    return sendResponse(res, 500, "Delete failed", err.message);
  }
});

module.exports = router;
