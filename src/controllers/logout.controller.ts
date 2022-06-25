import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { client } from '../config/redis.config'
import { User, LogoutModel } from '../models/user.model'
import * as bcrypt from 'bcrypt'
import { channel } from '../config/rabbitmq.config'


/** Close the session of the **user**. */
export async function Logout(req: Request, res: Response) {

  try {

    // Validate body schema
    if (!validationResult(req).isEmpty()) {
      return res.status(422).json(validationResult(req).array())
    }

    // Save body data with a model
    const user: LogoutModel = req.body

    // Find user by his ID in cache
    const user_exists_cache = await client.hGet('logout', user.id)

    // If users is not in cache
    if (!user_exists_cache) {

      // Find user in database
      const user_exists_database = await User.findById(user.id).select('password')

      // If user doesn't exists in database
      if (!user_exists_database) {
        return res.status(404).json({
          message: 'User doesn\'t exist'
        })
      }

      // Return data
      var user_data = user_exists_database

      // Save user in cache
      await client.hSet(
        'logout',
        user_exists_database._id.toString(),
        JSON.stringify(user_exists_database)
      )

    }

    // If user exists in cache parse to JSON
    else user_data = JSON.parse(user_exists_cache!)

    // If user is not logged in
    const connected_users = await client.sMembers('connected_users')
    if (!connected_users.includes(user_data._id.toString())) {
      return res.status(409).json({
        message: 'User is not logged in!'
      })
    }

    // Validate password from request
    const valid_password = await bcrypt.compare(user.password, user_data.password)

    // If password is not valid
    if (!valid_password) {
      return res.status(401).json({
        message: 'Password is incorrect!'
      })
    }

    // Set user as "Disconnected"
    await client.sRem('connected_users', user_data._id.toString())

    // Publish "Disconnected" status in RabbitMQ queue
    await channel.assertQueue('status', { durable: true })
    await channel.bindQueue('status', 'auth', 'disconnect')
    channel.publish('auth', 'disconnect', Buffer.from(user_data._id.toString()))

    // Clear cache
    await client.hDel('logout', user_data._id.toString())

    // If logout was successfuly
    return res.sendStatus(204)

  } 
  
  catch (err: any) {

    // If ID is not an ObjectID
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: 'ID is invalid!'
      })
    }

    // Any error
    else return res.status(500).json({ message: err.message })

  }
  
}
