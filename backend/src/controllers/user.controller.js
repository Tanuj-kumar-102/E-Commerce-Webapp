import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const registerUser = asyncHandler( async (req, res) => {
    const {fullName, email, password, phoneNumber, address} =req.body
    
    if(
        [fullName, email, password, phoneNumber, address].some((field) => 
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are requires");
    }

    const existUser = User.findOne({
        $or: [{email}, {phoneNumber}]
    })

    if(existUser) {
        throw new ApiError(409, "This email or phoneNumber is aleardy exist")
    }

    const avtarLocalPath = req.files?.avtar[0]?.path;

    if(!avtarLocalPath){
        throw new ApiError(400, "Avtar file is required")
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath)
    
    if(!avtar){
        throw new ApiError(400, "Avtar file is required")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        phoneNumber,
        address,
        avtar: avtar.url
    })

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createUser) {
        throw new ApiError(500, "something went wrong while user created")
    }

    return res.status(201).json(
        new ApiResponse(200,createUser, "user created successfully")
    )

});

export { registerUser }