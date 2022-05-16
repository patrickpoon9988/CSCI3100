var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

const { user, comment } = require('../models/schemas.js');
var Schema = require('../models/schemas.js');
var User_data = require('./users');
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const passwordSchema = Joi.object({
  OldPassword: Joi.string(),
  NewPassword: Joi.string().regex(/^[a-zA-Z0-9]{5,15}$/).required(),
  Conpassword: Joi.any().valid(Joi.ref('NewPassword')).required()

});
const mailer = require('../misc/mailer');
//new
const multer = require("multer");
//new
const imageModel = require("../models/upload");
const { schema } = require('../models/upload');
const { boolean } = require('joi');
//new

router.use(express.static("/public/images"));

//new
var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/images");
  },
  filename: function (req, file, callback) {

    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});


//new
var upload = multer({
  storage: Storage,
  limit: {
    fieldSize: 1024 * 1024 * 3,
  }
}).single("image"); //Field name and max count





global.temp = "";

/* GET home page. */
router.get('/shop', async (req, res, next) => {

  let products = Schema.products;
  let productsResult = await products.find({}).exec((err, productsData) => {
    if (productsData) {
      var productsChunks = [];
      var chunkSize = 3;
      for (var i = 0; i < productsData.length; i += chunkSize) {
        productsChunks.push(productsData.slice(i, i + chunkSize));
      }

      mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, Users_Result) {
        if (err) {
          console.log(err);
          return;
        } else {
   //New__3/5/2022
          if(Users_Result==null){
            res.redirect('/users/login');
          }else
          res.render('shop/shop', { money: Users_Result.Money, data: productsData });
        }
      });
    }
  });

});


// Added the home page for the main site before login
router.get('/', async (req, res, next) => {
  console.log('homepage');
  res.render('user/homepage', { layout: 'login' });

});
//----------------------------------------------------




router.post('/shop', function (req, res) {

  temp = req.body.item;
  console.log("rBody:", temp);
  res.redirect('/itempage');

});




router.post('/clean', function (req, res) {


  console.log("dllmlmlmlmlmlml:");

});









router.post('/itempage', async (req, res) => {
  console.log("price", req.body);

  mongoose.model('user').findOne({ email: User_data.loginEmail }, async (err, temp_User) => {
    if (err) {
      console.log(err);
      return;
    }

    mongoose.model('products').findOne({ imagePath: temp }, async (err, productsData) => {
      try {
        if (err) {
          console.log(err);
          return;
        }
        if (productsData.Owner != temp_User.Name) {
          if (productsData.price < temp_User.Money) {
            console.log("dealing");
            var Updated_User = await Schema.user.findOne({ email: User_data.loginEmail });
            var Updated_product = await Schema.products.findOne({ imagePath: temp });
            var Updated_Owner = await Schema.user.findOne({ Name:productsData.Owner});
            Updated_Owner.No_product--;
            console.log("updated_user",Updated_Owner);
            Updated_Owner.Money+=Updated_product.price;
            Updated_User.No_product++;
            Updated_User.Money = temp_User.Money - Updated_product.price;
            Updated_product.Owner = temp_User.Name;
            await Updated_Owner.save();
            await Updated_User.save();
            await Updated_product.save();
            console.log("done: ", Updated_product);

            res.redirect('/shop');
          } else {
            res.render('shop/item', { data: productsData, money: temp_User.Money, error: "Not Enough Money!!" });
          }

        } else {
          res.render('shop/item', { data: productsData, money: temp_User.Money, error: "You are the Owner!" });
        }


        //return
      } catch (error) {
        console.log(error);
        return;
      }


    });
  });
});



router.get('/itempage', async (req, res, next) => {

  mongoose.model('products').findOne({ imagePath: temp }).exec((err, productsData) => {

    if (err) {
      console.log(err);
      return;
    }

    //return
    mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, Users_Result) {
      if (err) {
        console.log(err);
        return;
      } else {
        if(Users_Result==null){
          res.redirect('/users/login');
        }else
        res.render('shop/item', { money: Users_Result.Money, data: productsData, error: null });
      }
    });





  });










});








