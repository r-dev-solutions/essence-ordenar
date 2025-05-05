const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Open to all origins
app.use(helmet());
app.use(express.json());

// JWT Validation Middleware
const validateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        // Ignore token expiration
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Order Schema
const orderSchema = new mongoose.Schema({
    email: String,
    telefono: String,
    nombre: String,
    apellido: String,
    direccion: String,
    ciudad: String,
    departamento: String,
    metodoPago: String,
    productos: [{
        producto: String,
        stock: Number,
        volumen: String,
        precio: Number
    }],
    total: Number,
    precioEnvio: Number,
    promoCode: String,
    descuento: Number,
    banco: String,
    fecha: { type: Date, default: Date.now },
    estado: { type: String, default: 'Orden Procesada' }
}, { collection: 'pedidos' });

const Order = mongoose.model('Order', orderSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes with JWT validation
app.post('/api/orders', validateToken, async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/orders', validateToken, async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});