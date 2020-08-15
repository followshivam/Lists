//jshint esversion:6

const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");


const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shivam:9971sgt325@cluster0-0wo0b.mongodb.net/ListDb",{useNewUrlParser:true});
const itemsSchema={
  name:String };

const listSchema={
  name:String,
  items:[itemsSchema]
};

const Items= mongoose.model("Items",itemsSchema);
const item1=new Items({name:"WRITE YOUR FEEDBACK HERE"});

const Lists=mongoose.model("Lists",listSchema);


app.get("/FEEDBACK",function(req,res){
  Items.find({},function(err,result){
    if(!err){
      if(result.length===0){
        Items.insertMany([item1],function(err,found){
          if(!err){
              console.log("new list created");
          }
        });
      } else{
        res.render('list',{title:"FEEDBACK", content:result});
      }
    }
  });
});

app.post("/",function(req,res){
  var theItem=req.body.item;
  var theList=req.body.list;
  var newitem=new Items({
    name:theItem
  });
  if(theList==="FEEDBACK"){
    Items.insertMany([newitem],function(err,found){
      if(!err){
        console.log("added to list in database");
        res.redirect("/FEEDBACK");
      }
    });
  }else {
    Lists.findOne({name:theList},function(err,foundList){
      foundList.items.push(newitem);
      foundList.save();
      res.redirect("/"+theList);
    });
  }
});

app.get("/:customRoute",function(req,res){
  const routeName=req.params.customRoute||req.body.list;
  Lists.findOne({name:routeName},function(err,foundList){
    if(!err){ if(!foundList){
      const newList=new Lists({
        name:routeName,
        items:item1
      });
      newList.save();
      res.redirect("/"+routeName);
    } else{
      res.render("list",{title:routeName , content:foundList.items });
    }
  }
  });
});

app.post("/deleteItem", function(req,res){
  const id=req.body.itemid;
  const list=req.body.list;
  Lists.findOne({name:list},function(err,result){
    if(!err){
      if(list==="FEEDBACK"){
        Items.findByIdAndDelete(id,function(err){
          if(!err){
            console.log("deleted the checked item");
            res.redirect("/FEEDBACK");}
        });
      } else{
        Lists.findOneAndUpdate({name:list},{$pull:{items:{_id:id}}},
        function(err,foundList){
          if(!err){ res.redirect("/"+list); }
        });
      }
    }
  });
});

app.post("/deleteList",function(req,res){
  const id=req.body.listid;
  Lists.findByIdAndDelete(id,function(err){
    if(!err){
      console.log("List deleted");
      res.redirect("/");
    }
  })
});

app.get("/",function(req,res){
  Lists.find({},function(err,result){
    if(!err){
      res.render("app",{title:"ToDoList", content:result});
    }
  });
});

app.post("/addList",function(req,res){
  const listname=req.body.list;
  const listnew=new Lists({
    name:listname,
    items:item1
  });
  listnew.save();
  res.redirect("/");
});

let port = process.env.PORT;
if (port== null|| port== ""){
  port =3000;
}

app.listen(port,function(){
  console.log("app working on local host 3000");
});
