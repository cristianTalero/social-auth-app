import app from './app'
import * as db from './config/database.config'
import * as redis from './config/redis.config'


// Initialize app
app.listen(5000, async () => {

  await db.connect()
  await redis.connect()

  console.log('Server runs')
  
})
