import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({ 
    cloud_name: 'du8iz6lnx', 
    api_key: '396516766454422', 
    api_secret: '7r6iJruRWpPfXepqO2tRm2FD8GY' 
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image"
        });
        console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("filepath is required")
        return null;
    }
}


export { uploadOnCloudinary }