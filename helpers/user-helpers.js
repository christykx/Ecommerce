var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const Promise=require('promise')
const { response } = require('express')
var objectId=require('mongodb').ObjectId

const Razorpay = require('razorpay');
const { log } = require('console')
const { ReadConcern } = require('mongodb')
const { triggerAsyncId } = require('async_hooks')
var instance = new Razorpay({
    key_id: 'rzp_test_yzgaSB3MbPLXSc',
    key_secret: 'V7Sanzdgt3gskAGoUwwjp5iH',
  });

// const paypal = require('paypal-rest-sdk');
// paypal.configure({
//     'mode': 'sandbox', //sandbox or live
//     'client_id': 'AfcFiHT0hZjM-WoYXOWOwfiikwAA-Ejje0uSEixmXHxcIJweyZGJy7oOM5NJ2hOY58BU1rlE3AcgvcOS',
//     'client_secret': 'EGUpAaC7W0RaKlpbwV9mC1zfGbjKFnJ0_u98fIKssiYeUqwjQT2La-Lwksknm_IBhwZIH0N9WXKZpRN8'
//   });


// import fetch from "node-fetch";
// import "dotenv/config"; // loads env variables from .env file



module.exports={
    doSignup:(userData)=>{

     return new Promise(async(resolve,reject)=>{
      let userCheck=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
        userData.password=await bcrypt.hash(userData.password,10)
        console.log("userData.............",userData)
       
        if(userCheck){
           
            let err='Email id already exist'
            reject(err)
           }
         else{
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                
                console.log(userData);                
                resolve(userData)
            })
         }               
         let rcd=await db.get().collection(collection.USER_COLLECTION).findOne({referralCode:userData.referrals })
         console.log(rcd,"rcd........");
         console.log(userData.referrals,"referrals............");
      
         if(rcd){

          db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userData._id)},{$inc:{wallet:50}})            
           db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(rcd._id)},{$inc:{wallet:100}})
        
        }
    
    })

 },
  
 getUserCount:()=>{
 return new Promise(async(resolve,reject)=>{
    let usercount= await db.get().collection(collection.USER_COLLECTION).aggregate([
                      {
                $group:{
                    _id:null,
                    count:{$sum:1},
                }
            }

    ]).toArray()
    console.log("EEEEEEEEEEEEEEEE",usercount)
    console.log("EEEEEEEEEEEEEEEE",usercount[0].count)

    // console.log(cartItems[0].products)
    resolve(usercount[0].count)

})

},
 doLogin:(userData)=>{
    return new Promise(async(resolve,reject)=>{
        let loginStatus=false
        let response={}
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
       
        if(user){
            bcrypt.compare(userData.password,user.password).then((status)=>{
                if(status){
                    console.log("Login success")
                    response.user=user
                    response.status=true
                    resolve(response)
                }else{
                    console.log("login fail")
                    resolve({status:false})
                }
            })
        }else{
            console.log("Login failed")
        }
    })
},

getAllUsers:()=>{
    return new Promise(async(resolve,reject)=>{
       let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()   
       console.log("Printing all users")
       console.log(users)
         resolve(users)       
        
      })
  },

  
deleteuser:(userId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).deleteOne({_id:objectId(userId)}).then((response)=>{
            console.log("ID is")
            console.log(response)
            resolve(response)
        })
    })
},

doOtpLogin:(userData)=>{
    return new Promise(async(resolve,reject)=>{
        let loginStatus=false
        let response={}
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
       
        if(user){
            bcrypt.compare(userData.password,user.password).then((status)=>{
                if(status){
                    console.log("Login success")
                    response.user=user
                    response.status=true
                    resolve(response)
                }else{
                    console.log("login fail")
                    resolve({status:false})
                }
            })
        }else{
            console.log("Login failed")
        }
    })
},

blockUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        console.log(objectId(userId))
        let query={_id:objectId(userId)};
        db.get().collection(collection.USER_COLLECTION).findOneAndUpdate(query,{$set:{block:true}}).then((response)=>{
            console.log(response)
            resolve(response)
        }).catch((err)=>{
            console.log(err)
        })
    })
},

unblockUser:(userId)=>{
    return new Promise((resolve,reject)=>{
        console.log(objectId(userId))
        let query={_id:objectId(userId)};
        db.get().collection(collection.USER_COLLECTION).findOneAndUpdate(query,{$set:{block:false}}).then((response)=>{
            console.log(response)
            resolve(response)
        }).catch((err)=>{
            console.log(err)
        })
    })
},

