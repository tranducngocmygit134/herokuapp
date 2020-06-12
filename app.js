// ** Node module
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
// ** Dev module
const productRoute = require('./routes/product');
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const reviewRoute = require('./routes/review');
const overviewPage = require('./controller/product');
const errorHandling = require('./controller/errorHandling');
// ** Global variable
const app = express();
// ** Global middleware
app.use(helmet());
// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// Serverside rendering
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', 'views');
// Nosql injection
app.use(mongSanitize()); // filter specified character
// Xss
app.use(xss()); // replace symbol
// Prevent prams polution
app.use(
  hpp({
    whitelist: ['price'], // array allow duplicate
  })
);
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10min
  max: 100,
  message: 'Too many request, please try again in 10 min',
});
// Limit request abs
app.use('/api', limiter);
// Nosql injection

app.use(compression());
// ** Dev middleware
// 2. Routes api
app.use('/products', productRoute);
app.use('/users', userRoute);
app.use('/admin', adminRoute);
app.use('/reviews', reviewRoute);
app.use('/', overviewPage.getOverview);

// ** Error handling
app.all('*', errorHandling.PageNotFound); // Handling page not found
app.use(errorHandling.GlobalHandleError);
module.exports = app;