router.get('/user', async (req, res, next) => {
  let user = Schema.user;
  if(User_data.loginEmail==undefined){
    res.redirect('/users/login');
    return;
  }
  let usersResult = await user.findOne({ email: User_data.loginEmail }).exec((err, userData) => {
    mongoose.model('user').find({ email: User_data.loginEmail }, function (err, Users_Result) {
      if (err) {
        console.log(err);
        return;
      }
      else {
        mongoose.model('products').find({ Owner: Users_Result[0].Name }, function (err, Result) {
          if (err) {
            console.log(err)
            return;
          }
          else {
            mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, Users_Result) {
              if (err) {
                console.log(err);
                return;
              } else {
                mongoose.model('comment').find({ to_user: Users_Result.Name }, function (err, comments){
                  console.log("comments",comments);
                  res.render('user/profile', { money: Users_Result.Money, data: Users_Result, data2: Result, check: true ,data3:comments});
                });
              }
            });
          }
        });
      }
    });


  });
});



router.post('/admin/user', async (req, res, next) => {
  console.log(req.body.email)
  let usersResult = await user.findOne({ email: req.body.email }).exec((err, userData) => {
    mongoose.model('user').findOne({ email: userData.email }, function (err, Users_Result) {
      if (err) {
        console.log(err);
        return;
      }
      else {

        mongoose.model('products').find({ Owner: Users_Result.Name }, function (err, Result) {
          if (err) {
            console.log(err)
            return;
          }
          else {
            mongoose.model('user').findOne({ email: req.body.email }, function (err, User_Result) {
              if (err) {
                console.log(err);
                return;
              } else {
                console.log(User_Result)
                mongoose.model('comment').find({ to_user: Users_Result.Name }, function (err, comments){
       
                console.log("dsfhsb",comments)
                res.render('user/profile', { admin:true,layout: "adminlayout", money: User_Result.Money, data: Users_Result, data2: Result ,data3:comments});
                });
              }
            });
          }
        });
      }
    });


  });




})



router.get("/user/setting", async (req, res) => {
  //res.render('home')
  let imageresult = await imageModel.find({}).exec(function (err, data) {
    if (err) throw err;

    //New__3/5/2022

    mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, User_Result) {
      if (err) {
        console.log(err);
        return;
      } else {
        if(User_data.loginEmail==undefined){
          res.redirect('/users/login');
          return;
        }  else{
          if(User_Result==null){
            res.redirect('/users/login');
          }else
             res.render('user/usersetting', { money: User_Result.Money,records: data })
        }
        }
        
  })
});
});


router.post("/user/setting", async (req, res) => {
  console.log("request has been sent");
  console.log(req.file);
  console.log("chccc",User_data.loginEmail);
  mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, User_Result) {
 //New__3/5/2022
 if(Users_Result==null){
  res.redirect('/users/login');
  return;
}
    if (err) {
      console.log(err);
      return;
    } else {
      upload(req, res, function (err) {
        if (err) {
          console.log(err);
          return res.end("Something went wrong");
        } else {
          if (req.file != null) {
            console.log(req.file.path);
            var imageName = req.file.filename;
    
            var imageDetails = new imageModel({
              imagename: imageName,
    
            });
    
            imageDetails.save(function (err, doc) {
              if (err) throw err;
    
              console.log("Image Saved");
    
              imageModel.find({}).exec(function (err, data) {
                if (err) throw err;
    
    
                var Updated_User = Schema.user.findOneAndUpdate({ email: User_data.loginEmail }, { $set: { UserIMG: req.file.filename } }, async (err, Result) => {
                  if (err) throw err;
    
                  console.log(Updated_User)
                });
                res.render('user/usersetting', { money: User_Result.Money, records: data, success: true });
              })
            });
          } else {
            res.render('user/usersetting', { money: User_Result.Money, result: true });
          }
        }
      });
    }});

});

