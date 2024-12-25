const { pool } = require('../config/database');
const bcrypt = require('bcrypt')
require('dotenv').config()
const jsonwebtoken = require('jsonwebtoken')
SALT_ROUND = 10



const createUserService = async (name, password, email) => {
    try {
        const hashPass = await bcrypt.hash(password, SALT_ROUND)
        const [rows, fields] = await pool.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [name, hashPass, email])
        return { message: "OK", name: name, password: hashPass, email: email };
    } catch (error) {
        console.log(error);
        return null;
    }
}

const loginUserService = async (username, password) => {
    try {
        if (username && password) {
            const [rows, fields] = await pool.execute(`
                SELECT *
                FROM users 
                WHERE username=?`, [username]);

            if (rows && rows.length > 0) {
                console.log(">>>Check rows: ", rows[0]?.password ?? "invalid")
                const isMatchPassword = await bcrypt.compare(password, rows[0].password)

                if (isMatchPassword) {
                    const payload = {
                        email: rows[0].email,
                        role: rows[0].role,
                        iduser: rows[0].id,
                    }

                    const access_token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRE
                    })
                    return {
                        message: "Login success",
                        EC: 1,
                        access_token,
                        iduser: rows[0].id,
                        user: payload
                    }
                }
            } else {
                return { message: "Invalid username/password", EC: 0 }
            }
        }
        return { message: "error", EC: 0 }
    } catch (error) {
        return { message: error, EC: 0 }
    }
}

module.exports = {
    createUserService,
    loginUserService
}