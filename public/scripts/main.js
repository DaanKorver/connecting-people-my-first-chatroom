const socket = io()

let nickname =
	localStorage.getItem('nickname') || prompt('Please enter a nickname')
const MIN_NAME_LENGTH = 3

const chatEl = document.querySelector('.chat')
const chatForm = document.querySelector('form')
const chatInput = document.querySelector('form > input')
const connections = document.querySelector('.connections')
const typingEl = document.querySelector('.typing')

while (nickname === null || nickname.length < MIN_NAME_LENGTH) {
	nickname = prompt(
		`Nickname must be longer than ${MIN_NAME_LENGTH} characters`
	)
}

localStorage.setItem('nickname', nickname)

chatForm.addEventListener('submit', e => {
	e.preventDefault()
	if (chatInput.value === '') return
	socket.emit('message', chatInput.value)
	chatInput.value = ''
})

let isTyping = false
chatInput.addEventListener('keyup', () => {
	if (!isTyping && chatInput.value !== '') {
		isTyping = true
		socket.emit('start-typing')
	} else if (isTyping && chatInput.value == '') {
		isTyping = false
		socket.emit('stop-typing')
	}
})

//Socket io stuff
socket.emit('send-nickname', nickname)

socket.on('message', message => {
	chatEl.insertAdjacentHTML(
		'beforeend',
		`<li>${message.nickname} : ${message.value}</li>`
	)
	console.log(message)
})

socket.on('disconnected', user => {
	renderConnection(false, user)
})

socket.on('connected', user => {
	if (nickname === user) return
	renderConnection(true, user)
})

socket.on('typing', renderTyping)
socket.on('stop-typing', renderTyping)

function renderConnection(connected, user) {
	const msg = connected ? 'connected' : 'disconnected'
	connections.insertAdjacentHTML(
		'beforeend',
		`<li class="${user}${msg}">${user} ${msg}</li>`
	)
	setTimeout(() => {
		connections.querySelector(`.${user}${msg}`).remove()
	}, 1200)
}

function renderTyping(users) {
	let typingString = ''
	console.log(users.length)
	switch (true) {
		case users.length === 1:
			typingString = `${users[0]} is typing...`
			break
		case users.length === 2:
			typingString = `${users[0]} & ${users[1]} are typing...`
			break
		case users.length > 2:
			typingString = 'Multiple people are typing...'
			break
		default:
			console.log('should be here')
			typingString = ''
	}
	typingEl.innerText = typingString
}
