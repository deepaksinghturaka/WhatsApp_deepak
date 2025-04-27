require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/message');

const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const imageRoutes = require('./routes/routers');
const contactRoutes = require('./routes/contactRoutes');
const userRouters = require('./routes/index');
const chatRoutes = require('./routes/chatRoute');

app.use('/api', imageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/', contactRoutes);
app.use('/', userRouters);

// In-memory client map
const clients = {};

// Socket.io logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('signin', (id) => {
        console.log('User signed in with ID:', id);
        clients[id] = socket;
    });

    socket.on('message', async (msg) => {
        console.log('Message received:', msg);

        // Fix for key names
        const senderId = msg.senderId || msg.sourceId;
        const targetId = msg.targetId;
        const content = msg.content || msg.message;

        if (!senderId || !targetId || !content) {
            console.warn('Invalid message format:', msg);
            return;
        }

        try {
            const newMessage = new Message({
                senderId,
                targetId,
                content
            });
            await newMessage.save();
            console.log('Message saved to DB');
        } catch (error) {
            console.error('Error saving message:', error);
        }

        if (clients[targetId]) {
            clients[targetId].emit('message', {
                senderId,
                targetId,
                content
            });
        }
    });
});

// Health check
app.get('/', (req, res) => {
    res.json('Your app is working fine!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
