import request from 'supertest'
import app from '../src/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User, LogoutModel } from '../src/models/user.model'
import * as bcrypt from 'bcrypt'
import { Channel, Connection } from 'amqplib'
import * as rabbitmq from '../src/config/rabbitmq.config'
import * as redis from '../src/config/redis.config'


describe('POST /logout', () => {

	let db: MongoMemoryServer
	let test_user: LogoutModel
	let mq_channel: Channel
	let mq_connection: Connection

	beforeAll(async () => {

		db = new MongoMemoryServer()
		await db.start();
		await mongoose.connect(db.getUri())

		await redis.connect()

		mq_connection = await rabbitmq.connect()
		mq_channel = rabbitmq.channel

	})

	beforeEach(async () => {

		const password = 'test_password'

		const user = new User({
			username: 'test_user',
			password: bcrypt.hashSync(
				password,
				bcrypt.genSaltSync(14)	
			),
			name: 'Test name',
			email: 'test_mail@mail.com',
			connected: true
		})

		const res = await user.save()
		test_user = {
			id: res._id.toString(),
			password
		}

		await redis.client.sAdd(
            'connected_users',
            res._id.toString()
        )
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

	test('Should successfully logout with an HTTP code 204', async () => {

		const res = await request(app).post('/logout')
			.send(test_user)

		expect(res.statusCode).toBe(204)

		mq_channel.consume('status', msg => {
			mq_channel.ack(msg!)
			expect(msg?.fields.routingKey).toBe('disconnect')
			expect(mongoose.Types.ObjectId.isValid(msg?.content.toString()!))
				.toBeTruthy()
		})

	})

	test('Should show that the user does not exist with an HTTP code 404', async () => {

		const res = await request(app).post('/logout')
			.send({ ...test_user, id: new mongoose.Types.ObjectId().toString() })

		expect(res.statusCode).toBe(404)
		expect(res.body).toHaveProperty('message')
		expect(res.body['message']).toBe('User doesn\'t exist')

	})

	test('Should show that the user is not logged in with an HTTP code 409', async () => {

		await redis.client.sRem(
			'connected_users',
			test_user.id
		)

		const res = await request(app).post('/logout')
			.send(test_user)

		expect(res.statusCode).toBe(409)
		expect(res.body).toHaveProperty('message')
		expect(res.body['message']).toBe('User is not logged in!')

	})

	test('Should show that the password is not valid with an HTTP code 401', async () => {

		const res = await request(app).post('/logout')
			.send({...test_user, password: 'incorrect_password'})

		expect(res.statusCode).toBe(401)
		expect(res.body).toHaveProperty('message')
		expect(res.body['message']).toBe('Password is incorrect!')

	})

	test('Should show that the id is not valid with an HTTP code 400', async () => {

		const res = await request(app).post('/logout')
			.send({...test_user, id: 'invalid_id'})

		expect(res.statusCode).toBe(400)
		expect(res.body).toHaveProperty('message')
		expect(res.body['message']).toBe('ID is invalid!')

	})

	test('Should show data scheme is wrong with an HTTP code 422', async () => {
		const res = await request(app).post('/logout')
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
