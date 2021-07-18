const Product = require("../models/ProductModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Product Schema
function ProductData(data) {
    this.discountId = data.discountId;
    this.photoURL = data.photoURL;
    this.productName = data.productName;
    this.productType = data.productType;
    this.cost = data.cost;
    this.desc = data.desc;
}

/**
 * Product List.
 * 
 * @returns {Object}
 */
exports.productList = [
    // auth,
    async function(req, res) {
        try {
            const list = await Product.find();
            if (list.length) {
                return apiResponse.successResponseWithData(res, "Operation success", list);
            } else {
                return apiResponse.successResponseWithData(res, "Operation success", []);
            }
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

/**
 * Product Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.ProductDetail = [
    auth,
    function(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.successResponseWithData(res, "Operation success", {});
        }
        try {
            Product.findOne({ _id: req.params.id, user: req.user._id }, "_id title description isbn createdAt").then((product) => {
                if (product !== null) {
                    const productData = new ProductData(product);
                    return apiResponse.successResponseWithData(res, "Operation success", productData);
                } else {
                    return apiResponse.successResponseWithData(res, "Operation success", {});
                }
            });
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

/**
 * Product store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.ProductStore = [
    // auth,
    body("productType", "productType must min 1 - 50.").isLength({ min: 1, max: 50 }).trim(),
    body("productName", "productName must min 1 - 50.").isLength({ min: 1, max: 50 }).trim().custom((value, { req }) => {
        return Product.findOne({ productName: value }).then(Product => {
            if (Product) {
                return Promise.reject("Product already exist with this productName.");
            }
        });
    }),
    sanitizeBody("*").escape(),
    (req, res) => {
        try {
            const errors = validationResult(req);
            console.log(req.body);
            const product = new Product({
                // discountId: req.body.discountId,
                // photoURL: req.body.photoURL,
                productName: req.body.productName,
                productType: req.body.productType,
                // price: req.body.price,
                // cost: req.body.cost,
                // desc: req.body.desc
            });

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            } else {
                //Save Product.
                product.save(function(err) {
                    if (err) {
                        return apiResponse.ErrorResponse(res, err);
                    }
                    const productData = new ProductData(product);
                    return apiResponse.successResponseWithData(res, "Product add Success.", productData);
                });
            }
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

/**
 * Product update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.ProductUpdate = [
    auth,
    body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
    body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
    body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value, { req }) => {
        return Product.findOne({ isbn: value, user: req.user._id, _id: { "$ne": req.params.id } }).then(Product => {
            if (Product) {
                return Promise.reject("Product already exist with this ISBN no.");
            }
        });
    }),
    sanitizeBody("*").escape(),
    (req, res) => {
        try {
            const errors = validationResult(req);
            const Product = new Product({
                title: req.body.title,
                description: req.body.description,
                isbn: req.body.isbn,
                _id: req.params.id
            });

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            } else {
                if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                    return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
                } else {
                    Product.findById(req.params.id, function(err, foundProduct) {
                        if (foundProduct === null) {
                            return apiResponse.notFoundResponse(res, "Product not exists with this id");
                        } else {
                            //Check authorized user
                            if (foundProduct.user.toString() !== req.user._id) {
                                return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
                            } else {
                                //update Product.
                                Product.findByIdAndUpdate(req.params.id, Product, {}, function(err) {
                                    if (err) {
                                        return apiResponse.ErrorResponse(res, err);
                                    } else {
                                        const productData = new ProductData(product);
                                        return apiResponse.successResponseWithData(res, "Product update Success.", productData);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

/**
 * Product Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.ProductDelete = [
    auth,
    function(req, res) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
        }
        try {
            Product.findById(req.params.id, function(err, foundProduct) {
                if (foundProduct === null) {
                    return apiResponse.notFoundResponse(res, "Product not exists with this id");
                } else {
                    //Check authorized user
                    if (foundProduct.user.toString() !== req.user._id) {
                        return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
                    } else {
                        //delete Product.
                        Product.findByIdAndRemove(req.params.id, function(err) {
                            if (err) {
                                return apiResponse.ErrorResponse(res, err);
                            } else {
                                return apiResponse.successResponse(res, "Product delete Success.");
                            }
                        });
                    }
                }
            });
        } catch (err) {
            //throw error in json response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];