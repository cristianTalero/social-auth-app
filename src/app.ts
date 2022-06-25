import express, { Express } from 'express'
import router from './router'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import expressJSDocSwagger from 'express-jsdoc-swagger'
import { config } from 'dotenv'


// Environment
config()

const app: Express = express()


// Middlewares
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true
  })
)

// Router
app.use(router)

// Production
if (process.env.NODE_ENV !== 'production') {

  // Request middleware
  app.use(morgan('tiny'))

  // API Documentation
  const openAPI = {
    info: {
      version: '1.0.0',
      title: 'Authentication service',
      description: 'This service handles authentication'
    },
    baseDir: __dirname,
    filesPattern: './**/*.ts',
    swaggerUIPath: '/api-docs',
    exposeSwaggerUI: true,
    exposeApiDocs: true,
    apiDocsPath: '/v3/api-docs',
    notRequiredAsNullable: false,
    swaggerUiOptions: {},
  }

  expressJSDocSwagger(app)(openAPI)

}


export default app
