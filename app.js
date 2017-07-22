const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)
const ent = require('ent')

// Variable globale qui contiendra toutes les todo envoyées par les clients
const todoList = []

app
  // Affichage de la page d'accueil, utilisation du template index.ejs
  .get('/', (req, res) => {
    console.log('render, todoList = ', todoList)
    res.render('index.ejs')
  })
  // 404 pour les autres adresses
  .use((req, res, next) => {
    res.setHeader('Content-Type', 'text/plain')
    res.status(404).send('Page introuvable !')
  })

io.sockets.on('connection', (client) => {
  console.log(client.id + ' - Client connection')
  // Envoi de la todo list au client pour qu'il initialise le tableau
  client.emit('initialize', todoList)
  // Evénement d'ajout d'un todo:
  // 1- Sauvegarde dans la variable globale todoList
  // 2- Broadcast de la nouvelle todo aux autres clients
  client.on('addTodo', (todo) => {
    console.log(client.id + ' - add todo: ', todo)
    todo.content = ent.encode(todo.content)
    todoList.push(todo)
    client.broadcast.emit('addTodo', todo)
  })
  // Evénement de suppression d'une todo
  // 1- Suppression de l'élément dans la variable global todoList
  // 2- Broadcast de la suppression aux autres clients
  client.on('rmTodo', (id) => {
    console.log(client.id + ' - rm todo: ', id)
    todoList.splice(todoList.findIndex((elt) => elt.id == id), 1)
    client.broadcast.emit('rmTodo', id)
  })
})

server.listen(8080)
