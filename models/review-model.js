const pool = require("../database/")

// Add a new review
async function addReview(account_id, inv_id, review_text) {
  try {
    const sql = `INSERT INTO public.reviews (account_id, inv_id, review_text)
                 VALUES ($1, $2, $3)
                 RETURNING *`
    const result = await pool.query(sql, [account_id, inv_id, review_text])
    return result.rows[0]
  } catch (error) {
    console.error("Error adding review:", error)
    throw error
  }
}

// Get all reviews for a vehicle
async function getReviewsByVehicle(inv_id) {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname
                 FROM public.reviews AS r
                 JOIN public.account AS a ON r.account_id = a.account_id
                 WHERE r.inv_id = $1
                 ORDER BY r.review_date DESC`
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("Error fetching reviews:", error)
    throw error
  }
}

module.exports = { addReview, getReviewsByVehicle }
