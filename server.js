/******************************************
 * This server.js file is the primary file of the 
 * application. It controls the entire CSE 340 project.
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)
const expressLayouts = require("express-ejs-layouts")
const flash = require("connect-flash")
const messages = require("express-messages")
const dotenv = require("dotenv")
const path = require("path")

// Load environment variables
dotenv.config()

// Database pool
const pool = require("./database/")

// Route modules
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")

// Utilities (used in error handler)
const utilities = require("./utilities/")

// App init
const app = express()

/* ***********************
 * Session Middleware
 *************************/
app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
  })
)

/* ***********************
 * View Engine and Layouts
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Express Flash Messages
 *************************/
app.use(flash())
app.use(function (req, res, next) {
  res.locals.messages = messages(req, res)
  next()
})

/* ***********************
 * Static and Route Middleware
 *************************/
app.use(express.static(path.join(__dirname, "public")))
app.use(static)
app.use("/inv", inventoryRoute)

/* ***********************
 * Error Handlers
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at "${req.originalUrl}": ${err.message}`)
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message: err.message,
    nav,
  })
})

// 404 Handler
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Server Init
 *************************/
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || "localhost"

app.listen(PORT, () => {
  console.log(`App listening on ${HOST}:${PORT}`)
})
