import "dotenv/config";
import prisma from "./src/lib/prisma.js";
import { categories, products } from "./seedData.js";

async function seedDatabase() {
	try {
		await prisma.orderItem.deleteMany();
		await prisma.product.deleteMany();
		await prisma.category.deleteMany();

		await prisma.category.createMany({ data: categories });

		const categoryRows = await prisma.category.findMany({
			select: { id: true, name: true },
		});

		const categoryIdByName = new Map(categoryRows.map((c) => [c.name, c.id]));

		const productData = products
			.map((product) => {
				const categoryId = categoryIdByName.get(product.category);

				if (!categoryId) {
					return null;
				}

				return {
					name: product.name,
					image: product.image,
					price: Number(product.price),
					discountPrice:
						product.discountPrice === undefined || product.discountPrice === null
							? null
							: Number(product.discountPrice),
					quantity: product.quantity,
					categoryId,
				};
			})
			.filter(Boolean);

		if (productData.length > 0) {
			await prisma.product.createMany({ data: productData });
		}

		const skippedProducts = products.length - productData.length;

		console.log("DATABASE SEEDED SUCCESSFULLY");
		console.log(`Inserted categories: ${categoryRows.length}`);
		console.log(`Inserted products: ${productData.length}`);

		if (skippedProducts > 0) {
			console.log(`Skipped products (unknown category): ${skippedProducts}`);
		}
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exitCode = 1;
	} finally {
		await prisma.$disconnect();
	}
}

seedDatabase();
