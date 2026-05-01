import prisma from "../../lib/prisma.js";
import jwt from "jsonwebtoken";

const genrateTokens = (user) => {
    // Prisma user objects use `id` (not `_id`). Ensure we sign the correct fields.
    const accessToken = jwt.sign(
        { userId: user.id, role: String(user.role) },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, role: String(user.role) },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

export const loginCustomer = async (req, reply)=>{
    try{
        const { phone } = req.body;
        // Store phone as a string to avoid integer overflow in the DB.
        // Trim and remove non-digit characters to store a normalized phone string.
        const phoneStr = phone == null ? null : String(phone).replace(/\D+/g, '').trim();

        if (!phoneStr) {
            return reply.status(400).send({ message: 'Phone is required' });
        }

        let customer = await prisma.customer.findUnique({ where: { phone: phoneStr } });

        if (!customer) {
            // role defaults to Customer in Prisma schema; set explicitly for clarity
            customer = await prisma.customer.create({ data: { phone: phoneStr, role: 'Customer', isActivated: true } });
        }

        const { accessToken, refreshToken } = genrateTokens(customer);

        return reply.status(200).send({ message: 'Login successful', accessToken, refreshToken, customer });

    } catch (error){
        return reply.status(500).send({ message: 'Internal Server Error', error: error.message });
    }
}


export const loginDeliveryPartner = async (req, reply)=> {
    try{
        const {email, password} = req.body;
        const deliveryPartner = await prisma.deliveryPartner.findUnique({ where: { email } });
    
        if(!deliveryPartner ) {
            return reply.status(404).send({message: "Delivery Partner not found"});
        }

        const isMatch = password === deliveryPartner.password;
        
        if(!isMatch) {
            return reply.status(401).send({message: "Invalid credentials"});
        }

        const { accessToken, refreshToken } = genrateTokens(deliveryPartner);

        return reply.send({
            message: 'Login Successful',
            accessToken,
            refreshToken,
            deliveryPartner,
        });
    }catch (error){
        return reply.status(500).send({message: "Internal Server Error" , error: error.message});
    }
}

export const refreshToken = async(req, reply) => {
    const {refreshToken} = req.body

    if(!refreshToken){
        return reply.status(401).send({message:"Refresh token required"});
    }
    try {

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        let user;

        if (decoded.role === 'Customer') {
            user = await prisma.customer.findUnique({ where: { id: decoded.userId } });
        } else if (decoded.role === 'DeliveryPartner') {
            user = await prisma.deliveryPartner.findUnique({ where: { id: decoded.userId } });
        } else {
            return reply.status(403).send({ message: 'Invalid Role' });
        }

        if (!user) {
            return reply.status(403).send({ message: 'User not found ' });
        }

        const { accessToken, refreshToken: newRefreshToken } = genrateTokens(user);

        return reply.send({
            message: 'Token Refreshed',
            accessToken,
            refreshToken: newRefreshToken,
        });

    } catch (error) {
        return reply.status(403).send({message:"Invalid Refresh Token "})
    }
}


export const fetchUser =  async (req, reply)=> {
    try {

        const {userId, role} = req.user;
        let user;

        if (role === "Customer" ){
            user = await prisma.customer.findUnique({ where: { id: userId } });
        } else if (role === "DeliveryPartner") {
            user = await prisma.deliveryPartner.findUnique({ where: { id: userId } });
        } else {
            return reply.status(403).send({message:"Invalid Role"})
        }

        if (!user) {
            return reply.status(404).send({message:"User not found"});
        }

        return reply.send({
            message: "User Fetched Successfully",
            user,
        })
    } catch (error) {
        return reply.status(500).send({message:"An error occurred", error});
    }
}