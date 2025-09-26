// accountController.js
const utilities = require("../utilities/")
const accountModel = require("../models/accountModel")
const bcrypt = require("bcryptjs")

/* ***************************
 * Deliver Login View
 * ************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: "",
  })
}

/* ***************************
 * Deliver Registration View
 * ************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: "",
    account_lastname: "",
    account_email: "",
  })
}

/* ***************************
 * Process Registration
 * ************************** */
async function registerAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    res.status(500).send("Error hashing password.")
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    let nav = await utilities.getNav()
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: account_email, // sticky email
    })
  } else {
    let nav = await utilities.getNav()
    req.flash("notice", "Sorry, registration failed.")
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ***************************
 * Process Login
 * ************************** */
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    let nav = await utilities.getNav()
    req.flash("notice", "Invalid email or password.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email, // sticky email
    })
    return
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password)
    if (match) {
      req.flash("notice", `Welcome back, ${accountData.account_firstname}`)
      res.redirect("/") // redirect to homepage/dashboard
    } else {
      let nav = await utilities.getNav()
      req.flash("notice", "Invalid email or password.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email, // sticky email
      })
    }
  } catch (error) {
    throw new Error("Access Denied")
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin }
