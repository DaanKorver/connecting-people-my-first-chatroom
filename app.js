const express = require('express')
const compression = require('express-compression')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const PORT = process.env.PORT || 8000

app.use(compression())
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', 'public/views')

app.get('/', (req, res) => {
	res.render('index')
})

// Socket io stuff

const users = {}

io.on('connection', socket => {
	socket.on('send-nickname', nickname => {
		socket.nickname = nickname
		users[socket.id] = nickname
	})

	socket.on('message', message => {
		io.emit('message', { value: message, nickname: socket.nickname })
	})
})

server.listen(PORT, () => {
	console.log(`listening on http://localhost:${PORT}`)
})
