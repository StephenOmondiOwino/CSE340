const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const invCont = {}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0] && invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildById = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const data = await invModel.getVehicleById(inv_id)
    const nav = await utilities.getNav()

    if (data) {
      res.render("inventory/detail", {
        title: `${data.inv_make} ${data.inv_model}`,
        nav,
        inv: data,
        errors: null,
      })
    } else {
      next({ status: 404, message: "Vehicle not found" })
    }
  } catch (error) {
    console.error("Error in buildById controller:", error)
    next(error)
  }
}

/* ****************************************
 *  Search cars controller
 * *************************************** */
invCont.searchCars = async function (req, res, next) {
  try {
    const searchTerm = req.query.q?.trim()

    if (!searchTerm || searchTerm.length < 2) {
      let nav = await utilities.getNav()
      return res.render("inventory/search-results", {
        title: "Search Results",
        message: "Please enter at least 2 characters to search.",
        nav,
        cars: [],
      })
    }

    const cars = await invModel.searchCars(searchTerm)
    let nav = await utilities.getNav()

    if (cars.length === 0) {
      return res.render("inventory/search-results", {
        title: "Search Results",
        message: `No results found for "${searchTerm}".`,
        nav,
        cars: [],
      })
    }

    res.render("inventory/search-results", {
      title: `Search Results for "${searchTerm}"`,
      nav,
      cars,
      message: null,
    })
  } catch (error) {
    console.error("Search controller error:", error)
    next(error)
  }
}

module.exports = invCont



