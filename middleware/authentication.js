require("dotenv").config();
const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {

    const valid_endpoint = ["/hello", "/login", "/register"]

    if (valid_endpoint.find(item => '/v1/api' + item === req.originalUrl)) {
        next();
    }
    else {
        if (req.headers && req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                req.user = {
                    email: decoded.email,
                    role: decoded.role,
                    createBy: "Andree"
                }
                next();
            } catch (error) {
                return res.status(401).json("Token expired/Token invalid")
            }
        } else {
            return res.status(401).json("Un authorization")
        }
    }


}

module.exports = {
    auth
}