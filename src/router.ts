import { Router } from 'express'
import { body } from 'express-validator'
import { Login } from './controllers/login.controller'
import { Signup } from './controllers/signup.controller'
import { Logout } from './controllers/logout.controller'


// Default router
const router: Router = Router()


// Login endpoint
router.post(
  '/login',
  body('username').exists(),
  body('password').exists(),
  Login
)

// Signup endpoint
router.post(
  '/signup',
  body('name').exists(),
  body('username').exists(),
  body('email').exists(),
  body('password').exists(),
  Signup
)


// Logout endpoint
router.post(
  '/logout',
  body('id').exists(),
  body('password').exists(),
  Logout
)


export default router
