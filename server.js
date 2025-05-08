require('rootpath')()
const express = require('express')
const app = express() 
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const errorHandler = require('_middleware/error-handler')

// Add detailed request logging
app.use((req, res, next) => {
    console.log('----------------------------------------');
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('----------------------------------------');
    next();
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cookieParser())

// CORS configuration
const allowedOrigins = [
    'http://localhost:4200',  // Angular dev server
    'http://localhost:3000',  // Alternative port
    'http://127.0.0.1:4200', // Alternative localhost
    'http://127.0.0.1:3000'  // Alternative localhost
];

app.use(cors({
    origin: function(origin, callback) {
        console.log('----------------------------------------');
        console.log('CORS Check - Request origin:', origin);
        console.log('Allowed origins:', allowedOrigins);
        
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('No origin provided, allowing request');
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('CORS blocked request from:', origin);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        
        console.log('CORS allowed request from:', origin);
        console.log('----------------------------------------');
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// api routes
app.use('/accounts', require('./accounts/accounts.controller'))
app.use('/departments', require('./departments/departments.controller'))
app.use('/employees', require('./employees/employees.controller'))
app.use('/api-docs', require('./_helpers/swagger'))

// global error handler
app.use(errorHandler)

// Add detailed error logging
app.use((err, req, res, next) => {
    console.error('----------------------------------------');
    console.error('Error occurred:');
    console.error('Time:', new Date().toISOString());
    console.error('URL:', req.url);
    console.error('Method:', req.method);
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    console.error('----------------------------------------');
    next(err);
});

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000
app.listen(port, _ => { 
    console.log('----------------------------------------');
    console.log(`Server started on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Allowed CORS origins:', allowedOrigins);
    console.log('----------------------------------------');
})  

