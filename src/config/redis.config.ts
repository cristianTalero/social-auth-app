import { config } from 'dotenv'
import { createClient } from 'redis'


export const client = (() => {

  config()

  return createClient({

    url: process.env.REDIS_URL,
    database: parseInt(process.env.REDIS_DATABASE!, 10),
    password: process.env.REDIS_PASSWORD

  })

})()

export async function connect() {

  client.on('error', err => {

    console.log('Redis error', err)

  })

  await client.connect()
  console.log('Redis works')
  
}
