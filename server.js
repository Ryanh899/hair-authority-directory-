const express = require('express'); 
const app = express(); 
const bodyParser = require('body-parser'); 
const authRoutes = require('./api/routes/auth_routes'); 

const PORT = process.env.PORT || 3000; 

//express middleware 
app.use(express.urlencoded({
    extended: true
  }));
  app.use(express.json());
  app.use(bodyParser.json());

app.use('/auth', authRoutes); 

app.get('/', (req, res) => {
    res.json({ hair_authority: 'day 1' }); 
}); 


app.listen(PORT, () => {
    console.log('app listening on port ', PORT); 
}); 
