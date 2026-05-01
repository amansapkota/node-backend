import prisma from "../../lib/prisma.js";


export const getAllCategories =  async (req, reply)=> {
    try{
        const categories = await prisma.category.findMany();
        return reply.send(categories);
    } catch (error){
        return reply.status(500).send({message:"An error occurred", error: error.message})
    }
};