const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));



mongoose.connect("mongodb+srv://admin-chux:Venture07@cluster0.ybhggkh.mongodb.net/todolistDB", { useNewUrlParser: true });



const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Click the + button to add a new item."
});

const item3 = new Item ({
  name: "<== Click checkbox to delete an item"
});

const defaultItems = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved items to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedId = req.body.checkbox
  const listName = req.body.listName;


  if (listName === "Today") {
    Item.findByIdAndRemove({_id: checkedId}, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted item from document");
        res.redirect("/");
      }

    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});


app.get("/:customList", function(req, res){
  const customList = _.capitalize(req.params.customList);

  List.findOne({name: customList}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        //Create a new list

        const list = new List({
          name: customList,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customList);

      } else {
        //Show existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})

      }
    }
  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server has started running successfully");
});
