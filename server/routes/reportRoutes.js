const express = require("express");
const router = express.Router();
const { getOverallReport } = require("../controllers/reportController");
const auth = require("../middlewares/authMiddleware");

router.get("/overall", auth, getOverallReport);

module.exports = router;
