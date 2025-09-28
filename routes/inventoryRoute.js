const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const invValidate = require("../utilities/invValidation")
const utilities = require("../utilities")
const pool = require("../database/") // keep only one require here

// Management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// Add classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Add inventory form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// existing inventory by classification route
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// TEMPORARY ROUTE: Show all classifications and vehicles
router.get("/test/all", async (req, res) => {
  try {
    const classifications = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_id"
    )
    const vehicles = await pool.query(
      "SELECT inv_id, inv_make, inv_model, classification_id FROM public.inventory ORDER BY inv_id"
    )

    let html = "<h1>Classifications</h1><ul>"
    classifications.rows.forEach((c) => {
      html += `<li>ID: ${c.classification_id} - ${c.classification_name}</li>`
    })
    html += "</ul>"

    html += "<h1>Vehicles</h1><ul>"
    vehicles.rows.forEach((v) => {
      html += `<li>ID: ${v.inv_id} - ${v.inv_make} ${v.inv_model} (classification_id: ${v.classification_id})</li>`
    })
    html += "</ul>"

    res.send(html)
  } catch (err) {
    console.error(err)
    res.status(500).send("Error fetching data")
  }
  // Return inventory JSON for classification
router.get("/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON)
)
/* ***********************
 * Route to edit inventory item
 ************************ */
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
)
// Update inventory route
router.post(
  "/update/",
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  invController.updateInventory
)


})

module.exports = router
