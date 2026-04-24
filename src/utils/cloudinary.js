import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"



cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        console.log("Uploading to cloudinary:", localFilePath); // ✅ add this
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("Cloudinary response:", response.url); // ✅ add this
        fs.unlinkSync(localFilePath)
        return response;
    } catch(err){
        fs.unlinkSync(localFilePath)
        console.log("cloudinary upload error ", err) // this will show the real error
        return null;
    }
}

export {uploadOnCloudinary}
