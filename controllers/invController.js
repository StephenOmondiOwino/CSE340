const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* Management view */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  })
}

/* Show add-classification form */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: "",
  })
}

/* Process add-classification */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)

  if (result) {
    // rebuild nav so new item shows immediately
    let nav = await utilities.getNav()
    req.flash("notice", `Classification "${classification_name}" added.`)
    res.render("inventory/management", { title: "Inventory Management", nav, errors: null })
  } else {
    let nav = await utilities.getNav()
    req.flash("notice", "Sorry, adding classification failed.")
    res.render("inventory/add-classification", { title: "Add Classification", nav, errors: null, classification_name })
  }
}

/* Show add-inventory form */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    errors: null,
    classificationList,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_price: "",
    inv_miles: "",
    inv_image: "/images/no-image.png",
    inv_thumbnail: "/images/no-image-tn.png",
    inv_description: "",
  })
}

/* Process add-inventory */
invCont.addInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_miles,
    inv_image,
    inv_thumbnail,
    inv_description,
  } = req.body

  const newItem = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    classification_id
  )

  if (newItem) {
    let nav = await utilities.getNav()
    req.flash("notice", `${inv_make} ${inv_model} added.`)
    res.render("inventory/management", { title: "Inventory Management", nav, errors: null })
  } else {
    let nav = await utilities.getNav()
    req.flash("notice", "Sorry, adding the vehicle failed.")
    // rebuild classification list with the selected id to keep sticky selector
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_image,
      inv_thumbnail,
      inv_description,
    })
  }
}

/* existing buildByClassificationId should remain (your earlier code) */

module.exports = invCont
