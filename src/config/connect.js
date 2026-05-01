import mysql from 'mysql2/promise';

// const connection = await mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'admin',
//   database: 'star'
// });

// console.log('MySQL connected');

export const connectDB = async(uri)=>{
    try{
        await mysql.createConnection(uri)
        console.log("Database Connected")
    } catch (error) {
        console.log("Database connection error:", error)
    }
}