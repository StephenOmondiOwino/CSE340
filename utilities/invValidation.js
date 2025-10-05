const { body, validationResult } = require("express-validator")
const utilities = require(".") // utilities index

const validate = {}

/* classification rules */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification is required and must contain only letters and numbers (no spaces)."),
  ]
}

validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name: req.body.classification_name,
    })
  }
  next()
}

/* inventory rules */
validate.inventoryRules = () => {
  return [
    body("classification_id").notEmpty().withMessage("Please select a classification."),
    body("inv_make").trim().isLength({ min: 1 }).withMessage("Make is required."),
    body("inv_model").trim().isLength({ min: 1 }).withMessage("Model is required."),
    body("inv_year").isInt({ min: 1886 }).withMessage("Enter a valid year."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Enter a valid price."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Enter valid mileage."),
    body("inv_image").trim().isLength({ min: 1 }).withMessage("Image path required."),
    body("inv_thumbnail").trim().isLength({ min: 1 }).withMessage("Thumbnail path required."),
    body("inv_description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters."),
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
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

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
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
  next()
}
validate.newInventoryRules = () => {
  return validate.inventoryRules()
}
validate.checkUpdateData = validate.checkInventoryData


module.exports = validate
