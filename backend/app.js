const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// Import the WebSocket library
const WebSocket = require('ws');

// Create a new WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

// Listen for connection events
wss.on('connection', (ws) => {
  console.log('A new client connected');

  // Send a welcome message to the newly connected client
  ws.send('Welcome to the WebSocket server!');

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Broadcast the received message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Broadcast: ${message}`);
      }
    });
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('A client disconnected');
  });
  ws.send('hello client');
});

console.log('WebSocket server is running on ws://localhost:8080');

let users = []; // 用于存储用户ID的数组

// 注册路由
app.post('/register', (req, res) => {
  console.log(req.body);
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    // 检查用户ID是��已经存在
    const userExists = users.includes(id);
    if (userExists) {
        return res.status(400).json({ message: 'Account already registered' });
    }

    // 注册用户
    users.push(id);
    return res.status(201).json({ message: 'Registration successful' });
});

// 登录路由
app.post('/login', (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    // 检查用户ID是否存在
    const userExists = users.includes(id);
    if (!userExists) {
        return res.status(400).json({ message: 'Account not found' });
    }

    return res.status(200).json({ message: 'Login successful' });
});