import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { User, SignupModel } from '../models/user.model'
import * as bcrypt from 'bcrypt'


/** Create an **account** in to the application. */
export async function Signup(req: Request, res: Response) {

  try {

    // Validate body schema
    if (!validationResult(req).isEmpty()) {
      return res.status(422).json(validationResult(req).array())
    }

    // Save body data with a model
    const user: SignupModel = req.body

    // Hash the password
    const hashed_pasword = await bcrypt.hash(
      user.password,
      await bcrypt.genSalt(14)
    )

    // Set password with generated hash
    user.password = hashed_pasword

    // Create user
    await new User(user).save()

    // If signup was successfully
    return res.sendStatus(201)

  }
  
  catch (err: any) {

    // If user already exists
    if (err.name === 'MongoServerError') {
      return res.status(409).json({
        message: 'User already exists!'
      })
    }

    // Any error
    else return res.status(500).json({ message: err.message })

  }
  
}
