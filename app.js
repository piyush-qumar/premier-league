//required packages
const express = require("express");
const dotenv=require('dotenv');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const {v4 : uuidv4} = require('uuid')
const morgan=require("morgan");


const app = express();
app.use(morgan("dev"));
app.use((req,res,next)=>{
    console.log("Middleware response check");
    next();
}),
app.use((req,res,next)=>{
    req.requestime= new Date().toISOString();
    next();
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
//server connection confirmation

app.get('/',(req,res)=>{
    res.status(200).send("hello from the server")
    console.log("bonjour")
});
//===========mongos===========
dotenv.config({path:'./config.env'});
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser:true
    //useCreateIndex:true,
    //useFindAndModify:false
    }).then(()=>{
        console.log('Connected to Database');
    }).catch(err=>{
        console.log(err);
    });
    const limit = (val) => {
        return val.length === 2;
    }
    const matchSchema=new mongoose.Schema({
        matchbetween:{
            type:String,
            required:[true,'matcbetween is required'],
            unique:true,
            trim:true,
        },
        player1score:{
            type:[Number],
            validate: [limit, 'scores must be 2'],
            required:[true,'player1score is required']
        },
        player2score:{
            type:[Number],
            validate:[limit,'score must be of two players'],
            required:[true,'player2score is required']
        },
        player3score:{
            type:[Number],
            validate:[limit,'score must be of two players'],
            required:[true,'player3score is required']
        },
        player4score:{
            type:[Number],
            validate:[limit,'score must be of two players'],
            required:[true,'player4score is required']
        },
        player5score:{
            type:[Number],
            validate:[limit,'score must be of two players'],
            required:[true,'player5score is required']
        },
        netrunrate1:{ type:Number,
                    default:0,
                },
                netrunrate2:{ type:Number,
                    default:0, },
                netrunrate3:{ type:Number,
                    default:0, },
                finalmatchrr1:{type:Number,
                    default:0,},
                finalmatchrr2:{ type:Number,
                    default:0, },
        winner:{ type:Number}                                });
    const Match=mongoose.model('Match',matchSchema);

    //=====================mongos end==========================
//function for correcting to desired decimal places
function roundTo(n, digits) {
    if (digits === undefined) {
      digits = 0;
    }
  
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    var test =(Math.round(n) / multiplicator);
    return +(test.toFixed(digits));
  }

//-----------------------------routes----------------------------------