router.post("/admin/listalluser", async (req, res) => {

  mongoose.model('user').find({}, function (err, Users_Result) {
    console.log(Users_Result)

    // res.render('user/adminlistalluser', { success: true, layout: 'adminlayout' })
    res.render('user/adminlistalluser', { records: Users_Result, success: true, layout: 'adminlayout' })

  });
});




// Newly added admin reset password funcitonality

router.post('/admin/resetpassword', async (req, res) => {
  console.log("req.body.email", req.body.email);
  if (req.body.email == "") {

    res.render('user/adminresetpassword', {
      layout: 'adminlayout',
      error: 'Please Enter User Email',
    });
  } else {
    mongoose
      .model('user')
      .findOne({ email: req.body.email }, async (err, Users_Result) => {
        console.log(Users_Result);
        if (err) {
          console.log(err);
          return res.redirect('/admin/resetpassword');
        } else {
          if (Users_Result == null) {
            console.log('User not found');
            res.render('user/adminresetpassword', {
              layout: 'adminlayout',
              error: 'User not found',
            });
          } else {
            var newPassword =
              Math.random().toString(36).slice(2) +
              Math.random().toString(36).toUpperCase().slice(2);

            const message = `Hi there,<br/> Your Password has been changed <br/> Password: <b>${newPassword}</b>`;
            console.log(Users_Result.email);

            await mailer.sendEmail(
              '1155137891@link.cuhk.edu.hk',
              Users_Result.email,
              'Your password has been updated',
              message
            );

            const hash = await Schema.hashPassword(newPassword);
            Users_Result.password = hash;
            var updateUser = await Schema.user.findOne({
              email: Users_Result.email,
            });

            updateUser.password = hash;
            await updateUser.save();

            res.render('user/adminresetpassword', {
              success: true,
              layout: 'adminlayout',
            });

            console.log(newPassword);
            console.log(hash);
          }
        }
      });
  }
});
// -------------------------------------------------------------------------------

router.post('/user/Author', async (req, res, next) => {
  console.log(req.body.name)
  let usersResult = await user.findOne({ Name: req.body.name }).exec((err, userData) => {
    console.log(userData)
    mongoose.model('user').findOne({ email: userData.email }, function (err, Users_Result) {
      if (err) {
        console.log(err);
        return;
      }
      else {

        mongoose.model('products').find({ Owner: Users_Result.Name }, function (err, Result) {
          if (err) {
            console.log(err)
            return;
          }
          else {
            mongoose.model('user').findOne({ Name: req.body.name }, function (err, User_Result) {
              if (err) {
                console.log(err);
                return;
              } else {
                console.log(User_Result)
                mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, result) {
                  mongoose.model('comment').find({ to_user: Users_Result.Name }, function (err, comments){
       
                    if (result.Name == req.body.name) {

                      res.render('user/profile', { money: result.Money, data: Users_Result, data2: Result, check: true ,data3:comments});
                    }
                    else {
                      
                      res.render('user/profile', { money: result.Money, data: Users_Result, data2: Result ,data3:comments});
                    }});
                  
                })
              }
            });
          }
        });
      }
    });


  });





})



router.post('/user/Owner', async (req, res, next) => {
  console.log(req.body.name)
  let usersResult = await user.findOne({ Name: req.body.name }).exec((err, userData) => {
    mongoose.model('user').findOne({ email: userData.email }, function (err, Users_Result) {
      if (err) {
        console.log(err);
        return;
      }
      else {

        mongoose.model('products').find({ Owner: Users_Result.Name }, function (err, Result) {
          if (err) {
            console.log(err)
            return;
          }
          else {
            mongoose.model('user').findOne({ Name: req.body.name }, function (err, User_Result) {
              if (err) {
                console.log(err);
                return;
              } else {
                console.log(User_Result)
                mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, result) {
                  mongoose.model('comment').find({ to_user: Users_Result.Name }, function (err, comments){
       
                    if (result.Name == req.body.name) {

                      res.render('user/profile', { money: result.Money, data: Users_Result, data2: Result, check: true ,data3:comments});
                    }
                    else {
                      
                      res.render('user/profile', { money: result.Money, data: Users_Result, data2: Result ,data3:comments});
                    }                  });
                
                })
              }
            });
          }
        });
      }
    });


  });




})

