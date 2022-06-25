import request from 'supertest'
import app from '../src/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User, LoginModel } from '../src/models/user.model'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { Channel, Connection } from 'amqplib'
import * as rabbitmq from '../src/config/rabbitmq.config'
import * as redis from '../src/config/redis.config'


interface JWTPayload {
	id: string
}

describe('POST /login', () => {

	let db: MongoMemoryServer
	let mq_channel: Channel
	let mq_connection: Connection
	const test_user: LoginModel = {
		username: 'test_username',
		password: 'test_password'
	}

	beforeAll(async () => {

		db = new MongoMemoryServer()
		await db.start();
		await mongoose.connect(db.getUri())

		await redis.connect()

		mq_connection = await rabbitmq.connect()
		mq_channel = rabbitmq.channel

	})

	beforeEach(async () => {

		const user = new User({
			username: test_user.username,
			password: bcrypt.hashSync(
				test_user.password,
				bcrypt.genSaltSync(14)
			),
			name: 'Test name',
			email: 'test_mail@mail.com'
		})
		await user.save()
	})

	afterEach(async () => {

		await User.deleteMany()
		await redis.client.flushAll()
		await mq_channel.purgeQueue('status')

	})

	afterAll(async () => {

		await mongoose.disconnect()
		await db.stop()
		await redis.client.disconnect()

		await mq_channel.close()
		await mq_connection.close()

	})

	test('Should successfully login with an HTTP code 204', async () => {

		const res = await request(app).post('/login')
			.send(test_user)

		expect(res.statusCode).toBe(204)
		expect(res.headers['authorization']).toBeDefined()

		const token = res.headers['authorization'].split(' ')[1]
		expect(jwt.verify(token, process.env.SECRET_KEY!)).toHaveProperty('id')

		const { id } = jwt.verify(token, process.env.SECRET_KEY!) as JWTPayload
		expect(mongoose.Types.ObjectId.isValid(id))
			.toBeTruthy()

		mq_channel.consume('status', msg => {
			mq_channel.ack(msg!)
			expect(msg?.fields.routingKey).toBe('connect')
			expect(mongoose.Types.ObjectId.isValid(msg?.content.toString()!))
				.toBeTruthy()
		})

	})

	test('Should show that the user is already logged in with an HTTP code 409', async () => {

		await request(app).post('/login')
			.send(test_user)

		const res = await request(app).post('/login')
			.send(test_user)

		expect(res.statusCode).toBe(409)
		expect(res.body).toHaveProperty('message')
		expect(res.body['message']).toBe('User is already logged in!')

	})

	test('Should show that password is invalid with an HTTP code 401', async () => {
		const res = await request(app).post('/login')
			.send({...test_user, password: 'incorrect_password'})

		expect(res.statusCode).toBe(401)
		expect(res.body).toHaveProperty('message')
		expect(res.body['message']).toBe('Password is incorrrect!')

	})

	test('Should show that the user does not exist with an HTTP code 404', async () => {
		const res = await request(app).post('/login')
			.send({ username: 'not_exists', password: 'not_exists'})

		expect(res.statusCode).toBe(404)
		expect(res.body).toHaveProperty('message')
		expect(res.body['message']).toBe('User doesn\'t exist!')

	})

	test('Should show data scheme is wrong with an HTTP code 422', async () => {
		const res = await request(app).post('/login')
			.send({ invalid: 'data' })

		expect(res.statusCode).toBe(422)
		expect(res.body).toBeInstanceOf(Array)

		for (const error of res.body) {
			expect(error).toHaveProperty(
				'msg' 	&& 
				'param' && 
				'location'
			)
		}

	})

})