//const router=express.Router();
const postreqm1=async(req,res)=>{
    try{
        console.log(req.requestime);
        console.log(req.body);
        const newmatch1=await Match.create(req.body);
        //const matId=1;
        //console.log(matId);
        const matchid=uuidv4();
        //const mat=Object.assign({id:matId,rematchid:matchid},req.body)
        const finteam1=newmatch1.player1score[0]+newmatch1.player2score[0]+newmatch1.player3score[0]+newmatch1.player4score[0]+newmatch1.player5score[0];
        const finteam2=newmatch1.player1score[1]+newmatch1.player2score[1]+newmatch1.player3score[1]+newmatch1.player4score[1]+newmatch1.player5score[1];
        const rr1=finteam1/5;
        const rr2=finteam2/5;
        newmatch1.winner=rr1>rr2?1:2;
        const nrr=Math.abs(rr1-rr2);
        // newmatch1.netrunrate=nrr;
        if(rr1>rr2){
            newmatch1.netrunrate1=roundTo(nrr,2);
            newmatch1.netrunrate2=-roundTo(nrr,2);}else{
                newmatch1.netrunrate2=roundTo(nrr,2);
                newmatch1.netrunrate1=-roundTo(nrr,2);
            }
        newmatch1.save();
        res.status(200).json({
            message:"The match summary between team 1 and team 2 is as follows:",
            requestAt:req.requestime,
            data:{newmatch1
                ,finteam1,finteam2,rr1,rr2},
                winner:rr1>rr2?"team 1 is the winner with NRR"+" "+roundTo((rr1-rr2),3)+" credited to it":"team 2 is the winner with NRR"+" "+roundTo((rr2-rr1),3)+" credited to it",
                

        })
        //next();
    }catch(err){
        console.log(err);
    }
};
const postreqm2=async(req,res)=>{
    try{
        console.log(req.requestime);
        console.log(req.body);
        const newmatch2=await Match.create(req.body);
        //const matId=2;
        //in case of rematches
        const matchid=uuidv4();
        //console.log(matId);
        //const mat=Object.assign({id:matId,rematchid:matchid},req.body)
        const finteam2=newmatch2.player1score[0]+newmatch2.player2score[0]+newmatch2.player3score[0]+newmatch2.player4score[0]+newmatch2.player5score[0];
        const finteam3=newmatch2.player1score[1]+newmatch2.player2score[1]+newmatch2.player3score[1]+newmatch2.player4score[1]+newmatch2.player5score[1];
        const rr2=finteam2/5;
        const rr3=finteam3/5;
        const nrr=Math.abs(rr2-rr3);
        // newmatch2.winner=rr2>rr3?2:3;
        // newmatch2.netrunrate=nrr;
        if(rr2>rr3){
            newmatch2.netrunrate2=newmatch2.netrunrate2+roundTo(nrr,2);
            newmatch2.netrunrate3=-roundTo(nrr,2);}else{
                newmatch2.netrunrate3=roundTo(nrr,2);
                newmatch2.netrunrate2=newmatch2.netrunrate2-roundTo(nrr,2);
            }
        newmatch2.save();
        res.status(200).json({
            message:"The match summary between team 2 and team 3 is as follows:",
            requestime:req.requestime,
            data:{newmatch2
                ,finteam2,finteam3,rr2,rr3},
                winner:rr2>rr3?"team 2 is the winner with NRR"+" "+roundTo((rr2-rr3),3)+" credited to it":"team 3 is the winner with NRR"+" "+roundTo((rr3-rr2),3)+" credited to it",

        })
    }catch(err){
        console.log(err);
    }
};
const postreqm3=async(req,res)=>{
    try{
    console.log(req.requestime);
    console.log(req.body);
    //const matId=3;
    //console.log(matId);
    const newmatch3=await Match.create(req.body);
    const matchid=uuidv4();
    //const mat=Object.assign({id:matId,rematchid:matchid},req.body)
    //console.log(mat.player1score[0]);
    const finteam1=newmatch3.player1score[0]+newmatch3.player2score[0]+newmatch3.player3score[0]+newmatch3.player4score[0]+newmatch3.player5score[0];
    const finteam3=newmatch3.player1score[1]+newmatch3.player2score[1]+newmatch3.player3score[1]+newmatch3.player4score[1]+newmatch3.player5score[1];
    const rr1=finteam1/5;
    const rr2=finteam3/5;
    const nrr=Math.abs(rr1-rr2);
    // newmatch3.winner=rr1>rr2?1:3;
    // newmatch3.netrunrate=nrr;
    if(rr1>rr2){
        newmatch3.netrunrate1=newmatch3.netrunrate1+roundTo(nrr,2);
        newmatch3.netrunrate3=newmatch3.netrunrate3-roundTo(nrr,2);}else{
            newmatch3.netrunrate3=newmatch3.netrunrate3+roundTo(nrr,2);
            newmatch3.netrunrate1=newmatch3.netrunrate1-roundTo(nrr,2);
        }
    newmatch3.save();
    // if(rr1>rr2){
    //     res.send("team 1 is the winner")}
    res.status(200).json({
        message:"The match summary between team 1 and team 3 is as follows:",
        data:{newmatch3
            ,finteam1,finteam3,rr1,rr2},
             winner:rr1>rr2?"team 1 is the winner with NRR"+" "+roundTo((rr1-rr2),3)+" credited to it":"team 3 is the winner with NRR"+" "+roundTo((rr2-rr1),3)+" credited to it",
             
            // if(rr1>rr2){
            //     ("team 1 is the winner")}
    })
}catch(err){
    console.log(err);
}
};

