import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
interface IUser {
    name: string;
    age: number;
    location: string;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    location: { type: String, required: true }
});

// 3. Create a Model.
export const User = mongoose.model<IUser>('User', userSchema);