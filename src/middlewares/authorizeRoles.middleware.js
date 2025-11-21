import { apiError } from "../utils/apiError.js"

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!allowedRoles.includes(req.user.role)){
            throw new apiError(403,"Access Denied!")
        }
        next();
    }
}