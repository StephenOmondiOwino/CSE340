// accountRoute.js
const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/accountValidation")

// Default route (login view)
router.get("/", accountController.buildLogin)

// Registration view
router.get("/register", accountController.buildRegister)

// Process Registration
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  accountController.registerAccount
)

// Login view
router.get("/login", accountController.buildLogin)

// Process Login
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  accountController.accountLogin
)

module.exports = router