otpLogin: (phone) => {
    return new Promise(async (resolve, reject) => {
        console.log(phone)
        let userCheck = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: phone })
        
        let response = {}
        if (userCheck) {
            response.user = userCheck
            response.status = true
            resolve(response)
        } else {
            reject('The number is not registered')
        }

    })
},


addToCart:(proId,userId)=>{
    
    let proObj={
        item:objectId(proId),
        quantity:1
    }
    return new Promise(async(resolve,reject)=>{
        let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        if(userCart){

        let proExist=userCart.products.findIndex(product=> product.item==proId)
        console.log(proExist);
        if(proExist!=-1){

            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(proId)},
            {
                $inc:{'products.$.quantity':1}
            }
            ).then(()=>{
                resolve()
            })

        }else{

            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
            {
    
                    $push:{products:proObj}          
                
            }
          
            ).then((response)=>{
                resolve()
            })

        }
        }else{
          let cartObj={
            user:objectId(userId),
            products:[proObj]
        }

        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
            resolve()
        })
        }
    })

},


getCartProducts:(userId)=>{
    
    return new Promise(async(resolve,reject)=>{
        let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                     $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
 
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }

                },
                {
                    $lookup:{

                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $lookup:{

                        from:collection.CATEGORY_COLLECTION,
                        localField:'product.category',
                        foreignField:'category',
                        as:'discount'
                    }
                },
            
                {
                    $project:{
                         item:1,
                         quantity:1,                        
                         product:{$arrayElemAt:['$product',0]},
                         discount:{$arrayElemAt:['$discount',0]},
                        //  offer:{$arrayElemAt:['$product.offer_price',0]},
                        //  disc:{$arrayElemAt:['$discount.discount',0]},                                               
                         offer_Amount:{$subtract:[{$arrayElemAt:['$product.offer_price',0]},{$divide:[{$multiply:[{$arrayElemAt:['$product.offer_price',0]}, {$arrayElemAt:['$discount.discount',0]}]},100]}]}


                    }
                },
   

        ]).toArray()
        console.log("CCCCCCCCCCCCCCCCCC",cartItems)

        // console.log(cartItems[0].products)
        resolve(cartItems)
    })
},


addToWishlist:(proId,userId)=>{
    let proObj={
        item:objectId(proId)
    }
    return new Promise(async(resolve,reject)=>{
        // let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
          let wishlistObj={
            user:objectId(userId),
            products:[proObj]
        }
        
        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:wishlistObj.user}, 
                    
            {
            $push:{products:{item:objectId(proId),
            fav:true
            }
            },       

            },
            {
                upsert:true,

            }                                      
            ).then((response)=>{
         
            resolve(response)
        })

  })  
},

getWishlistProducts:(userId)=>{
    
    return new Promise(async(resolve,reject)=>{

        // let wishlistItems= await db.get().collection(collection.WISHLIST_COLLECTION).find().toArray()
        // console.log("WishlistItems");
        // console.log(wishlistItems)
        // // console.log(cartItems[0].products)
        // resolve(wishlistItems)

        let wishlistItems= await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
            {
                 $match:{user:objectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {

                $project:{
                    item:'$products.item',
                    // quantity:'$products.quantity'
                }

            },
            {
                $lookup:{

                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,
                    // quantity:1,
                    product:{$arrayElemAt:['$product',0]}
                }
            }

    ]).toArray()
    console.log("***********",wishlistItems)
    // console.log(cartItems[0].products)
    resolve(wishlistItems)


    })
},

getWishlistCount:(userId)=>{

    return new Promise(async(resolve,reject)=>{
        let count=0
        let wishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
        if(wishlist){
            count=wishlist.products.length
        }
        resolve(count)
    })
},


getCartCount:(userId)=>{

    return new Promise(async(resolve,reject)=>{
        let count=0
        let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
        if(cart){
            count=cart.products.length
        }
        resolve(count)
    })
},

changeProductQuantity:(details)=>{

    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)
    console.log("details")
    console.log(details)
    console.log(details.count)
    return new Promise((resolve,reject)=>{

        if(details.count==-1 && details.quantity==1){

        db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
        {
            $pull:{products:{item:objectId(details.product)}}
        }
        ).then((response)=>{
            console.log(response)
            resolve({removeProduct:true})
        })

        }else{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
            {
                $inc:{'products.$.quantity':details.count}
            }
            ).then((response)=>{
                resolve({status:true})
            })
        }   
 
    })
    
},

