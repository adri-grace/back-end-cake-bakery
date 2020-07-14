const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Product = require('../models/product')
const User = require('../models/user')
const Order = require('../models/order')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
router.get('/items', (req, res, next) => {
  Product.find()
    .then(products => {
      // `examples` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return products.map(product => product.toObject())
    })
    // respond with status 200 and JSON of the examples
    .then(products => res.status(200).json({ products: products }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
router.get('/items/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Product.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(product => res.status(200).json({ product: product.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW cakes and cupcakes
router.get('/items/bakery', (req, res, next) => {
  Product.find({category: 'cakes and cupcakes'})
    .then(handle404)
    .then(product => res.status(200).json({ product: product.toObject() }))
    .catch(next)
})

// SHOW crafts
router.get('/items/crafts', (req, res, next) => {
  Product.find({category: 'crafts'})
    .then(handle404)
    .then(product => res.status(200).json({ product: product.toObject() }))
    .catch(next)
})

// SHOW treats
router.get('/items/treats', (req, res, next) => {
  Product.find({category: 'treats'})
    .then(handle404)
    .then(product => res.status(200).json({ product: product.toObject() }))
    .catch(next)
})

// CREATE
router.post('/products', requireToken, (req, res, next) => {
  // set owner of new product to be current user
  req.body.product.owner = req.user.id

  Product.create(req.body.product)
    // respond to succesful `create` with status 201 and JSON of new "product"
    .then(product => {
      res.status(201).json({ product: product.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
router.patch('/products/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.product.owner

  Product.findById(req.params.id)
    .then(handle404)
    .then(product => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, product)

      // pass the result of Mongoose's `.update` to the next `.then`
      return product.updateOne(req.body.product)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
router.delete('/products/:id', requireToken, (req, res, next) => {
  Product.findById(req.params.id)
    .then(handle404)
    .then(product => {
      // throw an error if current user doesn't own `product`
      requireOwnership(req, product)
      // delete the example ONLY IF the above didn't throw
      product.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// function to add product to order
const addToOrder = (userId, productId, res) => {
  return Product.findOne({_id: productId}) // this finds the product by its ID
    .then(product => {
      return Order.findOne({owner: userId}) // find the order's user
        .then(order => {
          order.items.push(product)
          res.status(201).json({ order: order.toObject() })
          return order.save()
        })
    })
}

// add a product to an order
router.get('/products/:id/order', requireToken, (req, res, next) => {
  /* id of the client, or the logged in user if you're using passeport or some other auth manager */
  User.findOne({_id: req.user.id})
    .then(user => {
      return addToOrder(user.id, req.params.id, res)
    })
    .catch(next)
})

// delete a product from an order
router.delete('/products/:id/order', requireToken, (req, res, next) => {
  User.findOne({_id: req.user.id})
    .then(user => {
      return Order.findOne({owner: req.user.id})
        .then(order => {
          const index = order.items.findIndex(item => (item.id === req.params.id))
          order.items.splice(index, 1)
          order.save()
          return order
        })
        .then(() => res.sendStatus(204))
    })
    .catch(next)
})

module.exports = router
