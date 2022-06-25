import app from './app'
import * as db from './config/database.config'
import * as redis from './config/redis.config'
import * as rabbitmq from './config/rabbitmq.config'


// Initialize app
app.listen(7000, async () => {

  await db.connect()
  await redis.connect()
  await rabbitmq.connect()

  console.log('Server runs')
  
})
