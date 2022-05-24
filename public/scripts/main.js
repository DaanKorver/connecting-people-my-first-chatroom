const socket = io()

let nickname =
	localStorage.getItem('nickname') || prompt('Please enter a nickname')
const MIN_NAME_LENGTH = 3

const chatEl = document.querySelector('.chat')
const chatForm = document.querySelector('form')
const chatInput = document.querySelector('form input')
const connections = document.querySelector('.connections')
const typingEl = document.querySelector('.typing')
const listEl = document.querySelector('.list')

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
	const from = message.nickname === nickname ? 'sent' : 'recieved'
	const user = message.nickname === nickname ? 'Jij' : message.nickname
	const date = new Date()
	const hours = date.getHours() <= 9 ? `0${date.getHours()}` : date.getHours()
	const minutes =
		date.getMinutes() <= 9 ? `0${date.getMinutes()}` : date.getMinutes()
	const time = `${hours}:${minutes}`
	chatEl.insertAdjacentHTML(
		'beforeend',
		`
		<li class="${from}">
			<span>${user}</span>
			<div class="msg">
				<p>${message.value}</p>
				<span>${time}</span>
			</div>
		</li>
	`
	)
	chatEl.scrollTo(0, chatEl.scrollHeight)
})

socket.on('disconnected', user => {
	renderConnection(false, user)
})

socket.on('connected', user => {
	// if (nickname === user) return
	renderConnection(true, user)
})

socket.on('typing', renderTyping)
socket.on('stop-typing', renderTyping)

socket.on('update-list', users => {
	listEl.innerHTML = ''
	const userList = Object.values(users)
	if (userList.length === 1 && userList[0] === nickname) {
		listEl.insertAdjacentHTML('beforeend', `<p>Je bent helemaal alleen...</p>`)
	} else {
		userList.forEach(user => {
			listEl.insertAdjacentHTML('beforeend', `<li>${user}</li>`)
		})
	}
})

function renderConnection(connected, user) {
	if (user === nickname) return
	const msg = connected
		? 'is met de chat verbonden, welkom!'
		: 'heeft de chat verlaten.'
	chatEl.insertAdjacentHTML(
		'beforeend',
		`<li class="connection">${user} ${msg}</li>`
	)
	chatEl.scrollTo(0, chatEl.scrollHeight)
}

function renderTyping(users) {
	let typingString = ''
	switch (true) {
		case users.length === 1:
			if (users[0] === nickname) return
			typingString = `${users[0]} is aan 't typen...`
			break
		case users.length === 2:
			typingString = `${users[0]} & ${users[1]} zijn aan het typen...`
			break
		case users.length > 2:
			typingString = 'Meerdere personen zijn aan het typen...'
			break
		default:
			typingString = ''
	}
	typingEl.innerText = typingString
}
