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
let typingUsers = []

io.on('connection', socket => {
	socket.on('send-nickname', nickname => {
		socket.nickname = nickname
		users[socket.id] = nickname
		io.emit('connected', users[socket.id])
		io.emit('typing', typingUsers)
	})

	socket.on('message', message => {
		io.emit('message', { value: message, nickname: socket.nickname })
	})

	socket.on('disconnect', () => {
		io.emit('disconnected', users[socket.id])
		const typeIndex = typingUsers.indexOf(users[socket.id])
		if (typeIndex) {
			typingUsers.splice(typingUsers.indexOf(users[socket.id]), 1)
			io.emit('stop-typing', typingUsers)
		}
	})

	socket.on('start-typing', () => {
		typingUsers.push(users[socket.id])
		io.emit('typing', typingUsers)
		console.log(users[socket.id], ' is typing...')
	})

	socket.on('stop-typing', () => {
		typingUsers.splice(typingUsers.indexOf(users[socket.id]), 1)
		io.emit('stop-typing', typingUsers)
		console.log(users[socket.id], ' stopped typing.')
	})
})

server.listen(PORT, () => {
	console.log(`listening on http://localhost:${PORT}`)
})