removeCart:(details)=>{
    return new Promise((resolve,reject)=>{
    db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
    {
        $pull:{products:{item:objectId(details.product)}}
    }
    ).then((response)=>{
        console.log(response)
        resolve({removeProduct:true})
    })
    })
},

removeWishlist:(details)=>{
    return new Promise((resolve,reject)=>{
    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({_id:objectId(details.wishlist)},
    {
        $pull:{products:{item:objectId(details.product)}}
    }
    ).then((response)=>{
        console.log(response)
        resolve({removeProduct:true})
    })
    })
},


getTotalAmount:(userId)=>{
    // details.products.offer_price=parseInt(details.products.offer_price)
    // details.quantity=parseInt(details.quantity)
    return new Promise(async(resolve,reject)=>{
    
        let total= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                     $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }

                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $lookup:{

                        from:collection.CATEGORY_COLLECTION,
                        localField:'product.category',
                        foreignField:'category',
                        as:'offer'
                    }
                },
            
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$product',0]},
                        offer:{$arrayElemAt:['$offer',0]},
                        offer_Amount:{$subtract:[{$arrayElemAt:['$product.offer_price',0]},{$divide:[{$multiply:[{$arrayElemAt:['$product.offer_price',0]}, {$arrayElemAt:['$offer.discount',0]}]},100]}]}


                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$offer_Amount']}}
                    }
                }
        ]).toArray()
        console.log("tttttttttttttt",total);
        console.log(total[0].total)
        resolve(total[0]?.total)
    })

},

changeTotal:(total,discount_price)=>{
    return new Promise((resolve,reject)=>{
  let  totalAmount=total-discount_price
  console.log(totalAmount)
  resolve(totalAmount)
    })
},

placeOrder:(order,products,total,discount_price)=>{
return new Promise((resolve,reject)=>{
   console.log(order,products,total)
   console.log("discount",discount_price)
   let status;
if(order['payment-method']==='cod'|| order['payment-method']==='wallet')
{
    status='placed'
}
else{
    status='pending'
}
  
   let orderObj={
    deliveryDetails:{     
      address:order.address,
      phone:order.phone,
      city:order.city,
      pincode:order.pincode,
      coupon:order.coupon
    },
    userId:objectId(order.userId),
    useremail:order.useremail,
    paymentMethod:order['payment-method'],
    products:products,
    totalAmount:total-discount_price,
    date:new Date(),
    status:status
   }
   db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
    db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)}) 
    resolve(response.insertedId)   
   })

})
},


orderCancellation:(orderId)=>{
return new Promise((resolve,reject)=>{
    console.log("HIIIIIII");
     let status="Cancelled"
    
    db.get().collection(collection.ORDER_COLLECTION)
    .updateOne({_id:objectId(orderId)},{
    $set:{

      status:status,
      cancel:true
    }
    }).then((response)=>{
        console.log(response)
        resolve(response)
    })

   })
    
},

getCartProductList:(userId)=>{
return new Promise(async(resolve,reject)=>{
    let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
    // console.log("*****************")
    // console.log(cart);
    // console.log(cart.products);
    resolve(cart.products)

})
},

getUserOrders:(userId)=>{

    return new Promise(async(resolve,reject)=>{
        let orders= await db.get().collection(collection.ORDER_COLLECTION)
        .find({userId:objectId(userId)}).sort({date:-1}).toArray()
        resolve(orders)
    })
},

getOrderProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let orderItems= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                     $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
 
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }

                },
                {
                    $lookup:{

                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$product',0]}
                    }
                },

                // {
                //     $sort : { date : 1 }
                // }

        ]).toArray()
        console.log(orderItems)
        resolve(orderItems)

    })

},

getAllOrders:()=>{    
    return new Promise(async(resolve,reject)=>{

        let orders= await db.get().collection(collection.ORDER_COLLECTION).find().sort({date:-1}).toArray()
        
     resolve(orders)       
    })
  },


cancelOrder:(orderId)=>{
    return new Promise((resolve,reject)=>{
   
        db.get().collection(collection.ORDER_COLLECTION).deleteOne({_id:objectId(orderId)}).then((response)=>{
          console.log(response)
            resolve(response)
        })
        
    })
},


updateProfile:(userId,userDetails)=>{
                   
    return new Promise(async(resolve,reject)=>{

        // userDetails.password=await bcrypt.hash(userDetails.password,10) 
        

        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
        $set:{
          username:userDetails.username,
          email:userDetails.email,
          phone:userDetails.phone,       
        //   address:userDetails.address,
        //   password:userDetails.password

        }
        }).then((response)=>{
            resolve(response)
        })
    

    })
 },


