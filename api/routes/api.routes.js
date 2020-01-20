const router = require("express").Router();

router.get('/testApi', (req, res) => {
    res.json({
        message: 'Hello World is a secret'
    })
})


module.exports = router; 