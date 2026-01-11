"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllEntities = void 0;
const users_1 = require("./entities/users");
const product_1 = require("./entities/product");
const cart_1 = require("./entities/cart");
const order_1 = require("./entities/order");
const product_rating_1 = require("./entities/product-rating");
exports.AllEntities = [users_1.User, product_1.Product, cart_1.Cart, order_1.Order, order_1.OrderItem, product_rating_1.ProductRating];
//# sourceMappingURL=all-entities.js.map