import prisma from "../../lib/prisma.js";

export const getProductsByCategoryid = async (req, reply ) => {
    const {categoryId} =  req.params;

    try{
        const products =await prisma.products.find({category: categoryId})
        .select("-category")
        .exec();

        return reply.send(products);

    } catch (error) {
        return reply.status(500).send({message:"an errro occurred", error})
    }
}

export { getProductsByCategoryid as getProductsByCategoryId }