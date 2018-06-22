const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

// Handle incoming GET requests to /orders
router.get('/', (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                count: result.length,
                orders: result.map( doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders' + doc._id
                        }
                    }
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(200).json({
                error: err
            })
        });
    /*res.status(200).json({
        message: 'Orders were fetched'
    });*/
});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if(!product){
                res.status(404).json({
                    message: 'Product not found'
                })
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'Order was stored',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
    /*const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    };*/
    /*res.status(201).json({
        message: 'Order was created',
        order: order
    });*/
});

router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .select('product quantity _id')
        .exec()
        .then(doc => {
            //console.log("From DB",doc);
            if(doc){
                const result = {
                    order: doc,
                    request: {
                        type: 'GET',
                        description: 'GET Order BY ID',
                        url: 'http://localhost:3000/orders/'
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
    /*res.status(200).json({
        message: 'Order details',
        orderId: req.params.orderId
    });*/
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findOneAndRemove({ _id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order Deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders/',
                    body: {
                        order: 'String',
                        quantity: 'Number'
                    }
                }
            });
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            })
        });
    /*res.status(200).json({
        message: 'Order deleted',
        orderId: req.params.orderId
    });*/
});

module.exports = router;