const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
// const authJwt = require('./helpers/jwt');
require('dotenv/config');

app.use(cors());
app.options('*', cors())


const categoriesRoutes = require("./routers/categories");
const productsRoutes = require('./routers/products');
const usersRoutes = require('./routers/users');
const ordersRoutes = require('./routers/orders');

const api = process.env.API_URL

app.use(bodyParser.json());
app.use(morgan('tiny'));
// app.use(authJwt());
app.use('/public/uploads', express.static(__dirname))
// app.use((err, req, res, next) => {
//     if (err.name === 'UnauthorizedError') {
//         return res.status(401).json({ message: 'user not authorized' })
//     }
//     else if (err.name === 'ValidationError') {
//         return res.status(401).json({ message: err })
//     } else {
//         return res.status(500).json(err);
//     }
// });

app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/products`, productsRoutes)
app.use(`${api}/users`, usersRoutes)
app.use(`${api}/orders`, ordersRoutes)

mongoose.connect(process.env.CONNECTION_STRING).then(() => {
    console.log('Database connected successfully')
}).catch((err) => {
    console.log(err)
})

// app.listen(8080, () => {
//     console.log('server is running');
// })

let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log(`server is running on port ${port}`);
})