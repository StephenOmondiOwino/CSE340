const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  )
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
  }
}

/* ***************************
 *  Get a single inventory item by inv_id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error " + error)
  }
}

/* ***************************
 *  Get a vehicle by inv_id (for detail view)
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [inv_id]
    )
    return result.rows[0]
  } catch (error) {
    console.error("getVehicleById error " + error)
  }
}

/* *******************************
 *  Add a new classification
 * ***************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rowCount // > 0 means success
  } catch (error) {
    console.error("addClassification error: " + error)
    return 0
  }
}

/* *******************************
 *  Add new inventory item
 * ***************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, classification_id) {
  try {
    const sql = `INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, classification_id)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`
    const result = await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, classification_id])
    return result.rows[0] // return inserted row
  } catch (error) {
    console.error("addInventory error: " + error)
    return null
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id,
    ])
    return data.rows[0]
  } catch (error) {
    console.error("updateInventory error: " + error)
  }
}

/* ***************************
 *  Exports
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  getVehicleById,
  addClassification,
  addInventory,
  updateInventory
}
// ======================
// Search cars by keyword
// ======================
const searchCars = async (searchTerm) => {
  try {
    const db = await pool.connect()
    const sql = `
      SELECT * FROM public.inventory
      WHERE inv_make ILIKE $1
         OR inv_model ILIKE $1
         OR inv_description ILIKE $1
    `
    const result = await db.query(sql, [`%${searchTerm}%`])
    db.release()
    return result.rows
  } catch (error) {
    console.error('Database error during search:', error)
    throw error
  }
}

module.exports = { 
  // keep your existing exports here
  ...module.exports,
  searchCars
}
