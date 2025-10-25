import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Remove deprecated options: useNewUrlParser and useUnifiedTopology
        // These are no longer needed in MongoDB driver v4+
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};