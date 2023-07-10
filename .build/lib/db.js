"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapOwner = void 0;
const mapOwner = (owner) => !!owner ? ({
    _id: owner._id.toHexString(),
    username: owner.username
}) : { _id: "", username: "Unknown" };
exports.mapOwner = mapOwner;
