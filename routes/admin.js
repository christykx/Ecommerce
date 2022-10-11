var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers');
const offerHelpers = require('../helpers/offer-helpers');


const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn)
  {
    next()

  }else{
    res.redirect('/login')
  }
}
/* GET users listing. */
router.get('/', async function(req, res, next) {
  let totalCount= await productHelpers.getCount()
 let userCount= await userHelpers.getUserCount()  
 let productCount= await productHelpers.getProductCount()  
 let earnings=await productHelpers.getEarnings()  
  res.render('admin/sales-report',{ admin: true,totalCount ,userCount,productCount,earnings});
});

router.get('/view-products', function (req, res, next) {

  productHelpers.getAdminProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products});
  })

});

router.get('/report',async function(req,res){
  let daily =await productHelpers.dailyReport()
  let monthly = await productHelpers.monthlyReport()
  let yearly = await productHelpers.yearlyReport()
  res.json({daily,monthly,yearly})
  

  // .then((detail) => {
  //   res.json(detail)
  //   // console.log(detail,"*******************")
  //   // res.render('admin/view-products', { admin: true, products});
  // })

})

router.get('/add-product', function (req, res, next) {
  productHelpers.getAllCategory().then((categories)=>{
    console.log("category list")
    console.log(categories)
  // if(req.session.success){
  res.render('admin/add-product',{admin:true,categories})
  // req.session.success=false
  // }
  })
  
});

router.post('/add-product', function (req, res, next) {
  productHelpers.addProduct(req.body, (id) => {
    let Image = req.files.image
    Image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (err) {
        console.log("Error in adding product")
      } else {
        console.log("Successfully added")
        res.redirect('/admin/view-products')
      }
    })
    // res.render('admin/view-product', { admin: true })
  })
});

router.get('/delete-product/:id',(req,res)=>{

  let proId=req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/view-products/')
  })
 
});
router.get('/edit-product/:id',async(req,res)=>{
  
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  productHelpers.getAllCategory().then((categories)=>{
    console.log("category list")
    console.log(categories)
    res.render('admin/edit-product',{admin:true,product,categories})
  })
  
});

router.post('/edit-product/:id',async(req,res)=>{
  
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/view-products')
    try
    {
      let Image = req.files.image
      Image.mv('./public/product-images/' + id + '.jpg')
    
    }catch{
      
    }

  }) 
 
})


router.get('/view-user',(req,res)=>{
 
  res.setHeader("cache-control","private,no-cache,no-store,must-revalidate");
 
    userHelpers.getAllUsers().then((users)=>{
      console.log("Entered users list")
     console.log(users)
  res.render('admin/view-user',{admin:true,users})
 })  

})

router.get('/category-offer',(req,res)=>{
res.render('admin/category-offer',{admin:true})
})

router.get('/coupons',async(req,res)=>{

let offer=await offerHelpers.getAllOffers() 
res.render('admin/coupons',{admin:true,offer})

})

router.get('/offer-block/:id',(req,res)=>{
  console.log(req.params.id);
  let couponId=req.params.id;
  offerHelpers.blockoffer(couponId).then((response)=>{
    res.redirect('/admin/coupons')
  })
})

router.get('/offer-unblock/:id',(req,res)=>{
  let couponId=req.params.id;
  offerHelpers.unblockoffer(couponId).then((response)=>{
    res.redirect('/admin/coupons')
  })
})

router.get('/cancel-offer/:id',(req,res)=>{
  console.log("cancel offer")
  let couponId=req.params.id
   offerHelpers.canceloffer(couponId).then(()=>{
    res.redirect('/admin/coupons')

   })
})


router.get('/add-coupons',(req,res)=>{
  
  res.render('admin/add-coupons',{admin:true})
 
})

router.post('/add-coupons',(req,res)=>{
  
  console.log(req.body,"req.body..........");
  offerHelpers.addCoupons(req.body).then(()=>{
    // console.log("data",data);
    res.redirect('/admin/coupons')
  
  }).catch(err=>{
  res.render('admin/add-coupons',{admin:true,err})
    
  })

})


