const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += "<li>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        " details'>" +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the vehicle detail HTML
 ************************************** */
Util.buildVehicleDetail = async function (vehicle) {
  let detail = ""
  if (vehicle) {
    detail += '<section class="vehicle-detail">'
    detail +=
      '<img src="' +
      vehicle.inv_image +
      '" alt="Image of ' +
      vehicle.inv_make +
      " " +
      vehicle.inv_model +
      ' on CSE Motors" />'
    detail +=
      "<h2>" +
      vehicle.inv_year +
      " " +
      vehicle.inv_make +
      " " +
      vehicle.inv_model +
      "</h2>"
    detail +=
      "<p><strong>Price:</strong> $" +
      new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
      "</p>"
    detail +=
      "<p><strong>Mileage:</strong> " +
      new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
      " miles</p>"
    detail +=
      "<p><strong>Description:</strong> " +
      vehicle.inv_description +
      "</p>"
    detail += "</section>"
  } else {
    detail = '<p class="notice">Sorry, that vehicle could not be found.</p>'
  }
  return detail
}

/* **************************************
 * Build flash message HTML from session
 ************************************** */
Util.buildFlashMessage = function (req) {
  let message = ""
  if (req.session.message) {
    message = `<div class="flash-message">${req.session.message}</div>`
    delete req.session.message // clear message after showing once
  }
  return message
}

/* **************************************
 * Keep form values sticky
 ************************************** */
Util.sticky = function (field, body) {
  if (body && body[field]) {
    return body[field]
  }
  return ""
}

/* ****************************************
 * Check Login (session-based)
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Check JWT Token (cookie-based)
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.authToken
  if (!token) {
    return next() // no token → continue without blocking
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.clearCookie("authToken")
      req.flash("notice", "Session expired. Please log in again.")
      return res.redirect("/account/login")
    }
    req.user = user
    res.locals.loggedin = true
    next()
  })
}

module.exports = Util
