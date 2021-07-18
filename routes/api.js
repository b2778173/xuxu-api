const express = require("express");
const authRouter = require("./auth");
const bookRouter = require("./book");
const productRouter = require("./product");


const app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/product/", productRouter);


module.exports = app;