updatePassword:(userId,userDetails)=>{
                   
    return new Promise(async(resolve,reject)=>{
        console.log(userDetails,"****")

        userDetails.password=await bcrypt.hash(userDetails.password,10) 
        console.log(userDetails.password,"........")



        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
        $set:{

          password:userDetails.password,
          cpassword:userDetails.cpassword
          
        }
        }).then((response)=>{
            console.log(response)
            resolve(response)
        })
    

    })
 },


 addAddress:(userId,userDetails)=>{
    return new Promise(async(resolve,reject)=>{

      db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)},{
        $push:{

          address:userDetails.address
        }

        }).then((response)=>{
            console.log("Update-----",response)
            resolve(response)
        })
 
    })
},

// updateAddress:(userId,userDetails)=>{
//     return new Promise(async(resolve,reject)=>{

//       db.get().collection(collection.USER_COLLECTION)
//         .updateOne({_id:objectId(userId)},{
//         $set:{

//           address:userDetails.address
//         }

//         }).then((response)=>{
//             console.log("Update-----",response)
//             resolve(response)
//         })
 
//     })
// },



removeAddress:(userId,userAddress)=>{

    console.log("HOoooooiii")
    return new Promise((resolve,reject)=>{
    console.log(userId);
    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
    {
        $pull:{address:{$eq:userAddress}}
    }
    ).then((response)=>{
        console.log(response)
        resolve({removeAddress:true})
    })

    })
},




 editStatus:(orderId,orderStatus)=>{
                   
    return new Promise(async(resolve,reject)=>{

        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},{
        $set:{

          status:orderStatus.status
        }

        }).then((response)=>{
            console.log("RRRRRRR",response)

            resolve(response)
        })

    if(orderStatus.status=="Delivered"){
        console.log("Deliver status true")
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},{
        $set:{

          deliver:true
        }
    })
    }

    })
 },

 generateRazorpay:(orderId,total)=>{
    return new Promise((resolve,reject)=>{
        console.log(total,'reached here');
        // var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })
        total =parseFloat(total)
        console.log(total);
        var options=({
          amount: total*100,
          currency: "INR",
          receipt: ""+orderId
        //   notes: {
        //     key1: "value3",
        //     key2: "value2"
        //   }
        });
        instance.orders.create(options, function(err,order){
            if(err){
                console.log(err);
            }else{
            console.log("New order",order);
            resolve(order) 
            }
        });
      
    })
 },

 verifyPayment:(details)=>{
    
    return new Promise((resolve,reject)=>{
        const crypto=require('crypto');
        let hmac=crypto.createHmac('sha256','V7Sanzdgt3gskAGoUwwjp5iH')
        hmac.update(details['payment[razorpay_order_id]'] + '|' +details['payment[razorpay_payment_id]']);
         hmac=hmac.digest('hex')
         if(hmac==details['payment[razorpay_signature]']){
            resolve()
         }else{
            reject()
         }
    })
 },

 changePaymentStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},
        {
            $set:{
                status:'placed'
            }
        }
        ).then(()=>{

            resolve()
        })
    })
 },

 checkWallet:(userData,wallet,discount)=>{
    return new Promise(async(resolve,reject)=>{

        if(wallet>=discount){         
        console.log("wallet checkout success");     
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userData.userId)},{$inc:{wallet:-discount}}).then((wallet)=>{
            console.log("wallet",wallet)
        })       

        }else{
         console.log("Insufficient balance")
        let errr="Insufficient balance"
         reject(errr)
        }

    })

 },

 generatePaypal:(orderId,total)=>{
    return new Promise((resolve,reject)=>{
        console.log(total,'reached here');
        // var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })
        total =parseFloat(total)
        var options=({
          amount: total*100,
          currency: "INR",
          receipt: ""+orderId
        //   notes: {
        //     key1: "value3",
        //     key2: "value2"
        //   }
        });
        instance.orders.create(options, function(err,order){
            if(err){
                console.log(err);
            }else{
            console.log("New order",order);
            resolve(order) 
            }
        });
      
    })
 },

 getUserDetails:(userId)=>{
    return new Promise(async (resolve,reject)=>{
        let user=await db.get().collection(collection.USER_COLLECTION)
        .findOne({_id:objectId(userId)}
        ).then((response)=>{
            console.log("---response----",response);
            resolve(response)
        })
    })
 },




}