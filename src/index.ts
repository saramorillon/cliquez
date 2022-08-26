import kmeans from '@turf/clusters-kmeans'
import { featureCollection, point } from '@turf/helpers'
import express from 'express'
import { createServer } from 'http'
import { join } from 'path'
import { Server } from 'socket.io'

const app = express()

app.use(express.static(join(__dirname, 'public')))

const httpServer = createServer(app)

const io = new Server(httpServer)

type Cluster = {
  centroid: [number, number]
  count: number
  percent: number
  winner: boolean
}

io.of(/^\/.+$/).on('connection', (socket) => {
  socket.on('click', (userId, x, y) => {
    socket.nsp.emit('click', userId, x, y)
  })

  socket.on('status', (status) => {
    socket.nsp.emit('status', status)
  })

  socket.on('points', (points: number[][]) => {
    socket.nsp.emit('points', points)
  })

  socket.on('clear', () => {
    socket.nsp.emit('clear')
  })

  socket.on('clusters', (points: number[][], zones: number) => {
    const collection = featureCollection(points.map((p) => point(p)))
    kmeans(collection, { numberOfClusters: zones, mutate: true })
    let winner = -1
    const clusters: Cluster[] = []
    for (const feature of collection.features) {
      if (feature.properties) {
        const { cluster, centroid } = feature.properties
        if (winner === -1) winner = cluster
        if (!clusters[cluster]) {
          clusters[cluster] = { centroid, count: 0, percent: 0, winner: false }
        }
        clusters[cluster].count++
        clusters[cluster].percent = clusters[cluster].count / points.length
        if (clusters[cluster].percent > clusters[winner].percent) {
          winner = cluster
        }
      }
    }
    clusters[winner].winner = true
    socket.nsp.emit('clusters', clusters)
  })
})

httpServer.listen(8080, () => {
  console.log('Listening on port 8080')
})
