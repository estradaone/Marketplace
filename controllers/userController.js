const UserModel = require('../models/userModel');

exports.getUsers = async (req, res) => {
    try {
        const users = await UserModel.getUsers();
        res.render('usuariosExistentes', { usuarios: users });
    } catch(err) {
        res.status(500).send(err);
    }
};

exports.searchUsers = async (req, res) => {
    const searchTerm = req.query.search || '';
    try {
        const users = await UserModel.searchUsers(searchTerm);
        console.log('Search term:', searchTerm);
        console.log('Found users:', users);
        res.render('usuariosExistentes', { usuarios: users });
    } catch (err) {
        console.error('Error during search:', err);
        res.status(500).send(err);
    }
};


