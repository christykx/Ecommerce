const { response, application } = require('express');
var express = require('express');
const { USER_COLLECTION } = require('../config/collections');
const productHelpers = require('../helpers/product-helpers');
const offerHelpers = require('../helpers/offer-helpers');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers')
const paypal=require('../helpers/paypal')
const CouponJS = require('couponjs');
const { TrustProductsEntityAssignmentsInstance } = require('twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEntityAssignments');
const { getWishlistProducts } = require('../helpers/user-helpers');

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn)
  {
    next()

  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function(req, res, next) {
  res.setHeader("cache-control","private,no-cache,no-store,must-revalidate");
  let user=req.session.user
  let categories = await productHelpers.getAllCategory()
  console.log("categories",categories)

// let wishlist=await userHelpers.getWishlistProducts(req.session.user._id)  
// console.log("{}}}}}}}}}}",wishlist)
  

  let cartCount=null
  if(req.session.user){

 cartCount= await userHelpers.getCartCount(req.session.user._id)

  }
  productHelpers.getAllProducts().then((products) => {  
    // res.json(products)
    for(val of products){
      for(index in val.digital ){
        val.digital[index].newOffer = val.offerPrice[index]
        val.digital[index].discount=val.discountPercentage[index]
      }
    }
    console.log(products[0],'+++++))))))))))))))))))');

  res.render('user/view-products', {admin:false,products,categories, user,cartCount});
  console.log("products",products)

  //  console.log("offerPrice",products.offer_price)
  //  console.log("discount",products.discount)
  // console.log(products[0])
  })
});

router.get('/login', function(req, res, next) {
 res.setHeader("cache-control","private,no-cache,no-store,must-revalidate"); 
 if(req.session.loggedIn){
  res.redirect('/')
 }else{
  res.render('user/login', {admin:false,"loginerr":req.session.loginerr});
  req.session.loginerr=false
 }
});

router.post('/login', function (req,res) {
 res.setHeader("cache-control","private,no-cache,no-store,must-revalidate");
  
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
       req.session.loginerr=true;
      
      res.redirect('/login')
    }
  })

});

router.get('/signup', function(req, res, next) {

   res.setHeader("cache-control","private,no-cache,no-store,must-revalidate"); 
   if(req.session.loggedIn){
    res.redirect('/')
   }else{
    res.render('user/signup', {admin:false,"signupErr":req.session.signupErr});

    req.session.signupErr=false

   }

});

// console.log(userdata,"...............");


router.post('/signup', function(req, res, next) {
  const coupon = new CouponJS({ 
    verbose: true,
    logPerformance: true
  });
  const myCoupon = coupon.generate({
    length: 6,
    characterSet: {
      builtIn: ['CHARSET_ALNUM']
    }
  });

  req.body.referralCode=myCoupon.coupons[0]

 
  userHelpers.doSignup(req.body).then((response)=>{  
      req.session.loggedIn=true
      req.session.user=response
      console.log("response.userdata","........")

      // if(req.body.referral==req.body.referralCode){
      //   req.body.wallet=req.body.wallet+50;
      // }
      res.redirect('/')
  }).catch((err)=>{
    req.session.signupErr=err
    res.redirect('/signup')
  })
  // res.render('user/signup', {admin:false});
});


router.get('/singleproduct/:id' ,verifyLogin,async(req, res)=>{
 
  let user=req.session.user
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product)
  if(req.session.user){

    cartCount= await userHelpers.getCartCount(req.session.user._id)
   
     }
  res.render('user/singleproduct',{admin:false,product,user,cartCount})

 });
 



router.get('/buy',verifyLogin,(req,res)=>{
  res.render('user/buy')
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let user=req.session.user
 
  let products= await userHelpers.getCartProducts(req.session.user._id)
   let totalValue=0
  if(products.length>0){
   totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  }
  console.log(products)
  res.render('user/cart',{admin:false,products,user,totalValue})
})


router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call")
userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
  // res.redirect('/')
  res.json({status:true})
})
})

router.get('/add-to-wishlist/:id',async(req,res)=>{
console.log("Wishlist")
userHelpers.addToWishlist(req.params.id,req.session.user._id).then(()=>{
 // res.redirect('/')
// res.json({fav:true})
// res.render('user/wishlist',{admin:false,products,user})

})
})

