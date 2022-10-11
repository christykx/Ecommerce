var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectId
module.exports={
   
addCoupons:(offer)=>{

    offer.discount_price=parseInt(offer.discount_price)
    return new Promise(async(resolve,reject)=>{
    console.log(offer.coupon)
    let couponCheck=await db.get().collection(collection.OFFER_COLLECTION).findOne({coupon:offer.coupon})
    console.log(couponCheck);
    if(couponCheck){
        console.log("Coupon already exist");
        let err='Coupon already exist!!!!'
        reject(err)
    
    }else{
        db.get().collection(collection.OFFER_COLLECTION).insertOne(offer)
        .then((data)=>{
            console.log(data,"data.............");
            resolve(data)
        })
 
    }
 
    })
},

getAllOffers:()=>{    
    return new Promise(async(resolve,reject)=>{
        // var mysort={product_name:1}
        let offer= await db.get().collection(collection.OFFER_COLLECTION).find().toArray()
   
     resolve(offer)       
    })
  },

  getOffer:(couponId)=>{    
    return new Promise(async(resolve,reject)=>{
        
        // var mysort={product_name:1}
        let offer= await db.get().collection(collection.OFFER_COLLECTION).find({coupon:couponId}).toArray()
   
     resolve(offer)       
    })
  },

  blockoffer:(couponId)=>{
    return new Promise((resolve,reject)=>{
        console.log(objectId(couponId))
        let query={_id:objectId(couponId)};
        db.get().collection(collection.OFFER_COLLECTION).findOneAndUpdate(query,{$set:{block:true}}).then((response)=>{
            console.log(response)
            resolve(response)
        }).catch((err)=>{
            console.log(err)
        })
    })
},

unblockoffer:(couponId)=>{
    return new Promise((resolve,reject)=>{
        console.log(objectId(couponId))
        let query={_id:objectId(couponId)};
        db.get().collection(collection.OFFER_COLLECTION).findOneAndUpdate(query,{$set:{block:false}}).then((response)=>{
            console.log(response)
            resolve(response)
        }).catch((err)=>{
            console.log(err)
        })
    })
},


canceloffer:(couponId)=>{
    return new Promise((resolve,reject)=>{

        db.get().collection(collection.OFFER_COLLECTION).deleteOne({_id:objectId(couponId)}).then((response)=>{
          console.log(response)
            resolve(response)
        })
        
    })
},


}