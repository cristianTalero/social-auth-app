import mongoose from 'mongoose'


/** Default MongoDB connection */
export async function connect() {

  try {

    await mongoose.connect(process.env.DATABASE_URL!, {
      retryWrites: true,
      w: 'majority',
      dbName: process.env.DATABASE_NAME
    })

    console.log('MongoDB works')

  } 
  
  catch (err) {

    console.log('Error while trying to connect to database', err)

  }
  
}
