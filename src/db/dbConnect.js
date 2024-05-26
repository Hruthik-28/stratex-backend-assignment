import prisma from "./db.config.js";

const dbConnect = async () => {
    try {
        await prisma.$connect();
        console.log("Connected to Database");
    } catch (error) {
        console.log("Database connection failed: ", error);
        process.exit(1);
    }
};

export default dbConnect;
