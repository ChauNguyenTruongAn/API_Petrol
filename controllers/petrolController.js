require('dotenv')
const axios = require('axios');
const cheerio = require('cheerio');
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const { createUserService, loginUserService } = require('../services/userService');
const { getDay, getLink, generateListDate, generateListDateLink } = require('../services/petrolService');

const url = 'https://www.pvoil.com.vn/api/oilprice/load-view';
const urlDate = 'https://www.pvoil.com.vn/api/oilprice/load-view?date='
const urlNews = 'https://www.petrolimex.com.vn/ndi/thong-cao-bao-chi.html'

const getHello = async (req, res) => {
    return res.status(200).json({
        message: "OK",
        data: "Hello world"
    });
};

const getAllUsers = async (req, res) => {
    try {
        const [rows, fields] = await pool.execute('SELECT * from users');
        return res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error occurred: ", error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const createUser = async (req, res) => {
    const { username, password, email } = req.body;

    console.log(">>>Check register: ", username, password)



    if (username && password && email) {

        const results = await createUserService(username, password, email)
        console.log(">>>Check: ", results)
        return res.status(200).json(results)
    }
    return res.status(500).json("Register fail")
}

const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    console.log(">>>CHeck user: ", username, password)
    const result = await loginUserService(username, password)
    console.log(">>>Check result: ", result)

    if (result && result.EC === 1) {
        return res.status(200).json(result)
    } else {
        return res.status(400).json(result)
    }
}

const getPetrol = async (req, res) => {
    console.log(">>>Get petrol by user: ", req.user);
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const tableData = [];

        $('table tr').each((index, element) => {
            const row = [];
            $(element).find('td').each((i, td) => {
                row.push($(td).text().trim());
            });

            if (row.length > 0) {
                tableData.push(row);
            }
        });

        return res.status(200).json({ data: tableData });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Lỗi khi lấy dữ liệu" });
    }
};

const getNews = async (req, res) => {
    try {
        const { data } = await axios.get(urlNews);
        const $ = cheerio.load(data);
        const dataNews = { title: [], link: [], date: [], image: [] };

        $('li').each((index, element) => {
            const titleElement = $(element).find('.f-wrap__title a');
            const metaElement = $(element).find('.f-wrap__meta');
            const imgElement = $(element).find('.f-wrap__img img');

            if (titleElement.length && metaElement.length && imgElement.length) {
                const title = titleElement.text().trim();
                const link = titleElement.attr('href');
                const date = metaElement.find('span:last-child').text().trim();
                const image = imgElement.attr('src');

                dataNews.title.push(title);
                dataNews.link.push(getLink(link));
                dataNews.date.push(date);
                dataNews.image.push(image);
            }
        });

        return res.status(200).json(dataNews);

    } catch (error) {
        console.error('Error fetching news:', error.message);
        return res.status(500).json({ error: error.message });
    }
}

const getUserInfo = async (req, res) => {
    const [rows, fields] = await pool.execute(` SELECT username, email, role, create_at, count(title) as favorites 
                                                FROM users join favorite on users.id = favorite.id_user
                                                WHERE users.email = ? 
                                                GROUP BY id_user;`, [req.body.email ?? 'truongan@gmail.com'])
    if (rows && rows[0]) {
        return res.status(200).json(rows[0])
    }
    return res.status(500).json(null)
}

const getPriceOfDay = async (req, res) => {
    const { day, month, year } = req.body;
    const decodedDate = getDay(day, month, year);
    if (decodedDate == null) {
        return res.status(500).json("Ngày không hợp lệ")
    }
    const { data } = await axios.get(urlDate + decodedDate);
    console.log("Check data: ", data);
    const $ = cheerio.load(data);
    const tableData = [];

    $('table tr').each((index, element) => {
        const row = [];
        $(element).find('td').each((i, td) => {
            row.push($(td).text().trim());
        });

        if (row.length > 0) {
            tableData.push(row);
        }
    });

    return res.status(200).json({ data: tableData });
}

const checkAccessToken = async (req, res) => {
    console.log(">>>Check access token by user: ", req.user);
    return res.status(200).json({ EC: 1, user: req.user })
}

const getListDate = async (req, res) => {
    const date = generateListDate();
    return res.status(200).json(date)
}

const getListLink = async (req, res) => {
    const data = generateListDateLink(urlDate);
    return res.status(200).json(data);
}

// 1 success | 0 fail | -1 exist 
const saveFav = async (req, res) => {

    try {
        const { title, date, link, id_user } = req.body;

        const [checkRows, checFields] = await pool.execute("SELECT * FROM favorite WHERE id_user = ? AND title = ?", [id_user, title]);

        console.log(">>>Check rows: ", checkRows);

        if (checkRows.length > 0) {
            console.log("Có rồi nè");
            res.status(200).json({ message: -1 });
            return;
        } else {
            console.log("Thêm mới rồi nè");
            const [rows, fields] = await pool.execute(
                "INSERT INTO favorite (title, date, link, id_user) VALUES (?, ?, ?, ?)",
                [title, date, link, id_user]
            );

            if (rows.affectedRows > 0) {
                res.status(201).json({ message: rows.insertId });
            } else {
                res.status(500).json({ message: 0 });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 0 });
    }
};

const removeFav = async (req, res) => {
    const id = req.query.id;
    console.log("Check: ", req.body);
    const [row, field] = await pool.execute("DELETE FROM favorite WHERE id = ?", [id]);
    console.log(">>>Check", row);
    if (row.affectedRows > 0) {
        res.status(200).json({ message: 1 });
    } else {
        res.status(500).json({ message: 0 });
    }
}

const checkFav = async (req, res) => {
    const { id_user } = req.query;
    const [rows, field] = await pool.execute("SELECT id, title FROM favorite WHERE id_user = ?", [id_user]);
    console.log("Check row in checkFav: ", rows);
    if (rows.length > 0) {
        res.status(200).json(rows);
    } else {
        res.status(500).json([]);
    }
}

module.exports = {
    getHello,
    getPetrol,
    getAllUsers,
    handleLogin,
    createUser,
    getUserInfo,
    getPriceOfDay,
    checkAccessToken,
    getNews,
    getListDate,
    getListLink,
    saveFav,
    removeFav,
    checkFav
};
