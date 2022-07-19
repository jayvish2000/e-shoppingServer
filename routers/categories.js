const {Category} = require('../models/category')
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();
    if (!categoryList) {
        res.send(500).json({ success: false })
    }
    res.status(200).send(categoryList)
})

router.get(`/:id`, async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.send(500).json({ message: 'category not found by give id' })
    }
    res.status(200).send(category)
})

router.post('/', async (req, res) => {
    console.log("category",  req.body.name)

    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
   
     category.save();
    if (!category) {
        res.status(400).send('category can"t be created')
    }
    res.status(200).send(category)
})

router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    }, { new: true })
    if (!category) {
        return res.status(400).send({ message: 'category can"t be updated' })
    }
    res.status(200).send(category);
})

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'category has been deleted' })
        } else {
            res.status(404).json({ success: false, message: 'category not found ' })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

module.exports = router