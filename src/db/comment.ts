import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
interface IComment {
    content: string;
    rate: number;
    owner: any;
}

// 2. Create a Schema corresponding to the document interface.
const commentSchema = new mongoose.Schema<IComment>({
    content: { type: String, required: true },
    rate: { type: Number, required: true },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

// 3. Create a Model.
export const Comment = mongoose.model<IComment>('Comment', commentSchema);