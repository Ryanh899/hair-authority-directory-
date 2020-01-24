const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const authRoutes = require("./api/routes/auth.routes");
const jwt = require("express-jwt");
const apiRoutes = require('./api/routes/api.routes'); 
const morgan = require('morgan')

const PORT = process.env.PORT || 3000;

// const auth = jwt({
//   secret: process.env.PRIVATE_KEY
// });
//express middleware
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(express.json());
app.use(bodyParser.json());

app.use(morgan('dev'))

app.use(express.static("public"));

app.use("/auth", authRoutes);
// app.use(auth);
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log("app listening on port ", PORT);
});
