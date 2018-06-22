const express =require('express');
const router = express.Router();
const  mongoose = require('mongoose');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product
        .find()
        .select('name price _id')
        .exec()
        .then(docs => {
            //console.log(docs);
            const  response = {
                count: docs.length,
                products: docs.map(doc =>{
                    return{
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            }
           /* if(docs.length > 0){*/
                res.status(200).json(response)
            /*}else {
                res.status(404).json({
                    message: 'No found any entries'
                })
            }*/
        })
        .catch( err => {
            console.log('err');
            res.status(500).json({message: err})
        });
    /*res.status(200).json({
        message: 'Handling GET request to /products'
    })*/
});

router.post('/', (req, res, next) => {
/*    const product = {
        name: req.body.name,
        price: req.body.price
    };*/
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save()
        .then(result => {
            // console.log(result);
            res.status(201).json({
                message: 'Product created successfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request:{
                        type: 'POST',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            //console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.get('/:productId',(req, res, next) => {
    const id = req.params.productId;
    /*if(id === 'special'){
        res.status(200).json({
            message: 'Special Id',
            id: id
        })
    }else{
        res.status(200).json({
            message: 'You passed an ID'
        })

    }*/
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            //console.log("From DB",doc);
            if(doc){
                const result = {
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        description: 'GET PRODUCT BY ID',
                        url: 'http://localhost:3000/products/' + doc._id
                    }
                }
                res.status(200).json(result);
            }else{
                res.status(404).json({ message: 'No valid ID'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        })
});
router.patch('/:productId',(req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const  ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.findByIdAndUpdate({ _id: id}, {$set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product Updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
/*   res.status(200).json({
       message: 'Product Updated!!!',
   })*/
});
router.delete('/:productId',(req, res, next) => {
    const id = req.params.productId;
    Product.findOneAndRemove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product Deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products/' + result._id,
                    body: {
                        name: 'String',
                        price: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })

   /* res.status(200).json({
        message: 'Product Deleted!!!',
    })*/
});

module.exports = router;