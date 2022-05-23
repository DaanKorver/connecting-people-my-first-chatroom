const socket = io()

let nickname = prompt('Please enter a nickname')
const MIN_NAME_LENGTH = 3

const chatEl = document.querySelector('.chat')
const chatForm = document.querySelector('form')
const chatInput = document.querySelector('form > input')
const connections = document.querySelector('.connections')

while (nickname === null || nickname.length < MIN_NAME_LENGTH) {
	nickname = prompt(
		`Nickname must be longer than ${MIN_NAME_LENGTH} characters`
	)
}

chatForm.addEventListener('submit', e => {
	e.preventDefault()
	if (chatInput.value === '') return
	socket.emit('message', chatInput.value)
	chatInput.value = ''
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
