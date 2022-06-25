/**
 * POST /login
 * @summary This is the signup endpoint
 * @tags Auth
 * @param {Signup} request.body.required - User credentials - application/json
 * @example request - Valid user
 * {
 *    "username": "Cristian",
 *    "password": "123456"
 * }
 * @example request - Invalid user
 * {
 *    "password": "123456",
 *    "invalid": true
 * }
 * @return 204 - When user was logged in successfully
 * @return {Response} 404 - When user doens't exist - application/json
 * @example response - 404 - Not found
 * {
 *    "message": "User doesn't exist!"
 * }
 * @return {Response} 401 - When password is incorrect - application/json
 * @example response - 401 - Unauthorized
 * {
 *    "message": "Password is incorrrect!"
 * }
 * @return {Response} 409 - When user is already logged in - application/json
 * @example response - 409 - Conflit
 * {
 *    "message": "User is already logged in!"
 * }
 * @return {array<Unprocessable>} 422 - When data schema is invalid - application/json
 * @example response - 422 - Unprocessable Entity
 * [
 *    {
 *      "msg": "Invalid value",
 *      "param": "username",
 *      "location": "body"
 *    },
 *    {
 *      "msg": "Invalid value",
 *      "param": "password",
 *      "location": "body"
 *    }
 * ]
 * @return {Response} 500 - Any error - application/json
 * @example response - 500 - Internal Server Error
 * {
 *    "message": "Error"
 * }
 */
