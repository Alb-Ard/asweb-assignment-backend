"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPassword = exports.encryptPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const encryptPassword = (word) => {
    const length = 16;
    const salt = crypto_1.default.randomBytes(Math.ceil(length / 2))
        .toString("hex")
        .slice(0, length);
    const hash = crypto_1.default.createHmac("sha512", salt);
    hash.update(word);
    return {
        salt: salt,
        hash: hash.digest("hex")
    };
};
exports.encryptPassword = encryptPassword;
const checkPassword = (receivedPassword, savedCryptedPassword, savedSalt) => {
    const validate = (userpass, hashedpass, salt) => {
        const hash = crypto_1.default.createHmac("sha512", salt);
        hash.update(userpass);
        userpass = hash.digest("hex");
        return userpass === hashedpass;
    };
    try {
        return !!receivedPassword && validate(receivedPassword, savedCryptedPassword, savedSalt);
    }
    catch (err) {
        console.log(err);
        return false;
    }
};
exports.checkPassword = checkPassword;
