import mongoose from 'mongoose';

const connectionString = process.env.MONGODB_URI;

const connectDB = async () => {
    try{
        const conn = await mongoose.connect("mongodb+srv://tanujkumarcs102:Tanuj%40123@cluster0.be4xtcf.mongodb.net/Ecommerce");
        console.log(`connected to Mongodb at ${conn.connection.host}`);
    } catch (error) {
        console.log(`MongoDB error : ${error}`);
    }
}

export default connectDB;