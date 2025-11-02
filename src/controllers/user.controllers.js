import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser = asyncHandler(async (req, res) =>{
    const {name, email, password, role, phoneNumber, adminInfo}=req.body;

    
});

export {registerUser};