const patchreqm1=async(req,res)=>{
    try{
        console.log(req.requestime);
        console.log(req.body);
        const updatedmatch1=await Match.findByIdAndUpdate(req.params.id,req.body,{new:true});
        updatedmatch1.netrunrate1=0;
        updatedmatch1.netrunrate2=0;
        runValidators:true;
        const finteam1=updatedmatch1.player1score[0]+updatedmatch1.player2score[0]+updatedmatch1.player3score[0]+updatedmatch1.player4score[0]+updatedmatch1.player5score[0];
        const finteam2=updatedmatch1.player1score[1]+updatedmatch1.player2score[1]+updatedmatch1.player3score[1]+updatedmatch1.player4score[1]+updatedmatch1.player5score[1];
        const rr1=finteam1/5;
        const rr2=finteam2/5;
        const nrr=Math.abs(rr1-rr2);
        // updatedmatch1.netrunrate=nrr;
        // updatedmatch1.winner=rr1>rr2?1:2;
        if(rr1>rr2){
            updatedmatch1.netrunrate1=roundTo(nrr,2);
            updatedmatch1.netrunrate2=updatedmatch1.netrunrate2-roundTo(nrr,2);}else{
                updatedmatch1.netrunrate2=roundTo(nrr,2);
                updatedmatch1.netrunrate1=updatedmatch1.netrunrate1-roundTo(nrr,2);
            }
        updatedmatch1.save();
        res.status(200).json({
            message:"The match summary between team 1 and team 2 is as follows:",
            requestime:req.requestime,
            data:{updatedmatch1
                ,finteam1,finteam2,rr1,rr2},
                winner:rr1>rr2?"team 1 is the winner with NRR"+" "+roundTo((rr1-rr2),3)+" credited to it":"team 2 is the winner with NRR"+" "+roundTo((rr2-rr1),3)+" credited to it",
        })
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err
        })
    }
}
const patchreqm2=async(req,res)=>{
    try{
        console.log(req.requestime);
        console.log(req.body);
        
        const updatedmatch2=await Match.findByIdAndUpdate(req.params.id,req.body,{new:true});
        updatedmatch2.netrunrate2=0;
        updatedmatch2.netrunrate3=0;
        runValidators:true;
        const finteam2=updatedmatch2.player1score[0]+updatedmatch2.player2score[0]+updatedmatch2.player3score[0]+updatedmatch2.player4score[0]+updatedmatch2.player5score[0];
        const finteam3=updatedmatch2.player1score[1]+updatedmatch2.player2score[1]+updatedmatch2.player3score[1]+updatedmatch2.player4score[1]+updatedmatch2.player5score[1];
        const rr2=finteam2/5;
        const rr3=finteam3/5;
        const nrr=Math.abs(rr2-rr3);
        // updatedmatch2.netrunrate=nrr;
        // updatedmatch2.winner=rr2>rr3?2:3;
        if(rr2>rr3){
            updatedmatch2.netrunrate2=roundTo(nrr,2);
            updatedmatch2.netrunrate3=updatedmatch2.netrunrate3-roundTo(nrr,2);}else{
                updatedmatch2.netrunrate3=roundTo(nrr,2);
                updatedmatch2.netrunrate2=updatedmatch2.netrunrate2-roundTo(nrr,2);
            }
        updatedmatch2.save();
        res.status(200).json({
            message:"The match summary between team 2 and team 3 is as follows:",
            requestime:req.requestime,
            data:{updatedmatch2
                ,finteam2,finteam3,rr2,rr3},
                winner:rr2>rr3?"team 2 is the winner with NRR"+" "+roundTo((rr2-rr3),3)+" credited to it":"team 3 is the winner with NRR"+" "+roundTo((rr3-rr2),3)+" credited to it",
        })
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err
        })
    }
}
const patchreqm3=async(req,res)=>{
    try{
        console.log(req.requestime);
        console.log(req.body);
        const updatedmatch3=await Match.findByIdAndUpdate(req.params.id,req.body,{new:true});
        updatedmatch3.netrunrate3=0;
        updatedmatch3.netrunrate1=0;
        runValidators:true;
        const finteam1=updatedmatch3.player1score[0]+updatedmatch3.player2score[0]+updatedmatch3.player3score[0]+updatedmatch3.player4score[0]+updatedmatch3.player5score[0];
        const finteam3=updatedmatch3.player1score[1]+updatedmatch3.player2score[1]+updatedmatch3.player3score[1]+updatedmatch3.player4score[1]+updatedmatch3.player5score[1];
        const rr1=finteam1/5;
        const rr2=finteam3/5;
        const nrr=Math.abs(rr1-rr2);
        // updatedmatch3.netrunrate=nrr;
        // updatedmatch3.winner=rr1>rr2?1:3;
        if(rr1>rr2){
            updatedmatch3.netrunrate1=roundTo(nrr,2);
            updatedmatch3.netrunrate3=updatedmatch3.netrunrate3-roundTo(nrr,2);}else{
                updatedmatch3.netrunrate3=roundTo(nrr,2);
                updatedmatch3.netrunrate1=updatedmatch3.netrunrate1-roundTo(nrr,2);
            }
        updatedmatch3.save();
        res.status(200).json({
            message:"The match summary between team 1 and team 3 is as follows:",
            requestime:req.requestime,
            data:{updatedmatch3
                ,finteam1,finteam3,rr1,rr2},
                winner:rr1>rr2?"team 1 is the winner with NRR"+" "+roundTo((rr1-rr2),3)+" credited to it":"team 3 is the winner with NRR"+" "+roundTo((rr2-rr1),3)+" credited to it",
        })
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err
        })
    }
}

