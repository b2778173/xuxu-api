const Product = require("../models/ProductModel");
// const { body, validationResult } = require("express-validator");
// const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
// const auth = require("../middlewares/jwt");
const logger = require("debug")("Req");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
mongoose.set("returnOriginal", false);

/**
 *
 * @param {*}
 * @param {*}
 *
 * @returns {Object[]}
 */
const productList = async (req, res) => {
  try {
    logger(req.query);
    const page = req.query.page || 0;
    if (page && page <= 0) {
      throw new Error("page cannot be negative");
    }
    const list = await Product.find({})
      .limit(page ? 5 : 0)
      .skip((page - 1) * 5);
    list.total = list.length;
    return apiResponse.successResponseWithData(res, "Operation success", list);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

const productDetails = async (req, res) => {
  try {
    logger(req.params);
    const productName = req.params.productName;
    const product = await Product.find({ productName });
    if (!product) {
      throw new Error("product no found");
    }
    return apiResponse.successResponseWithData(
      res,
      "Operation success",
      product
    );
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};
/**
 *
 * @param {*} req
 * @param {*} res
 * @returns {Product}
 */
const ProductStore = async (req, res) => {
  try {
    let product = null;
    product = await Product.findOne({ productName: req.body.productName });
    if (product) {
      throw new Error("productName already exist");
    }
    const { productName, productType, price, cost, desc } = req.body;
    product = new Product({
      productName,
      productType,
      price,
      cost,
      desc
    });
    const result = await product.save();
    return apiResponse.successResponseWithData(res, "Operation success", result);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

const ProductUpdate = async (req, res) => {
  try {
    logger(req.params, req.body);

    const _id = req.params.id;

    const result = await Product.findOneAndUpdate({ _id }, req.body);

    return apiResponse.successResponseWithData(res, "Operation success", result);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

const ProductDelete = async (req, res) => {
  try {
    logger(req.params);

    const _id = req.params.id;

    const result = await Product.findByIdAndRemove({ _id });

    return apiResponse.successResponseWithData(res, "Operation success", result);
  } catch (err) {
    return apiResponse.ErrorResponse(res, err);
  }
};

module.exports = {
  productList,
  productDetails,
  ProductStore,
  ProductUpdate,
  ProductDelete
};
