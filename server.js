require('rootpath')()
const express = require('express')
const app = express() 
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const errorHandler = require('_middleware/error-handler')

// Add request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cookieParser())

// CORS configuration
const allowedOrigins = [
    'https://it-321-final-front-personal-4hjq8j1nj-adepteagles-projects.vercel.app',
    'https://it-321-final-front-personal.vercel.app',
    'http://localhost:4200' // for local development
];

app.use(cors({
    origin: function(origin, callback) {
        console.log('Request origin:', origin);
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('CORS blocked request from:', origin);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        console.log('CORS allowed request from:', origin);
        return callback(null, true);
    },
    credentials: true
}));

// api routes
app.use('/accounts', require('./accounts/accounts.controller'))
app.use('/departments', require('./departments/departments.controller'))
app.use('/employees', require('./employees/employees.controller'))
app.use('/api-docs', require('./_helpers/swagger'))

// global error handler
app.use(errorHandler)

// Add error logging
app.use((err, req, res, next) => {
    console.error('Error:', err);
    next(err);
});

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000
app.listen(port, _ => { 
    console.log(`Server started on port ${port}`);
    console.log('Allowed CORS origins:', allowedOrigins);
})  

