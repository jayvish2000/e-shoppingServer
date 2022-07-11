const { User } = require('../models/user')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');
    if (!userList) {
        res.send(500).json({ success: false })
    }
    res.send(userList)
})

router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        res.send(500).json({ message: 'user not found by give id' })
    }
    res.status(200).send(user)
})

router.post(`/`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        street: req.body.street,
        country: req.body.country
    })
    user = await user.save();
    if (!user)
        return res.status(400).send({ message: 'user can"t be created' })
})

router.post(`/login`, async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret
 
    if (!user) {
        return res.status(400).send({ message: 'user not found' })
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin
        }, secret, { expiresIn: '1week' })
        res.status(200).send({ user: user.email, token: token })
    } else {
        res.status(400).send({ message: 'invaild email or password' });
    }

})

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments();
    if (!userCount) {
        res.send(500).json({ success: false })
    }
    res.send({ count: userCount })
})

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'user has been deleted' })
        } else {
            res.status(404).json({ success: false, message: 'user not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

router.post(`/register`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        street: req.body.street,
        country: req.body.country
    })
    user = await user.save();
    if (!user)
        return res.status(400).send({ message: 'user can"t be created' })
})

module.exports = router