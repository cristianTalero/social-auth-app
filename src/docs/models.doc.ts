/**
 * @description Signup model
 * @typedef {object} Signup
 * @property {string} name.required
 * @property {string} username.required
 * @property {string} email.required
 * @property {string} password.required
 */

/**
 * @description Login model
 * @typedef {object} Login
 * @property {string} username.required
 * @property {string} password.required
 */

/**
 * @description Logout model
 * @typedef {object} Logout
 * @property {string} id.required
 * @property {string} password.required
 */

/**
 *  Default Response
 *  
 *  @typedef {object} Response
 *  @property {string} message
 *
 */

/**
 *  Unprocessable Entity Response
 *  
 *  @typedef {object} Unprocessable
 *  @property {string} msg
 *  @property {string} param
 *  @property {string} location
 */
