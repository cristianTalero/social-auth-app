import request from 'supertest'
import app from '../src/app'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User, SignupModel } from '../src/models/user.model'


describe('POST /signup', () => {

	let db: MongoMemoryServer
	const test_user: SignupModel = {
		username: 'test_username',
		password: 'test_password',
		name: 'Test name',
		email: 'test_mail@mail.com'
	}

	beforeAll(async () => {
		db = new MongoMemoryServer()
		await db.start();
		
		await mongoose.connect(db.getUri())
	})

	afterEach(async () => {

		await User.deleteMany()

	})

	afterAll(async () => {

		await mongoose.disconnect()
		await db.stop()

	})

	test('Should successfully create an account with an HTTP code 201', async () => {

		const res = await request(app).post('/signup')
			.send(test_user)

		expect(res.statusCode).toBe(201)

	})

	test('Should show that the user already exists with an HTTP code 409', async () => {

		await request(app).post('/signup')
			.send(test_user)

		const res = await request(app).post('/signup')
			.send(test_user)

		expect(res.statusCode).toBe(409)
		expect(res.body).toHaveProperty('message')
		expect(res.body['message']).toBe('User already exists!')

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
