/**
 * POST /logout
 * @summary This is the logout endpoint
 * @tags Auth
 * @param {Logout} request.body.required - User credentials - application/json
 * @example request - Valid user
 * {
 *    "id": "507f1f77bcf86cd799439011",
 *    "password": "123456"
 * }
 * @example request - Invalid user
 * {
 *    "id": "123456",
 *    "invalid": true
 * }
 * @return 204 - When logout was successfully
 * @return {Response} 500 - When any error happens - application/json
 * @example response - 500 - Internal Server Error
 * {
 *    "message": "Error"
 * }
 * @return {Response} 400 - When ID is invalid - application/json
 * @example response - 400 - Bad Request
 * {
 *    "message": "ID is invalid"
 * }
 * @return {Response} 401 - When password is incorrect - application/json
 * @example response - 401 - Unauthorized
 * {
 *    "message": "Password is incorrect!"
 * }
 * @return {Response} 409 - When user is not logged in - application/json
 * @example response - 409 - Conflict
 * {
 *    "message": "User is not logged in!"
 * }
 * @return {Response} 404 - When user doesn't exists - application/json
 * @example response - 404 - Not Found
 * {
 *    "message": "User doesn't exist"
 * }
 * @return {array<Unprocessable>} 422 - When data schema is invalid - application/json
 * @example response - 422 - Unprocessable Entity
 * [
 *    {
 *      "msg": "Invalid value",
 *      "param": "id",
 *      "location": "body"
 *    },
 *    {
 *      "msg": "Invalid value",
 *      "param": "password",
 *      "location": "body"
 *    }
 * ]
 */
