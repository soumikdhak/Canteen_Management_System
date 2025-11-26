const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {

    // Mongo duplicate key error (email, phone, username, etc.)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate value entered",
        field: Object.keys(error.keyPattern)[0]
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      errors: error.errors || []
    });
  }
};

export { asyncHandler };
