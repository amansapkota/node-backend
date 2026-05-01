import prisma from "../../lib/prisma.js";

export const createOrder = async (req, reply) => {
    try{

        const {userId} = req.user;
        const {items, branch, totalPrice} = req.body;

        const customerData = await prisma.customer.findbyId(userId)
        const branchData = await prisma.branch.findbyId(branch)


        if(!customerData){
            return reply.status(404).send({message: "Customer not found "});
        }

        const newOrder = new Order({
            customer:userId,
            items:items.map((item)=> ({
                id:item.item,
                count:item.count
            })),
            branch,
            totalPrice,
            deliveryLocation:{
                latitude: customerData.deliveryLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address: customerData.address || "No address available",
            },
            pickupLocation:{
                latitude: branchData.location.latitude,
                longitude: branchData.location.longitude,
                address: branchData.address || "NO address available",
            },
        })

        const savedOrder = await newOrder.save()
        return reply.status(201).send(savedOrder)
    } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'An error occurred while creating the order.', error});
    }
} 

export const confirmOrder = async(req, reply)=>{
    try{
        const {orderId} = req.params;
        const {userId} = req.user;
        const {deliveryPersonLocation} = req.body;

        const deliveryPerson = await prisma.deliverypartner.findbyId(userId);

        if(!deliveryPerson){
            return reply.status(404).send({message:"Delivery Person not found "});
        }

        const order = await prisma.order.findbyId(orderId)
        if(!order) return reply.status(404).send({message:"Order not found "});


        if(order.status !== available){
            return reply.status(400).send({message:"Order is not available"});
        }

        order.status = "confirmed";

        order.deliverypartner =userId;
        order.deliveryPersonLocation ={
            latitude: deliveryPersonLocation?.latitude,
            longitude: deliveryPersonLocation.longitude,
            address: deliveryPersonLocation.address || ""
        };
        req.server.io.to(orderId).emit("orderConfirmed", order);
        await order.save()

        return reply.send(order)
    } catch (error){
        return reply.status(500).send({message:"failed to confirm order", error})
    }
}

export const updateOrderStatus=async(req,reply)=>{
    try{
        const {orderId} = req.params;
        const {status, deliveryPersonLocation} = req.body;
        const{userId} = req.user;

        const deliveryPerson = await prisma.deliverypartner.findbyId(userId);
        if(!deliveryPerson) {
            return reply.status(404).send({message:"Delivery Person not found "})
        }

        const order = await prisma.order.findbyId(orderId);
        if(!order) return reply.status(404).send({message:"order not found "})

        if (["cancelled", "delivered"].includes(order.status)){
            return reply.status(400).send({message:"Order cannot be updated"});
        }

        if (order.deliverypartner.toString() !== userId){
            return reply.status(403).send({message:"Unauthorized"});
        }

        order.status = status;
        order.deliveryPersonLocation= deliveryPersonLocation;
        await order.save();

        req.server.io.to(orderId).emit("liveTrackingUpdates", order);

        return reply.send(order);

    } catch (error){
        return reply.status(500).send({message:"failed to confirm order", error})
    }
}


export const getOrders = async (req, reply) => {
    try{
        const {status, customerId, deliverypartnerId, branchId} = req.query;
        let query = {};

        if(status){
            query.status =status;
        }

        if (customerId){
            query.customer =customerId;
        }

        if (deliverypartnerId) {
            query.deliverypartner = deliverypartnerId;
            query.branch = branchId;
        }

        const orders = await prisma.order.find(query).populate(
            "Customer branch items.item dleiveryPartner"
        )

        return reply.send(orders);
    } catch (error){
        return reply.status(500).send({message:"failed to get orders", error})
    }
}


export const getOrdersById = async (req, reply) => {
    try{
        const {orderId} = req.params;

        const order = await prisma.order.findbyId(orderId).populate(
            "customer branch items.item deliveryPartner"
        );
        if(!order){
            return reply.status(404).send({message:"order not found "})
        }
        return reply.send(order);
    } catch (error) {
        return reply.status(500).send({message:"Failed to retrieve order", error })
    }
}

export { getOrdersById as getOrderById }