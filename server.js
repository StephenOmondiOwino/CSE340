/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const accountRoute = require("./routes/accountRoute")
const session = require("express-session")
const pool = require("./database/") // your pg pool
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const utilities = require("./utilities/")   // utilities with handleErrors
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")

/* ***********************
 * Express Setup
 *************************/
const app = express()
/* ***********************
 * Session Middleware
 *************************/
const pgSession = require('connect-pg-simple')(session)

app.use(
  session({
    store: new pgSession({
      pool,               // your PostgreSQL pool
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'devFallbackSecret123!', // fallback for local/dev
    resave: false,                  // recommended
    saveUninitialized: false,       // recommended
    name: 'sessionId',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,  // 1 day
      secure: process.env.NODE_ENV === 'production', // only send over HTTPS in prod
      sameSite: 'lax',
    },
  })
)

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* View engine and Template */
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

// Make "public" folder available for CSS, images, JS
app.use(express.static("public"))

// ✅ NEW: Middleware to handle POST form input
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ***********************
 * Routes
 *************************/
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

/* ***********************
 * File Not Found Route - must be last before error handler
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  let message
  if (err.status === 404) {
    message = err.message
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?"
  }

  res.status(err.status || 500)
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
