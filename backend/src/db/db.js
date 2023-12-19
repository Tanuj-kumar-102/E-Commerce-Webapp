import mongoose from 'mongoose';

const connectionString = process.env.MONGODB_URI;

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`connected to Mongodb at ${conn.connection.host}`);
    } catch (error) {
        console.log(`MongoDB error : ${error}`);
    }
}

export default connectDB;