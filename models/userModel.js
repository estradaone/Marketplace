const pool = require('../database/db');
const search = require('../routes/routes');

const getUsers = async () => {
    try {
        const [rows, fields] = await pool.query('SELECT * FROM usuarios');
        return rows;
    } catch (err) {
        throw err;
    }
};

const searchUsers = async (searchTerm) => {
    try {
        const [rows, fields] = await pool.query(
            'SELECT * FROM usuarios WHERE nombre LIKE ? OR id_usuario LIKE ?',
            [`%${searchTerm}%`, `%${searchTerm}%`]);
        return rows;
    } catch (err) {
        throw err;
    }
};


module.exports = { getUsers, searchUsers };