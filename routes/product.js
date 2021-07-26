const express = require("express");
const ProductController = require("../controllers/ProductController");

const router = express.Router();

router.get("/", ProductController.productList);
router.get("/:productName", ProductController.productDetails);
router.post("/", ProductController.ProductStore);
router.put("/:id", ProductController.ProductUpdate);
router.delete("/:id", ProductController.ProductDelete);

module.exports = router;