const getfinalnrr=async(req,res)=>{
    try{
        const stats=await Match.aggregate([
            {
                $group:{
                    _id:null,
                    netrunrate1:{$sum:"$netrunrate1"},
                    netrunrate2:{$sum:"$netrunrate2"},
                    netrunrate3:{$sum:"$netrunrate3"},
                }
            }
        ]);
        res.status(200).json({
            message:"The final NRR is as follows:",
            requestime:req.requestime,
            data:{stats,
                netrunrate1:stats[0].netrunrate1,
                netrunrate2:stats[0].netrunrate2,
                netrunrate3:stats[0].netrunrate3},
                qualifier1:stats[0].netrunrate1>stats[0].netrunrate2?"team 1 is the qualifier with NRR"+" "+roundTo((stats[0].netrunrate1),3)+" credited to it":"team 2 is the qualifier with NRR"+" "+roundTo((stats[0].netrunrate2),3)+" credited to it",
                qualifier2:stats[0].netrunrate2>stats[0].netrunrate3?"team 2 is the qualifier with NRR"+" "+roundTo((stats[0].netrunrate2),3)+" credited to it":"team 3 is the qulaifier with NRR"+" "+roundTo((stats[0].netrunrate3),3)+" credited to it",
                //winner:stats[0].maxnrr==stats[0].netrunrate1?"team 1 is the winner with NRR"+" "+roundTo((stats[0].netrunrate1-stats[0].netrunrate2),3)+" credited to it":"team 2 is the winner with NRR"+" "+roundTo((stats[0].netrunrate2-stats[0].netrunrate1),3)+" credited to it",
                //winner:stats[0].netrunrate1>stats[0].netrunrate2?stats[0].netrunrate1>stats[0].netrunrate3?"team 1 is the winner with NRR"+" "+roundTo((stats[0].netrunrate1),3)+" credited to it":"team 2 is the winner with NRR"+" "+roundTo((stats[0].netrunrate2-stats[0].netrunrate1),3)+" credited to it",
                //qualifier1:stats[0].netrunrate1>stats[0].netrunrate2?stats[0].nterunrate>stats[0].netrunrate3?"team 1 is the qualifier with NRR"+" "+roundTo((netrunrate1),3)+" credited to it":"team 3 is the winner with NRR"+" "+roundTo((netrunrate3),3)+" credited to it":"team 2 is the winner with NRR"+" "+roundTo((netrunrate2),3)+" credited to it",
        })
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err

        })
    }
    };
    const postfinalmatch=async(req,res)=>{                  //postfinalmatch
        try{
            console.log(req.requestime);
            console.log(req.body);
            const finalmatch=await Match.create(req.body);
            //const matId=2;
            //in case of rematches
            const matchid=uuidv4();
            //console.log(matId);
            //const mat=Object.assign({id:matId,rematchid:matchid},req.body)
            const finteam1=finalmatch.player1score[0]+finalmatch.player2score[0]+finalmatch.player3score[0]+finalmatch.player4score[0]+finalmatch.player5score[0];
            const finteam2=finalmatch.player1score[1]+finalmatch.player2score[1]+finalmatch.player3score[1]+finalmatch.player4score[1]+finalmatch.player5score[1];
            const rr1=finteam1/5;
            const rr2=finteam2/5;
            const nrr=Math.abs(rr1-rr2);
            console.log(nrr);
            // finalmatch.winner=rr2>rr3?2:3;
            // finalmatch.netrunrate=nrr;
            if(rr1>rr2){
                finalmatch.finalmatchrr1=finalmatch.finalmatchrr1+roundTo(nrr,2);
                finalmatch.finalmatchrr2=-roundTo(nrr,2);}else{
                    finalmatch.finalmatchrr2=finalmatch.finalmatchrr2+roundTo(nrr,2);
                    finalmatch.finalmatchrr1=-roundTo(nrr,2);
                }
            finalmatch.save();
            res.status(200).json({
                message:"The match summary between team q1 and team q2 is as follows:",
                requestime:req.requestime,
                data:{finalmatch
                    ,finteam1,finteam2,rr1,rr2},
                    winner:rr1>rr2?"team 1 is the champion with NRR"+" "+roundTo((rr1),3)+" credited to it":"team 2 is the champion with NRR"+" "+roundTo((rr2),3)+" credited to it",
    
            })
        }catch(err){
            res.status(404).json({
                status:'fail',
                message:err
            })
            
        }
    };


        
