FROM node:alpine

RUN mkdir -p app

WORKDIR /app

COPY . .

ENV NODE_ENV 'production'
ENV DATABASE_URL 'mongodb+srv://admin:admin@cluster0.mbah9.mongodb.net/'
ENV DATABASE_NAME 'social-app'
ENV SECRET_KEY 'kjhds57fg687j6gffdhdf68h7fdh8yaY98Y8Yiy7796t7969OY8iddg88HJ'
ENV REDIS_URL 'redis://redis:6379'
ENV REDIS_DATABASE 0
ENV REDIS_PASSWORD 'contraseñaderedis.123456'

EXPOSE 5000

RUN npm install -g npm@
RUN npm install