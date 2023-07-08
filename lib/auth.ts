import { getSessionUserAsync } from "../controllers/sessionController";

type CookieString = string | null | undefined;

export const getSessionToken = (cookieString: CookieString) => cookieString?.split("; ").find(c => c.startsWith("sessionToken="))?.split("=")[1].trim();

export const isUserLogged = async (cookieString: CookieString) => !!(await getSessionUserAsync(getSessionToken(cookieString)));

export const checkOwnershipAsync = async (ownerId: string, cookieString: CookieString) => {
    const sessionUserId = await getSessionUserAsync(getSessionToken(cookieString));
    console.log("User of request " + sessionUserId + " is logged? " + !!sessionUserId);
    console.log("User of request \"" + sessionUserId + "\" is owner of resource (\"" + ownerId + "\")? " + (ownerId == sessionUserId));
    return !!sessionUserId && ownerId == sessionUserId;
}