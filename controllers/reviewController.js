const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

// Process new review submission
async function addReview(req, res, next) {
  try {
    const { inv_id, review_text } = req.body
    const account_id = res.locals.accountData.account_id

    if (!review_text.trim()) {
      req.flash("error", "Review cannot be empty.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    await reviewModel.addReview(account_id, inv_id, review_text)
    req.flash("notice", "Review added successfully.")
    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    console.error("Error adding review:", error)
    next(error)
  }
}

module.exports = { addReview }
