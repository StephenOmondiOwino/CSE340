const jwt = require("jsonwebtoken")

function checkAuth(req, res, next) {
  const token = req.cookies.authToken
  if (!token) {
    req.flash("notice", "Please log in first.")
    return res.redirect("/account/login")
  }

  try {
    // ✅ Verify token with secret
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // ✅ Attach decoded user info to request (available in routes/views)
    req.user = decoded
    next()
  } catch (err) {
    console.error("JWT error:", err)
    res.clearCookie("authToken")
    req.flash("notice", "Session expired. Please log in again.")
    return res.redirect("/account/login")
  }
}

module.exports = { checkAuth }
