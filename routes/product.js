const express = require("express");
const ProductController = require("../controllers/ProductController");

const router = express.Router();

router.get("/", ProductController.productList);
// router.get("/:id", ProductController.bookDetail);
router.post("/", ProductController.ProductStore);
// router.put("/:id", ProductController.bookUpdate);
// router.delete("/:id", ProductController.bookDelete);

module.exports = router;