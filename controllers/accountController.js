const utilities = require("../utilities/")
const accountModel = require("../models/accountModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

/* ***************************
 * Process Login
 * ************************** */
async function processLogin(req, res) {
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    let nav = await utilities.getNav()
    req.flash("notice", "Invalid email or password.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email, // sticky email
    })
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password)
    if (match) {
      // ✅ Create JWT
      const token = jwt.sign(
        {
          account_id: accountData.account_id,
          account_firstname: accountData.account_firstname,
          account_email: accountData.account_email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      )

      // ✅ Store JWT in cookie
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true on production
        sameSite: "lax",
      })

      // ✅ Flash message stored in session
      req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)
      return res.redirect("/account")
    } else {
      let nav = await utilities.getNav()
      req.flash("notice", "Invalid email or password.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    throw new Error("Access Denied")
  }
}

/* ***************************
 * Logout
 * ************************** */
function logout(req, res) {
  // ✅ Clear JWT cookie
  res.clearCookie("authToken")

  // ✅ Destroy session (removes flash + session data)
  req.session.destroy(() => {
    req.flash("notice", "You have been logged out.")
    res.redirect("/account/login")
  })
}

module.exports = {
  processLogin,
  logout,
}
