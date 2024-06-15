// controllers/auth.controller.js
const {Pool} = require("pg");
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/afm_db',
    ssl: !!process.env.DATABASE_URL
});
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
    const { name, surname, email, password } = req.body;
    try {
        // Check if the user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password and insert the new user into the database
        const hashedPassword = await bcrypt.hash(password, 10);
        const response = await pool.query(
            'INSERT INTO users (name, surname, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, surname, email, hashedPassword]
        );
        const user = response.rows[0];

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return the token and user information
        res.status(201).json({ token, user });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error: " + error);
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const response = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = response.rows[0];
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error: " + error);
    }
};

module.exports = {
    login,
    signup
};
