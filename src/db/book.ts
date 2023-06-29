import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
interface IBook {
    slider: any;
    bookName: string;
    author: string;
    price: number;
    sold: number;
    quantity: number;
    category: string;
    createdAt: any;
    updatedAt: any;

}

// 2. Create a Schema corresponding to the document interface.
const bookSchema = new mongoose.Schema<IBook>({
    slider: { type: [String], required: false },
    bookName: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    sold: { type: Number, required: true },
    quantity: { type: Number, required: true },
    category: { type: String, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },


});

// 3. Create a Model.
export const Book = mongoose.model<IBook>('Book', bookSchema);