const getAllMatches=async(req,res)=>{
    try{
        //console.log(req.query);
        const allMatches=await Match.find();
        res.status(200).json({
            message:"All matches are as follows:",
            data:allMatches
        })
    }catch(err){
        console.log(err);
    }
}
const getMatch=async(req,res)=>{
    try{
        console.log(req.params);
        const matchbyid=await Match.findById(req.params.id);
                        res.status(200).json({
                            status:'success',
                            message:"match found",
                            data:{matchbyid}

                            })
                        }catch(err){
                                res.status(404).json({
                                    status:'fail',
                                    message:"match not found",err
                                })
                            }
                        }
const deleteMatch=async(req,res)=>{
    try{
        const deletedmatch=await Match.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status:'success',
            message:"match deleted",
            data:{deletedmatch}
        })
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:"match not found",err
        })
    }
}


const getAllUsers=(req,res)=>{
    try{
        User.find({},(err,users)=>{
            if(err){
                res.status(500).json({
                    status:'fail',
                    message:"error in getting users"
                })
            }else{
                res.status(200).json({
                    status:'success',
                    message:"users found",
                    data:users
                })}})
    }catch(err){
        console.log(err);
        res.status(500).json({
            status:'fail',
            message:"error in getting users"
        })
    }}
const createUser=(req,res)=>{
    try{
        const user=new User(req.body);
        user.save((err,user)=>{
            if(err){
                res.status(500).json({
                    status:'fail',
                    message:"error in creating user"
                })
            }else{
                res.status(201).json({
                    status:'success',
                    message:"user created",
                    data:user
                })
            }
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            status:'fail',
            message:"error in creating user"
        })
    }}
const getUser=(req,res)=>{
    try{
        User.findById(req.params.id,(err,user)=>{
            if(err){
                res.status(500).json({
                    status:'fail',
                    message:"error in getting user"
                })
            }else{
                res.status(200).json({
                    status:'success',
                    message:"user found",
                    data:user
                })
            }
        }
        )
    }catch(err){
        console.table(err);
        res.status(500).json({
            status:'fail',
            message:"error in getting user"
        })
    }
}


//route 1 for first match between 1 and 2
//route 2 for second match between 2 and 3
//route 3 for third match between 1 and 3
//===posting about matches===
const userRouter=express.Router();
const matchRouter=express.Router();
app.use('/api/v1',userRouter);
app.use('/api/v1',matchRouter);

matchRouter.route('/de-m1')
    .post(postreqm1);
matchRouter.route('/de-m2')
    .post(postreqm2);
matchRouter.route('/de-m3') 
    .post(postreqm3);
//===patching requests about matches that need some adjustments===
matchRouter.route('/de-m1/:id')
    .patch(patchreqm1);
matchRouter.route('/de-m2/:id')
    .patch(patchreqm2);
matchRouter.route('/de-m3/:id')
    .patch(patchreqm3);
//====getting final NRR============
matchRouter.route('/finalnrr')
    .get(getfinalnrr);
matchRouter.route('/finalmatch')
    .post(postfinalmatch);
//====getting requests about matches===
matchRouter.route('/AllMatches')
    .get(getAllMatches);
matchRouter.route('/:id')
    .get(getMatch);
//====deleting a match=============
matchRouter.route('/:id')
    .delete(deleteMatch);
//--------------------user------------------------
//===getting the users supposing the users must login/signup to enter the match details===
userRouter.route('/users')
    .get(getAllUsers)
    .post(createUser);
//===getting or updating details of  the users===
userRouter.route('/users/:id')
    .get(getUser);



    // const testmatch=new Match({
    //     matchbetween:'1 and 3',
    //     player1score:[1,5],
    //     player2score:[2,5],
    //     player3score:[3,5],
    //     player4score:[4,2],
    //     player5score:[5,7],
    // });
    // testmatch.save().then(doc=>{
    //     console.log(doc);
    //     console.log('match saved');
    // }).catch(err=>{
    //     console.log(err);
    // }
    // );

const port=process.env.PORT;
//console.log(process.env);
app.listen(port,()=>{
    console.log("server started at port: ",port)
})