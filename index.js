const express=require("express");
const app=express()
const cors=require("cors")
app.use(express.json())
app.use(cors())

const path=require("path")
const { open } =require("sqlite");
const sqlite3=require("sqlite3")
const bcrypt=require("bcrypt")
const dbPath=path.join(__dirname,"users.db");
let db=null;

const initializeServerAndDatabase=async()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database
        })
        app.listen(3000,()=>{
            console.log('Server Running on 3000 PORT');
        })
    }catch(e){
        console.log(`DB Error ${e.message}`);
        process.exit(1);
    }
}
initializeServerAndDatabase();

// REGISTER
app.post("/register",async (request,response)=>{
    const {fullName,phoneNumber,email,password,companyName,agencyMember}=request.body;
    const getDbUser=`SELECT * FROM users WHERE email= '${email}';`;
    const dbUser=await db.get(getDbUser);

    if(dbUser===undefined){
        const hashedPassword=await bcrypt.hash(password,10);
        const registerUserQuery=`INSERT INTO users(full_name,phone_number,email,password,company_name,agency_member)
        VALUES
        (
            '${fullName}',
            ${phoneNumber},
            '${email}',
            '${hashedPassword}',
            '${companyName}',
            ${agencyMember}
        )`;
        await db.run(registerUserQuery);
        response.send("User Created Successfully ");

    }else{
        response.status(400);
        response.send("Email Already Exit")
    }
})

//LOGIN

app.post("/login",async(request,response)=>{
    const { email,password}=request.body;
    const dbUserQuery=`SELECT * FROM users WHERE email='${email}'`;
    const dbUser=await db.get(dbUserQuery);
    console.log(dbUser)

    if(dbUser===undefined){
        response.status(400);
        response.send("Invalid User");
    }else{
        const isPasswordMatch=await bcrypt.compare(password,dbUser.password);
        console.log(isPasswordMatch)
        if(isPasswordMatch===true){
            response.status(200);
            response.send("Login Success")
        }else{
            response.status(400);
            response.send("Invalid Password");
        }
    }
})