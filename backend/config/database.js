import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error(
    "Please provide MONGODB_URI in the .env file"
  );
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Mongodb connect error", error)
    process.exit(1)
  }
}

export default connectDB
