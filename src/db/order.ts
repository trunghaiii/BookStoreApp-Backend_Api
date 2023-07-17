
import mongoose from "mongoose";

// 1. Create an interface representing a document in MongoDB.
interface IOrder {
    name: string;
    address: string;
    phone: string;
    detail: any;
    totalPrice: number;
    createdAt: any;
    updatedAt: any;

}

// 2. Create a Schema corresponding to the document interface.
const orderSchema = new mongoose.Schema<IOrder>({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    detail: { type: [], required: false },
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
});

// 3. Create a Model.
export const Order = mongoose.model<IOrder>('Order', orderSchema);