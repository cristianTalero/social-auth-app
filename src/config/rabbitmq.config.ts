import * as amqp from 'amqplib'


export let channel: amqp.Channel

export async function connect() {
    const user = process.env.RABBITMQ_USER
    const pass = process.env.RABBITMQ_PASS


    const conn = await amqp.connect(`amqp://${user}:${pass}@localhost`, {
        clientProperties: {
            connection_name: 'auth-service'
        }
    })

    conn.on('error', err => {

        console.log('Error trying to connect to RabbitMQ: ', err)

    })

    channel = await conn.createChannel()
    await channel.assertExchange (
        'auth',
        'direct',
        { durable: true }
    )
    console.log('RabbitMQ works')

    return conn
}