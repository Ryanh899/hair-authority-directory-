const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const authRoutes = require("./api/routes/auth.routes");
const jwt = require("jsonwebtoken");
const apiRoutes = require('./api/routes/api.routes'); 
const adminRoutes = require('./api/routes/admin.routes'); 
const morgan = require('morgan')
const zohoRoutes = require('./api/routes/zoho.routes'); 
const cors = require('cors'); 

const whitelist = ['https://hairauthoritydirectory.s3.amazonaws.com', 'https://d386uuq73cyuus.cloudfront.net/', 'https://www.hairauthoritydirectory.com.s3.amazonaws.com', 'https://hairauthoritydirectory.com', 'https://subscriptions.zoho.com', 'https://accounts.zoho.com', 'http://hairauthoritydirectory.s3-website-us-east-1.amazonaws.com', 'http://www.hairauthoritydirectory.com.s3-website-us-east-1.amazonaws.com']
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const PORT = process.env.PORT || 3000;

// token authentication middleware
function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers['authorization']; 
  console.log(authHeader)
  const token = authHeader && authHeader.split(' ')[1]; 
  if (token == null) return res.sendStatus(401) // if there isn't any token
  console.log(token)

  jwt.verify(token, process.env.PRIVATE_KEY , ( err, user ) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403)
    }
    req.user = user
    next() // pass the execution off to whatever request the client intended
  })
}

//express middleware
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(cors(corsOptions))

app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.send('Welcome to my API')
}); 

app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

// put auth back in zoho 
app.use('/zoho', authenticateToken, zohoRoutes); 
app.use('/admin', authenticateToken, adminRoutes); 



app.listen(PORT, () => {
  console.log("app listening on port ", PORT);
});
