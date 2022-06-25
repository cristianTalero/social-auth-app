import { config } from 'dotenv'
import { createClient } from 'redis'


export const client = (() => {

  config()

  return createClient({

    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD

  })

})()

export async function connect() {

  client.on('error', err => {

    console.log('Error trying to connect to Redis: ', err)

  })

  await client.connect()
  console.log('Redis works')
  
}
