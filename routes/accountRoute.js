const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const { checkAuth } = require("../utilities/auth")
const utilities = require("../utilities/")

// login form
router.get("/login", async (req, res) => {
  let nav = await utilities.getNav()
  res.render("account/login", { title: "Login", nav })
})

// login process
router.post("/login", accountController.processLogin)

// logout
router.get("/logout", accountController.logout)

// protected dashboard
router.get("/", checkAuth, async (req, res) => {
  let nav = await utilities.getNav()
  res.render("account/dashboard", {
    title: "Account Dashboard",
    nav,
    user: req.user, // from JWT
  })
})

module.exports = router
