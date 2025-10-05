const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")

// POST route to add a new review
router.post(
  "/add",
  utilities.checkLogin, // ensure user is logged in
  reviewController.addReview
)

module.exports = router