router.get('/wishlist',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let products= await userHelpers.getWishlistProducts(req.session.user._id)
  console.log("******************************");
  console.log(products)
  if(req.session.user){

    cartCount= await userHelpers.getCartCount(req.session.user._id)
  }   
  res.render('user/wishlist',{admin:false,products,user,cartCount})
})


router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
  response.total=await userHelpers.getTotalAmount(req.body.user)
   res.json(response)
  })
})

router.post('/remove-cart-item',(req,res,next)=>{
  console.log("Remove cart items")
  console.log(req.body)
   userHelpers.removeCart(req.body).then(()=>{
    res.json(response)
   })
})

router.post('/remove-wishlist-item',(req,res,next)=>{
  console.log("Remove wishlist items")
  console.log(req.body)
   userHelpers.removeWishlist(req.body).then(()=>{
    res.json(response)
   })
})


router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{admin:false,total,user:req.session.user})
});

router.post('/apply-coupon',verifyLogin,async(req,res)=>{

  // let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  console.log("Apply coupon")
  console.log(req.body,".....................");
  console.log(req.body.coupon,".....................");
  console.log("###########",req.session.user._id)
  let offerPrice=await offerHelpers.getOffer(req.body.coupon)
  console.log("offerPrice********",offerPrice[0])
  console.log("discount",offerPrice[0].discount_price)
  let totalPrice=await userHelpers.getTotalAmount(req.session.user._id)
  console.log("total Price",totalPrice)
  userHelpers.changeTotal(totalPrice,offerPrice[0].discount_price).then((response)=>{
  res.json(response)
  })

//  userHelpers.placeOrder(req.body,totalPrice,offerPrice[0].discount_price)

})

router.post('/place-order',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  console.log(totalPrice)
  console.log(req.body.coupon,".....................");
  let offerPrice=await offerHelpers.getOffer(req.body.coupon)
  console.log("offerPrice",offerPrice[0])
  console.log("discount",offerPrice[0].discount_price)
  let totalAmount= await userHelpers.changeTotal(totalPrice,offerPrice[0].discount_price)
 userHelpers.placeOrder(req.body,products,totalPrice,offerPrice[0].discount_price).then(async(orderId)=>{
  if(req.body['payment-method']=='cod'){
    res.json({codSuccess:true})
  }else if(req.body['payment-method']=='wallet'){
    res.json({walletSuccess:true})
  }else if(req.body['payment-method']=='paypal'){
    res.json({order:true})
    userHelpers.changePaymentStatus(orderId).then(() => {
      console.log('payal successfull')
      res.json({ paypal: true });
    }).catch((err) => {
      res.json({ status: false })
  // res.render('user/paypal')
    })
 }else if(req.body['payment-method']=='razorpay'){
  userHelpers.generateRazorpay(orderId,totalAmount).then((response)=>{
    res.json(response)
  })  
}

 })
// console.log(req.body)

});
 
router.get("/paypal",verifyLogin,async (req, res) => {
  // console.log(total,"total")
 res.render('user/paypal',{admin:false,user:req.session.user})
});


// router.post("/api/orders", async (req, res) => {
//   const order = await paypal.createOrder();
//   res.json(order);
// });

// router.post("/api/orders/:orderId/capture", async (req, res) => {
//   const { orderId } = req.params;
//   const captureData = await userHelpers.capturePayment(orderId);
//   res.json(captureData);
// });

router.post("/api/orders", verifyLogin, async(req, res) => {
  // console.log(req.session.user._id);
  // let total=await userHelpers.getTotalAmount(req.session.user._id)
  // console.log(total,"totaalllllllll");
  try{
  const order = await paypal.createOrder(5000);
  console.log(order,'order=================jjj')
  res.json(order);
   }catch(err){
    console.log('er++++++++jj')
    res.status('404').json(err)
  }
});

/* ------------------------- Paypal payment capture ------------------------- */

router.post("/api/orders/:orderId/capture", verifyLogin, async (req, res) => {
  try{
  const { orderId } = req.params;
  const captureData = await paypal.capturePayment(orderId);
  res.json(captureData);
   }catch(err){
    res.status('404').json(err)
  }
});


router.get('/order-success',verifyLogin,(req,res)=>{
 res.render('user/order-success',{admin:false,user:req.session.user})
});

