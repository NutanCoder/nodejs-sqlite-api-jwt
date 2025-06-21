function sendResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    data: data,
  });
}

module.exports = { sendResponse };
