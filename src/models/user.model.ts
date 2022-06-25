import { Schema, model, Model, Document } from 'mongoose'


export interface SignupModel {
  name: string
  username: string
  email: string
  password: string
}

export type LoginModel = Omit<SignupModel, 'name' | 'email'>

export type LogoutModel = {
  id: string
  password: string
}

interface IUser extends SignupModel, Document {}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, dropDups: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
  },
  {
    timestamps: {
      createdAt: 'created_at', // Use `created_at` to store the created date
      updatedAt: 'updated_at' // and `updated_at` to store the last updated date
    }
  }
)

export const User: Model<IUser> = model<IUser>('User', UserSchema)