//change PW

router.get("/user/changepw", async (req, res) => {
  mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, Users_Result) {
    if(Users_Result==null){
      res.redirect('/users/login');
      return;
    }
    if (err) {
      console.log(err);
      return;
    }
    else {

      console.log(Users_Result.Money);
      res.render('user/PWsetting', { money: Users_Result.Money });
    }
  });
});




router.get("/uploadItem", function (req, res) {
  mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, Users_Result) {
    if (err) {
      console.log(err);
      return;
    }
    else {
      console.log(Users_Result.Money);
      res.render('shop/uploadItem', { money: Users_Result.Money });
    }
  });
});





router.post("/uploadItem", async (req, res) => {

  mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, Users_Result) {
    if (err) {
      console.log(err);
      return;
    }else{
      console.log("check", req.body);
  
  
      upload(req, res, function (err) {
        if (err) {
          console.log(err);
          return res.end("Something went wrong");
        } else {
          if (req.file != null) {
            console.log(req.file.path);
            var imageName = req.file.filename;
    
            var imageDetails = new imageModel({
              imagename: imageName,
            });
    
            imageDetails.save(function (err, doc) {
              if (err) throw err;
    
              console.log("Image Saved");
    
              imageModel.find({}).exec(function (err, data) {
                if (err) throw err;
    
    
                res.render('shop/uploadItem', {  money: Users_Result.Money,img: req.file.filename, success: true });
              })
            });
          } else {
            res.render('shop/uploadItem', {  money: Users_Result.Money,result: true });
          }``
        }
      });
    }
  
  });

});









router.post("/confirmed", function (req, res) {

  console.log("show", req.body);
  console.log("showd", typeof (req.body.item));
  mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, Users_Result) {
    if (err) {
      console.log(err);
      return;
    }
    else {
  if (req.body.item == null || req.body.title == '' || req.body.description == '' || req.body.price == '') {
    res.render("shop/uploadItem", { error: "Please filled every blocks!" ,money:Users_Result.Money});
  } else {
       if(req.body.price<=0){
         //New__3/5/2022
        res.render("shop/uploadItem", { error: "Price must be larger 0" ,money:Users_Result.Money})
        return;
      }
        var Updated_product = new Schema.products;
        Updated_product.title = req.body.title;
        Updated_product.description = req.body.description;
        Updated_product.price = req.body.price;
        Updated_product.Owner = Users_Result.Name;
        Updated_product.Author = Users_Result.Name;
        Updated_product.imagePath = req.body.item;
        console.log("check", Updated_product);
        var Updated_User = new Schema.user(Users_Result);
        Updated_User.uploaded_product++;
        Updated_User.No_product++;
        Updated_User.save();
        Updated_product.save();
        res.redirect('/shop');
      }

  }});
  
});



router.post("/comment",async(req,res)=>{
  console.log(req.body);


  mongoose.model('user').findOne({ email: User_data.loginEmail }, async (err, Users_Result)=> {
    if (err) {
      console.log(err);
      return;
    }
    else {
      mongoose.model('user').findOne({ Name: req.body.item }, async (err, to_user_Result)=> {
        if (err) {
          console.log(err);
          return;
        }
        else {
      var new_comment = new Schema.comment;

      new_comment.to_user=req.body.item,
      new_comment.text= req.body.comment;
      new_comment.author = Users_Result.Name;
      var time= new Date();
          if (time.getMinutes()<10){
            var mins = "0"+time.getMinutes();
          }
          else
          var mins = time.getMinutes();

      var result_time = time.getHours()+":"+mins+"  "+time.getDay() +"/"+time.getMonth() +"/"+time.getFullYear() ;
      console.log("result",result_time);

      new_comment.created_at=result_time;
      console.log("uploaded",new_comment);    
      await new_comment.save();
      mongoose.model('products').find({ Owner: req.body.item}, function (err, Result) {
        if (err) {
          console.log(err)
          return;
        }
        else {
          mongoose.model('comment').find({ to_user: to_user_Result.Name }, function (err, comments){
            console.log("comments",comments);
            res.render('user/profile', { money: Users_Result.Money, data: to_user_Result, data2: Result ,data3:comments});
          });
  
        }});
    }
      });
    }
  });


});









