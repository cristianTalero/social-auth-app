import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { User, LoginModel } from '../models/user.model'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { client } from '../config/redis.config'
import { channel } from '../config/rabbitmq.config'


/** Login in to the application. Create a new **session**. */
export async function Login(req: Request, res: Response) {

  try {

    // Validate body schema
    if (!validationResult(req).isEmpty()) {
      return res.status(422).json(validationResult(req).array())
    }

    // Save body data with a model
    const user: LoginModel = req.body

    // Find user by his username in cache
    const user_exists_cache = await client.hGet('login', user.username)

    // If users is not in cache
    if (!user_exists_cache) {

      // Find user in database
      const user_exists_database = await User.findOne({ username: user.username }).select('username password')

      // If user doesn't exist in database
      if (!user_exists_database) {
        return res.status(404).json({
          message: 'User doesn\'t exist!'
        })
      }

      // Return data
      var user_data = user_exists_database

      // Save user in cache
      await client.hSet(
        'login',
        user_exists_database.username,
        JSON.stringify(user_exists_database)
      )

    }

    // If user exists in cache parse to JSON
    else user_data = JSON.parse(user_exists_cache!)

    // Validate password with hash
    const valid_password = await bcrypt.compare(user.password, user_data.password)

    // If password is not valid
    if (!valid_password) {
      return res.status(401).json({
        message: 'Password is incorrrect!'
      })
    }

    // If user is already logged
    const connected_users = await client.sMembers('connected_users')
    if (connected_users.includes(user_data._id.toString())) {
      return res.status(409).json({
        message: 'User is already logged in!'
      })
    }

    // Set user as "Connected"
    await client.sAdd(
      'connected_users',
      user_data._id.toString()
    )

    // Publish "Connected" status in RabbitMQ queue
    await channel.assertQueue('status', { durable: true })
    await channel.bindQueue('status', 'auth', 'connect')
    channel.publish('auth', 'connect', Buffer.from(user_data._id.toString()))

    // Create a new JWT to send to user
    const token = jwt.sign({ id: user_data._id }, process.env.SECRET_KEY!)

    // If login was successfully
    return res.header('Authorization', `Bearer ${token}`).sendStatus(204)

  }

  catch (err: any) {

    // Any error
    return res.status(500).json({ message: err.message })

  }

}
