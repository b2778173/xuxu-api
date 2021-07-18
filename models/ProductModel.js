const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    discountId: {
        type: Schema.ObjectId,
        ref: "Discount"
    },
    photoURL: { type: String },
    productName: {
        type: String,
        required: true,
        maxlength: 50
    },
    productType: {
        type: String,
        required: true,
        maxlength: 50
    },
    price: {
        type: Number,
        min: 0,
        default: 0
    },
    cost: {
        type: Number,
        min: 0,
        default: 0
    },
    desc: {
        type: String,
        maxlength: 100,
        default: ""
    }

}, { id: true, timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);