router.get('/delete-user/:id',(req,res)=>{
  let userId=req.params.id
  console.log("user id is")
  console.log(userId)
  userHelpers.deleteuser(userId).then((response)=>{ 
    res.redirect('/admin/view-user/')

  })
})

router.get('/view-category',(req,res)=>{
 
  res.setHeader("cache-control","private,no-cache,no-store,must-revalidate");
 
    productHelpers.getAllCategory().then((categories)=>{
    console.log("category list")
    console.log(categories)
  res.render('admin/view-category',{admin:true,categories})
  })  

})

router.get('/add-category', function (req, res, next) {

  res.render('admin/add-category', { admin: true ,"signupErr":req.session.signupErr});
  req.session.signupErr=false

});


router.post('/add-category', function (req, res) {
  
  
  console.log("Demo printing")
   console.log(req.body)
   console.log("Category body!!!")
   console.log(req.body.category)
  productHelpers.addcategory(req.body).then((result)=>{   

    res.redirect("/admin/view-category")
    }).catch((err)=>{
        req.session.signupErr=err
        res.redirect('/admin/add-category')
      })
});

router.get('/delete-category/:id',(req,res)=>{
  let ctgId=req.params.id
  console.log(ctgId)
  productHelpers.deletecategory(ctgId).then((response)=>{ 
    res.redirect('/admin/view-category')
  })
})


router.get('/edit-category/:id',async(req,res)=>{

  let category=await productHelpers.getCategoryDetails(req.params.id)
  console.log(category)
  res.render('admin/edit-category',{admin:true,category})

});


router.get('/trail',(req,res)=>{

  res.render('admin/trail',{admin:true})

});



router.post('/edit-category/:id',async(req,res)=>{
  
  let id=req.params.id
  productHelpers.updatecategory(req.params.id,req.body).then(()=>{
    res.redirect('/admin/view-category')

  })
 
})


router.get('/user-block/:id',(req,res)=>{
  let userId=req.params.id;
  userHelpers.blockUser(userId).then((response)=>{
    res.redirect('/admin/view-user')
  })
})

router.get('/user-unblock/:id',(req,res)=>{
  let userId=req.params.id;
  userHelpers.unblockUser(userId).then((response)=>{
    res.redirect('/admin/view-user')
  })
})

router.post('/cancell-order',(req,res,next)=>{
  console.log("cancelling order")
  console.log(req.body.orderId)
   userHelpers.orderCancellation(req.body.orderId).then(()=>{
    res.json(response)
   })
})

router.get('/all-orders',async(req,res)=>{
 
  let orders=await userHelpers.getAllOrders() 
  for ( val of orders) {
    val.date = new Date(val.date).toDateString()
  }
  res.render('admin/all-orders',{admin:true,orders,cancel:true,deliver:true})
});

// router.get('/cancel-order/:id',(req,res)=>{
//  console.log("Hii")
// console.log(req.params.id)
//  let orderId=req.params.id
//   console.log(orderId)
//   userHelpers.cancelOrder(orderId).then((response)=>{
//     res.redirect('/admin/all-orders/')
//   })
 
// });

router.get('/cancel-order/:id',(req,res)=>{
  console.log("cancel orders")
  let orderId=req.params.id
   userHelpers.cancelOrder(orderId).then(()=>{
    res.redirect('/admin/all-orders/')

   })
})


router.post('/edit-status/:id',(req,res)=>{
  console.log("Edit Order status")
  console.log(req.body)
  console.log(req.params.id)
  // let orderId=req.params.id
   
  if(req.body.status=="Delivered"){
    console.log("Deliverrrrrrr")     
      // $("#selectNow").find("option").remove().end().append(
      // '<option value = "Delivered">Delivered</option>');
  }
   userHelpers.editStatus(req.params.id,req.body).then(()=>{
    res.redirect('/admin/all-orders') 



   })
})


module.exports = router;
