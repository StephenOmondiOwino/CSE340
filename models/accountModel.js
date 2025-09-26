const pool = require("../database")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account 
      (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *`
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ])
    return result.rows[0]  // return new account record
  } catch (error) {
    console.error("registerAccount error:", error.message)
    return null
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount  // 0 = not found, 1 = exists
  } catch (error) {
    console.error("checkExistingEmail error:", error.message)
    return null
  }
}

/* **********************
 *   Get account by email (for login)
 * ********************* */
async function getAccountByEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rows[0]  // returns the account row or undefined
  } catch (error) {
    console.error("getAccountByEmail error:", error.message)
    return null
  }
}

module.exports = { 
  registerAccount, 
  checkExistingEmail, 
  getAccountByEmail 
}
