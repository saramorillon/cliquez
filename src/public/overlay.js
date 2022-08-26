const twitch = window.Twitch.ext

twitch.onAuthorized((auth) => {
  let canClick = false

  const div = document.querySelector('div')
  const svg = document.querySelector('svg')

  const socket = io('/' + auth.channelId)

  socket.on('connect', () => {
    document.body.addEventListener('click', (e) => {
      if (canClick) {
        socket.emit('click', auth.userId, e.clientX, e.clientY)
      }
    })

    socket.on('clear', () => {
      svg.replaceChildren()
    })

    socket.on('points', (points) => {
      for (let i = 0; i < points.length; i++) {
        let point = document.getElementById('point-' + i)
        if (!point) {
          point = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          point.setAttribute('id', 'point-' + i)
          point.classList.add('point')
          svg.appendChild(point)
        }
        point.setAttribute('cx', points[i][0] - 2)
        point.setAttribute('cy', points[i][1] - 2)
        point.setAttribute('r', 4)
      }
    })

    socket.on('clusters', (clusters) => {
      for (let i = 0; i < clusters.length; i++) {
        let cluster = document.getElementById('cluster-' + i)
        if (!cluster) {
          cluster = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          cluster.setAttribute('id', 'cluster-' + i)
          cluster.classList.add('cluster')
          if (clusters[i].winner) {
            cluster.classList.add('winner')
          } else {
            cluster.classList.remove('winner')
          }
          svg.appendChild(cluster)
        }
        cluster.setAttribute('cx', clusters[i].centroid[0])
        cluster.setAttribute('cy', clusters[i].centroid[1])
        cluster.setAttribute('r', clusters[i].percent * 200)

        let text = document.getElementById('text-' + i)
        if (!text) {
          text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          text.setAttribute('id', 'text-' + i)
          text.setAttribute('text-anchor', 'middle')
          text.setAttribute('dominant-baseline', 'middle')
          svg.appendChild(text)
        }
        text.setAttribute('x', clusters[i].centroid[0])
        text.setAttribute('y', clusters[i].centroid[1])
        text.textContent = Math.round(clusters[i].percent * 100) + '% (' + clusters[i].count + ' clicks)'
      }
    })
  })

  socket.emit('status')

  socket.on('status', (started) => {
    canClick = started
    if (canClick) {
      div.style.display = 'block'
    } else {
      div.removeAttribute('style')
    }
  })
})
