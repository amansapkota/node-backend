import prisma from "../../lib/prisma.js";

export const updateUser = async (req, reply) => {
    try{
        const {userId} = req.user;
        const updateData = req.body;

        let user =  await prisma.customer.findById(userId) || await prisma.deliverypartner.findById(userId);

        if (!user) {
            return reply.status(404).send({message:"user not found "});
        }

        let UserModel;

        if (user.role === "Customer") {
            UserModel = Customer;
        } else if (user.role === "DeliveryPartner"){
            UserModel = DeliveryPartner;
        } else {
            return reply.status(400).status({message:"Invalid user role"})
        }

        const updateUser = await prisma.findByIdAndUpdate(
            userId,
            {$set: updateData},
            {new: true, runValidators: true}
        );

        if (!updateUser) {
            return reply.status(404).send({message:"User not found "})
        }

        reply.send({
            message:"User update successfully",
            user: updateUser,
        })
    } catch (error ){
        return reply.status(500).send({message: "Failed to update user", error});
    }
}