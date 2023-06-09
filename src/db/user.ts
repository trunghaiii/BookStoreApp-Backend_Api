import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
interface IUser {
    fullName: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    avatar: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    refreshToken: string;

}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new mongoose.Schema<IUser>({
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String, required: false },
    isActive: { type: Boolean, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    refreshToken: { type: String, required: false }


});

// 3. Create a Model.
export const User = mongoose.model<IUser>('User', userSchema);