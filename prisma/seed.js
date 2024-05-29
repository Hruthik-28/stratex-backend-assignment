import prisma from "../src/db/db.config.js";
import bcrypt from "bcryptjs";

async function main() {
    async function hashPassword(password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    }

    const user1 = await prisma.user.create({
        data: {
            name: "Alice",
            email: "alice@example.com",
            password: await hashPassword("password123"),
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: "Bob",
            email: "bob@example.com",
            password: await hashPassword("password123"),
        },
    });

    const seller1 = await prisma.seller.create({
        data: {
            name: "Charlie",
            email: "charlie@example.com",
            password: await hashPassword("password123"),
            books: {
                create: [
                    {
                        title: "Book One",
                        author: "Author One",
                        publishedDate: new Date("2023-01-01"),
                        price: 19.99,
                    },
                    {
                        title: "Book Two",
                        author: "Author Two",
                        publishedDate: new Date("2023-02-01"),
                        price: 29.99,
                    },
                ],
            },
        },
    });

    const seller2 = await prisma.seller.create({
        data: {
            name: "Dave",
            email: "dave@example.com",
            password: await hashPassword("password123"),
            books: {
                create: [
                    {
                        title: "Book Three",
                        author: "Author Three",
                        publishedDate: new Date("2023-03-01"),
                        price: 39.99,
                    },
                ],
            },
        },
    });

    console.log("Seed Successfull !!!", { user1, user2, seller1, seller2 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
