/**
 * POST /signup
 * @summary This is the login endpoint
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
 * @return 201 - When user was created successfully
 * @return {Response} 409 - When user already exists - application/json
 * @example response - 409 - Conflict
 * {
 *    "message": "User already exists!"
 * }
 * @return {array<Unprocessable>} 422 - When data schema is invalid - application/json
 * @example response - 422 - Unprocessable Entity
 * [
 *    {
 *      "msg": "Invalid value",
 *      "param": "name",
 *      "location": "body"
 *    },
 *    {
 *      "msg": "Invalid value",
 *      "param": "username",
 *      "location": "body"
 *    },
 *    {
 *      "msg": "Invalid value",
 *      "param": "email",
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
