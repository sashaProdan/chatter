const socket = io()

// Elements
const $messageForm = document.querySelector('form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.getElementById('location')
const $messages = document.getElementById('messages')
const $chatSidebar = document.getElementById('sidebar')

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild
  
  // Height of a new message
  const newMesageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMesageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const contentHeight = $messages.scrollHeight

  // How far have I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (contentHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }

  console.log(newMessageMargin)
}

socket.on('locationMessage', (location) => {
  console.log(location)
  const html = Mustache.render(locationMessageTemplate, {
      username: location.username,
      url: location.url,
      createdAt: moment(location.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users 
  })
  $chatSidebar.innerHTML = html
})

socket.on('message', (message) => {
  console.log(message)

  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()

  $messageFormButton.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if (error) {
      return console.log(error)
    }
    console.log('The message was delivered!')
  })
})


$sendLocationButton.addEventListener('click', (e) => {
  // using MDN geolocation API
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser!')
  }
  
  $sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      console.log('Location shared!')
      $sendLocationButton.removeAttribute('disabled')
    })
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})