router.post('/dailymission/:money/:product', async (req, res, next) => {
  let user = Schema.user;
  let usersResult = await user.findOne({ email: User_data.loginEmail }).exec((err, userData) => {
    mongoose.model('user').findOneAndUpdate({ email: User_data.loginEmail }, { "$set": { Money: parseInt(req.params['money']), uploaded_product: parseInt(req.params['product']) } }, function (err, Users_Result) {
      if (err) {
        console.log(err);
        return;
      }
      else {
        res.render('mission', { result: Users_Result })
        console.log(Users_Result);
      }
    });
  });
})

// made by patrick
router.get('/mission', async (req, res, next) => {
  let user = Schema.user;
  let usersResult = await user.findOne({ email: User_data.loginEmail }).exec((err, userData) => {
    mongoose.model('user').findOne({ email: User_data.loginEmail }, function (err, Users_Result) {
      if (err) {
        console.log(err);
        return;
      }
      else {
        res.render('mission', { result: Users_Result, product: Users_Result.uploaded_product });
      }
    });
  });
});

//made by patrick
router.post('/postmission/:money', async (req, res, next) => {
  console.log("sdjfbisdbfjsd");
  let user = Schema.user;
  let usersResult = await user.find({ email: User_data.loginEmail }).exec((err, userData) => {
    mongoose.model('user').findOne({ email: User_data.loginEmail }, async (err, Users_Result) => {
      if (err) {
        console.log(err);
        return;
      }
      else {
        var Updated_User = new Schema.user(Users_Result);
        Updated_User.Money = parseInt(req.params['money']);
        await Updated_User.save();
        res.render('shop/shop', { money: Users_Result.Money });
        console.log("2,", Updated_User);
      }
    });
  });

})



router.post("/user/changepw", async (req, res) => {

  mongoose.model('user').findOne({ email: User_data.loginEmail }, async (err, Users_Result) => {
    if (err) {
      console.log(err);
      return;
    }
    else {
      if (req.body.OldPassword == '' || req.body.NewPassword == '' || req.body.Conpassword == '') {
        res.render('user/PWsetting', { money: Users_Result.Money, error: "Please fill all the blanks" });
      }

      var checkPW = await bcrypt.compare(req.body.OldPassword, Users_Result.password);
      console.log("checkPW", checkPW);
      if (checkPW || Users_Result.password == req.body.OldPassword) {
        const result = passwordSchema.validate(req.body);
        console.log(result);
        if (result.error) {
          res.render('user/PWsetting', { money: Users_Result.Money, error: "Please Set A Password with length 5" });
        } else {
          if (req.body.NewPassword == req.body.Conpassword) {
            var Updated_User = await Schema.user.findOne({ email: User_data.loginEmail });
            const salt = await bcrypt.genSalt(9);

            const hash = await bcrypt.hash(req.body.NewPassword, salt);

            Updated_User.password = hash;
            console.log("changed pw", Updated_User);
            Updated_User.save();
            res.render('user/PWsetting', { money: Users_Result.Money, error: "Done!!" });
          } else {
            res.render('user/PWsetting', { money: Users_Result.Money, error: "Confirm Password is incorrect!" });
          }



        }

      } else
        res.render('user/PWsetting', { money: Users_Result.Money, error: "WrongPW!!" });
    }
  });
});






// admin home page
router.get('/admin/home', function (req, res, next) {
  res.render('user/admin', { layout: 'adminlayout' });
});




module.exports = router;
