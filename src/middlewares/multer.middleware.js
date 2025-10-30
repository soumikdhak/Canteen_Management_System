// middlewares/multer.middleware.js
import multer from "multer";

const storage = multer.memoryStorage(); // keeps file in memory as buffer

// No file filter (accept all)
const upload = multer({
  storage,
});

export default upload;
