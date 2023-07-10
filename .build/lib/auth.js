"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOwnershipAsync = exports.isUserLogged = exports.getSessionToken = void 0;
const sessionController_1 = require("../controllers/sessionController");
const getSessionToken = (cookieString) => cookieString?.split("; ").find(c => c.startsWith("sessionToken="))?.split("=")[1].trim();
exports.getSessionToken = getSessionToken;
const isUserLogged = async (cookieString) => !!(await (0, sessionController_1.getSessionUserAsync)((0, exports.getSessionToken)(cookieString)));
exports.isUserLogged = isUserLogged;
const checkOwnershipAsync = async (ownerId, cookieString) => {
    const sessionUserId = await (0, sessionController_1.getSessionUserAsync)((0, exports.getSessionToken)(cookieString));
    console.log("User of request " + sessionUserId + " is logged? " + !!sessionUserId);
    console.log("User of request \"" + sessionUserId + "\" is owner of resource (\"" + ownerId + "\")? " + (ownerId == sessionUserId));
    return !!sessionUserId && ownerId == sessionUserId;
};
exports.checkOwnershipAsync = checkOwnershipAsync;
