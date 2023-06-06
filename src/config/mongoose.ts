import mongoose from "mongoose";

const mongooseConnection = async () => {
    try {
        //console.log(process.env.MONGO_DB_URL);
        await mongoose.connect(process.env.MONGO_DB_URL || "");
        console.log('Connected to MongoDb')
    } catch (error) {
        console.log(error)
    }
}

export default mongooseConnection