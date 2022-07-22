const { Product } = require('../models/product')
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/jpeg': 'jpeg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const upload = multer({ storage: storage })

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate('category');
    if (!productList) {
        res.send(500).json({ success: false })
    }
    res.send(productList)
})

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.send(500).json({ success: false })
    }
    res.send(product)
})

router.post(`/`, upload.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category)
        return res.status(400).send({ message: 'Invaild Category' })

    const file = req.file;
    if (!file)
        return res.status(400).send({ message: 'image is required' })

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/upload`;

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    product.save();
    if (!product)
        return res.status(500).send({ message: "product can't created " })

    res.send(product)
})

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send({ message: 'Invaild product Id' })
    }
    const category = await Category.findById(req.body.category);
    if (!category)
        return res.status(400).send({ message: 'Invaild Category' })

    const product = await Product.findByIdAndUpdate(
        req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }, { new: true })
    if (!product) {
        return res.status(500).send({ message: 'product can"t be updated' })
    }
    res.status(200).send(product);
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'product has been deleted' })
        } else {
            res.status(404).json({ success: false, message: 'product not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();
    if (!productCount) {
        res.send(500).json({ success: false })
    }
    res.send({ count: productCount })
})

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count)
    if (!products) {
        res.send(500).json({ success: false })
    }
    res.send(products)
})

router.put('/gallery-images/:id', upload.array('images'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send({ message: 'Invaild product Id' })
    }
    let imagesPath = [];
    const files = req.files;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload`;

    if (files) {
        files.map(file => {
            imagesPath.push(`${basePath}${file.fileName}`);
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id, {
        images: imagesPath
    }, { new: true })
    if (!product) {
        return res.status(500).send({ message: 'product can"t be updated' })
    }
    res.status(200).send(product);
})

module.exports = router