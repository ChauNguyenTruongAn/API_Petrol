require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const routerAPI = require('./routes/api'); 
const { pool } = require('./config/database');

const app = express();
const port = process.env.PORT || 8888;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/v1/api', routerAPI);

(async () => {
    try {
        const [rows] = await pool.execute('SELECT 1');
        console.log('Connect successful:', rows);
        app.listen(port, "0.0.0.0", () => {
            console.log(`Backend Nodejs App listening on port: ${port}`);
        });
    } catch (error) {
        console.log(">>> Error connect: ", error);
    }
})();
