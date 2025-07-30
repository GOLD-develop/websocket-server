const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')

const port = process.env.PORT || 3000
const wss = new WebSocket.Server({ port })

const sendCommand = (socket, command) => {
  const packet = {
    header: {
      requestId: uuidv4(),
      messagePurpose: 'commandRequest',
      version: 1
    },
    body: {
      commandLine: command,
      version: 1
    }
  }
  socket.send(JSON.stringify(packet))
}

wss.on('connection', socket => {
  const subscribePacket = {
    header: {
      requestId: uuidv4(),
      messagePurpose: 'subscribe',
      version: 1
    },
    body: {
      eventName: 'PlayerMessage'
    }
  }
  socket.send(JSON.stringify(subscribePacket))

  socket.on('message', data => {
    let msg
    try { msg = JSON.parse(data) } catch { return }
    const { header, body } = msg
    if (header.messagePurpose === 'event' && header.eventName === 'PlayerMessage') {
      console.log(`${body.sender}: ${body.message}`)
      sendCommand(socket, `tellraw @a {"rawtext":[{"text":"§f<${body.sender}§r§f> ${body.message}"}]}`)
    }
    if (header.messagePurpose === 'error') {
      console.error(body.errorMessage)
    }
  })
})
