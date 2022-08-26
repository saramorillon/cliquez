const twitch = window.Twitch.ext

twitch.onAuthorized((auth) => {
  let config = {}
  let changed = false
  let started = false
  let timeout

  const span = document.querySelector('span')
  const zones = document.querySelector('input')
  const button = document.querySelector('button')

  const socket = io('/' + auth.channelId)

  function send(force) {
    if (changed || force) {
      socket.emit('clusters', Object.values(config), zones.value)
      changed = false
    }
    timeout = setTimeout(send, 2000)
  }

  button.addEventListener('click', () => {
    if (started) {
      started = false
      button.innerText = "Nettoyer l'écran"
      clearTimeout(timeout)
    } else if (Object.keys(config).length > 0) {
      config = {}
      socket.emit('clear')
      button.innerText = 'Démarrer'
    } else {
      started = true
      button.innerText = 'Stop !'
      send()
    }
    socket.emit('status', started)
  })

  socket.on('status', () => {
    socket.emit('status', started)
    socket.emit('points', Object.values(config))
  })

  socket.on('click', (userId, x, y) => {
    if (started) {
      config[userId] = [x, y]
      span.innerText = Object.keys(config).length
      changed = true
      socket.emit('points', Object.values(config))
    }
  })
})
