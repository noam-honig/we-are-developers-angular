import express from 'express'
import { remultExpress } from 'remult/remult-express'
import { Task } from '../shared/task'
import { TasksController } from '../shared/tasksController'
import { createPostgresDataProvider } from 'remult/postgres'

const app = express()
app.get('/api/hi', (req, res) => res.send('Hello we are developers'))

//#region auth
import session from 'cookie-session'
import type { UserInfo } from 'remult'

app.use(
  '/api',
  session({ secret: process.env['SESSION_SECRET'] || 'my secret' })
)

export const validUsers: UserInfo[] = [
  { id: '1', name: 'Jane', roles: ['admin'] },
  { id: '2', name: 'Steve' },
]
app.post(
  '/api/signIn',
  express.json({ type: ['text', 'json'] }),
  (req, res) => {
    const user = validUsers.find((user) => user.name === req.body.username)
    if (user) {
      req.session!['user'] = user
      res.json(user)
    } else {
      res.status(404).json("Invalid user, try 'Steve' or 'Jane'")
    }
  }
)
app.post('/api/signOut', (req, res) => {
  req.session!['user'] = null
  res.json('signed out')
})

app.get('/api/currentUser', (req, res) => {
  res.json(req.session!['user'])
})
//#endregion

const api = remultExpress({
  entities: [Task],
  controllers: [TasksController],
  dataProvider: createPostgresDataProvider({
    connectionString:
      process.env['DATABASE_URL'] ||
      'postgres://postgres:MASTERKEY@localhost/postgres',
  }),
  getUser: (req) => req.session!['user'],
})
app.use(api)

import swaggerUi from 'swagger-ui-express'

const openApiDocument = api.openApiDoc({ title: 'remult-react-todo' })
app.get('/api/openApi.json', (req, res) => res.json(openApiDocument))
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

import { remultGraphql } from 'remult/graphql'
import { createYoga, createSchema } from 'graphql-yoga'

const { typeDefs, resolvers } = remultGraphql({
  entities: [Task],
})
app.use('/api/graphql', [
  api.withRemult,
  createYoga({
    graphiql: true,
    schema: createSchema({
      typeDefs,
      resolvers,
    }),
  }),
])

const frontendFiles = process.cwd() + '/dist/angular-todo'
app.use(express.static(frontendFiles))
app.get('/*', (_, res) => {
  res.sendFile(frontendFiles + '/index.html')
})

app.listen(process.env['PORT'] || 3002, () => console.log('Server started'))
