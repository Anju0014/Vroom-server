import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import connectDB from './config/dbConfig';
import cookieParser from 'cookie-parser';
import customerRouter from './routes/customer/customerRoutes';
import carOwnerRouter from './routes/carOwner/carOwner';

dotenv.config();
connectDB();
const app=express();
const server=http.createServer(app);
const PORT=process.env.PORT|| 5051;


app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({ extended: true,limit:"50mb"}));
app.use(cookieParser());

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
}))

app.use("/",customerRouter);
app.use("/owner",carOwnerRouter)

server.listen(PORT,()=>{
    console.log(`Server Connected to ${PORT}`)
})