router.get('/orders',verifyLogin,async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  for ( val of orders) {
    val.date = new Date(val.date).toDateString()
  }
 
  res.render('user/orders',{admin:false,user:req.session.user,orders})
});

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  console.log(products)
  res.render('user/view-order-products',{admin:false,user:req.session.user,products})
});

router.post('/cancell-order',(req,res,next)=>{
  console.log("cancelling order")
  console.log(req.body.orderId)
   userHelpers.orderCancellation(req.body.orderId).then(()=>{
    res.json(response)
   })
})


router.get('/edit-profile/:id',verifyLogin,async(req,res)=>{
  console.log("-----------------req.session.user",req.session.user)
  userHelpers.getUserDetails(req.session.user._id).then((response)=>{
    console.log("-------------++-------------",response);
    req.session.user=response
  console.log("/////////////////",req.session.user);
  res.render('user/edit-profile',{admin:false,user:req.session.user})
  })

});


router.post('/edit-profile/:id',verifyLogin,async(req,res)=>{
  
  console.log(req.body)
  console.log(req.params.id)
  let id=req.params.id
  userHelpers.updateProfile(req.params.id,req.body).then(()=>{
     res.redirect('/edit-profile/:id')
    try
    {
      let Image = req.files.image
      Image.mv('./public/profile-images/' + id + '.jpg')
    
    }catch{
      
    }

  }) 
 
})



router.get('/reset/:id',verifyLogin,(req,res)=>{
  res.render('user/reset',{admin:false,user:req.session.user})
})

router.post('/reset/:id',verifyLogin,(req,res)=>{
  console.log(req.body)
  console.log(req.params.id)

  userHelpers.updatePassword(req.params.id,req.body).then(()=>{
    res.redirect('/edit-profile/:id')
  })
})

router.get('/address/:id',verifyLogin,(req,res)=>{


    // req.session.user=response.user
    res.render('user/address',{admin:false,user:req.session.user})
  
  

})

router.post('/address/:id',verifyLogin,(req,res)=>{
  console.log(req.body)
  console.log(req.params.id)
  userHelpers.addAddress(req.params.id,req.body).then(()=>{
    res.redirect('/edit-profile/:id')
  })
})

// router.get('/update-address/:id',verifyLogin,(req,res)=>{
//   res.render('user/updateAddress',{admin:false,user:req.session.user})
// })

// router.post('/update-address/:id',verifyLogin,(req,res)=>{
//   console.log(req.body)
//   console.log(req.params.id)
//   userHelpers.updateAddress(req.params.id,req.body).then(()=>{
//     res.redirect('/edit-profile/:id')
//   })
// })


router.get('/remove-address/:id/:address',(req,res,next)=>{
  console.log("Remove address")
  console.log(req.params.id)
  console.log(req.params.address)
   userHelpers.removeAddress(req.params.id,req.params.address).then((response)=>{
    console.log(response)
    // res.json(response)
    res.redirect('/edit-profile/:id')
   })
})


// router.get('/cancel-order/:id',(req,res)=>{
//   console.log("cancel orders")
//   let orderId=req.params.id
//    userHelpers.cancelOrder(orderId).then(()=>{
//     res.redirect('/orders')

//    })
// })

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("payment successfull");
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })
})


router.post('/check-wallet',async(req,res)=>{
  console.log(req.body,"YEsssssssssssssssssssssssss");
  
  let offerPrice=await offerHelpers.getOffer(req.body.coupon)
  console.log("offerPrice********",offerPrice[0])
  console.log("discount",offerPrice[0].discount_price)
  let totalPrice=await userHelpers.getTotalAmount(req.session.user._id)
  console.log("total Price",totalPrice)
  discountAmount=await userHelpers.changeTotal(totalPrice,offerPrice[0].discount_price)
 console.log(discountAmount,"///////////");
 console.log(req.session.user.wallet);
  userHelpers.checkWallet(req.body,req.session.user.wallet,discountAmount).then((wallet)=>{
    console.log("checked balanceeeeeeeeeeee")
    console.log("----------------",wallet)
      res.json(wallet)
 
  }).catch((errr)=>{
    console.log(errr);
    res.json(errr)
  })
 
})



router.get('/logout',(req,res)=>{
  req.session.destroy() 
  res.redirect('/')
});

module.exports = router;
