const socket = io()

let nickname = prompt('Please enter a nickname') || 'Anonymous user'
const MIN_NAME_LENGTH = 3

while (nickname.length < MIN_NAME_LENGTH) {
	nickname = prompt(
		`Nickname must be longer than ${MIN_NAME_LENGTH} characters`
	)
}

const chatEl = document.querySelector('.chat')
const chatForm = document.querySelector('form')
const chatInput = document.querySelector('form > input')

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
