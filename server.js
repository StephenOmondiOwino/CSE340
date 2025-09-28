/* ***********************
 * Require Statements
 *************************/
const accountRoute = require("./routes/accountRoute")
const session = require("express-session")
const pool = require("./database/") // your pg pool
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const utilities = require("./utilities/")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")

// ✅ NEW
const cookieParser = require("cookie-parser")

/* ***********************
 * Express Setup
 *************************/
const app = express()

/* ***********************
 * Cookie Parser
 *************************/
app.use(cookieParser())

/* ***********************
 * Session Middleware
 *************************/
const pgSession = require("connect-pg-simple")(session)

app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "devFallbackSecret123!",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
)

// Express Messages Middleware
app.use(require("connect-flash")())
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

/* View engine and Template */
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// Public assets
app.use(express.static("public"))

// Middleware for form + JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ***********************
 * JWT Middleware
 *************************/
// ✅ This checks for a valid JWT if present
app.use(utilities.checkJWTToken)

/* ***********************
 * Routes
 *************************/
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

/* ***********************
 * File Not Found Route
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Express Error Handler
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
 *************************/
const port = process.env.PORT
const host = process.env.HOST

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
