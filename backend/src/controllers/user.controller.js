import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { jwt } from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "somethink went wrong while generating token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    const {fullName, email, password, phoneNumber, address} =req.body
    
    if(
        [fullName, email, password, phoneNumber, address].some((field) => 
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are requires");
    }

    const existUser = await User.findOne({
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


// #### login controller  ######

const loginUser = asyncHandler( async (req, res) => {
    const {email, phoneNumber, password} = req.body

    if(!email && !phoneNumber) {
        throw new ApiError(400, "email or phonrNumber is required")
    }

    const user = await User.findOne({
        $or: [{email}, {phoneNumber}]
    })

    if(!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(404, "incorrect email or phoneNumber or password")
    }

    const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "user loggedin successfully"
        )
    )

})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiError(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler( async (req, res)  =>{
    const incommingRefreahToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incommingRefreahToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incommingRefreahToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user) {
            throw new ApiError(401, "unvalid refresh token");
        }
    
        if(incommingRefreahToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired");
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookies("accessToken", accessToken, options)
        .cookies("refreshToken", newrefreshToken, options)
        .json( new ApiResponse(
            200,
            {accessToken, newrefreshToken},
            "access token created successfuly"
        ));
    } catch (error) {
        throw new ApiError(401, error?.message || refreshToken);
    }
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}