var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectId
module.exports={
    addProduct:async(product,callback)=>{
    console.log(product)
    let category= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:product.category})
    console.log(category)
    product.offer_price=  parseInt(product.offer_price)
     product.available_quantity= parseInt(product.available_quantity)
     product.price= parseInt(product.price)
    //  product.percentage_discount= parseInt(product.percentage_discount)  
     product.categoryId=category._id
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            
            callback(data.insertedId)
        })
    },
    getAllProducts:(categoryId)=>{    
        return new Promise(async(resolve,reject)=>{
            // var mysort={product_name:1}
            //  let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            let products= await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
                {
                    $match:{}
               },
 
            //    {
            //        $lookup:{

            //            from:collection.PRODUCT_COLLECTION,
            //            localField:'_id',
            //            foreignField:'categoryId',
            //            as:'digital'
            //        }
            //    },
            {
                $lookup:{

                    from:collection.PRODUCT_COLLECTION,
                    localField:'category',
                    foreignField:'category',
                    as:'digital'
                }
            },

            {
                $unwind:'$digital',

            },

            {
                 $project:{
                // originalAmount:'$digital.offer_price',
                digital:1,
               category:1,
                discount:1,
               
                offer_Amount:{$subtract:['$digital.offer_price',{$divide:[{$multiply:['$digital.offer_price', '$discount']},100]}]}
                //  offer_price:'$discount'
            }   
             },
       {
        $group:{
            _id:'$category',
            // digital:{$push:'$offer_Amount'},
            digital:{$push:'$digital'},
             offerPrice:{$push:"$offer_Amount"},
             discountPercentage:{$push:"$discount"}

        }
       }

            ]).toArray()
       console.log("PPPPPPPPPPPPP",products)
         resolve(products)       
        })
    },


    getAdminProducts:(categoryId)=>{    
        return new Promise(async(resolve,reject)=>{
            // var mysort={product_name:1}
              let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()

       console.log(products)
         resolve(products)       
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
       
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
              console.log(response)
                resolve(response)
            })
            
        })
    },

    getProductDetails:(proId)=>{
        
        console.log("proId")
        console.log(proId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                console.log("product")  
                console.log(product)
               resolve(product)
            })
        })
    },

    updateProduct:(proId,proDetails)=>{

        return new Promise(async(resolve,reject)=>{    
            let category= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:proDetails.category})
            console.log(category)    
            proDetails.categoryId=category._id    
            
           proDetails.available_quantity=parseInt(proDetails.available_quantity)
            proDetails.offer_price=parseInt(proDetails.offer_price)
            proDetails.price=parseInt(proDetails.price)
            // proDetails.percentage_discount=parseInt(proDetails.percentage_discount)

         db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
         {
            $set:{
 
                product_name:proDetails.product_name,
                category:proDetails.category,
                product_description:proDetails.product_description,
                available_quantity:proDetails.available_quantity,
                offer_price:proDetails.offer_price,
                price:proDetails.price,
                // percentage_discount:proDetails.percentage_discount,
                categoryId:proDetails.categoryId

            }
        
        }).then((response)=>{
  
            resolve()
        })
    })

},

addcategory:(categoryList)=>{
    
    return new Promise(async(resolve,reject)=>{
        let category=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:categoryList.category})
    console.log(categoryList)   
    if(category){
        let err='Category already exist'
        reject(err)
       } else{
       
         db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categoryList).then((data)=>{
             resolve(data)
         })
       } 
 
     })    

},

getAllCategory:()=>{    
    return new Promise(async(resolve,reject)=>{
     
        let categories= await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
     resolve(categories)
    })
},

deletecategory:(ctgId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(ctgId)}).then((response)=>{
            console.log("ID is")
            console.log(response)
            resolve(response)
        })
    })
},


updatecategory:(ctgId,ctgDetails)=>{
                   
    return new Promise(async(resolve,reject)=>{
        let ctgCheck=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:{$ne:objectId(ctgId)},category:ctgDetails.category})
       if(ctgCheck){
        let err='Category already exist'
        console.log(err)
        reject(err)
       } else{
        
        db.get().collection(collection.CATEGORY_COLLECTION)
        .updateOne({_id:objectId(ctgId)},{
        $set:{

          category:ctgDetails.category,
          discount:parseInt(ctgDetails.discount)

        }

        }).then((response)=>{
            resolve(response)
        })
    }

    })
 },


 getCategoryDetails:(ctgId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(ctgId)}).then((category)=>{
            resolve(category)
        })
    })
},

dailyReport:()=>{
    return new Promise((resolve, reject) =>{
     db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {$match:{
           date:{
            //    $gte: new Date(new Date().getDate() -7 )
            $gte: new Date(new Date().getDate()-5)

            //  $gte: new Date(new Date() - 7 * 7 * 60 * 60 * 24 * 1000 )

           }
        }},
    
        {
            $project:{
                year:{$year:'$date'},
                month: { $month: "$date" },
                day: { $dayOfMonth: "$date" },
                dayOfWeek: { $dayOfWeek: "$date" },
                week: { $week: "$date" },
                date:{$toDate:"$date" }
                // date:{$dateToString:{format:"$createdAt"} }
            },
        },
        {
            $group:{
                _id:{day:'$day'},
                count:{$sum:1},
                detail: { $first: '$$ROOT' },
            }
        },
        {
            $sort:({
                _id:-1
            })
        },

        // {"$replaceRoot":{"newRoot":"$detail"}}
        
    ]).toArray()
  
    .then((data)=>{resolve(data)})
   
    })
    
},


monthlyReport:()=>{
    return new Promise((resolve, reject) =>{
     db.get().collection(collection.ORDER_COLLECTION).aggregate([
        // {
        //     $addFields: {
        //         month: {
        //             $let: {
        //                 vars: {
        //                     monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', ...]
        //                 },
        //                 in: {
        //                     $arrayElemAt: ['$$monthsInString', '$month']
        //                 }
        //             }
        //         }
        //     }
        // },
        {$match:{
           date:{

                 $gte: new Date(new Date().getMonth-5)
 
        }
        }},
    
        {
            $project:{
                year:{$year:'$date'},
                month: { $month: "$date" },
                day: { $dayOfMonth: "$date" },
                dayOfWeek: { $dayOfWeek: "$date" },
                week: { $week: "$date" },
                date:{$toDate:"$date" }
                // date:{$dateToString:{format:"$createdAt"} }
            },
        },
        {
            $group:{
                _id:{month:'$month'},
                count:{$sum:1},
                detail: { $first: '$$ROOT' },
            }
        },
        {
            $sort:({
                _id:1
            })
        },

        // {"$replaceRoot":{"newRoot":"$detail"}}
        
    ]).toArray()
  
    .then((data)=>{
        console.log(data)
        resolve(data)})
   
    })
    
},


yearlyReport:()=>{
    return new Promise((resolve, reject) =>{
     db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {$match:{
           date:{
               $gte: new Date(new Date().getFullYear -5)
           }
        }},
    
        {
            $project:{
                year:{$year:'$date'},
                month: { $month: "$date" },
                day: { $dayOfMonth: "$date" },
                dayOfWeek: { $dayOfWeek: "$date" },
                week: { $week: "$date" },
                date:{$toDate:"$date" }
                // date:{$dateToString:{format:"$createdAt"} }
            },
        },
        {
            $group:{
                _id:{year:'$year'},
                count:{$sum:1},
                detail: { $first: '$$ROOT' },
            }
        },
        {
            $sort:({
                _id:1
            })
        },

        // {"$replaceRoot":{"newRoot":"$detail"}}
        
    ]).toArray()
  
    .then((data)=>{resolve(data)})
   
    })
    
},


getCount:()=>{
    return new Promise((resolve, reject) =>{
     db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {$match:{
           date:{
               $gte: new Date(new Date().getFullYear-5)
           }
        }},
    
        {
            $project:{
                year:{$year:'$date'},
                month: { $month: "$date" },
                day: { $dayOfMonth: "$date" },
                dayOfWeek: { $dayOfWeek: "$date" },
                week: { $week: "$date" },
                date:{$toDate:"$date" }
                // date:{$dateToString:{format:"$createdAt"} }
            },
        },
        {
            $group:{
                _id:{year:'$year'},
                        count:{$sum:1},
                detail: { $first: '$$ROOT' },
            }
        },
        {
            $sort:({
                _id:1
            })
        },

        // {"$replaceRoot":{"newRoot":"$detail"}}
        
    ]).toArray()
  
    .then((data)=>{
        console.log("DDDDDDDDDDDDDDDDDD",data)
        console.log("DDDDDDDDDDDDDDDDDD",data[0].count)

        resolve(data[0].count)})
   
    })
    
},


getProductCount:()=>{
    return new Promise(async(resolve,reject)=>{
       let productcount= await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                         {
                   $group:{
                       _id:null,
                       count:{$sum:1},
                   }
               }
   
       ]).toArray()
       console.log("EEEEEEEEEEEEEEEE",productcount)
       console.log("EEEEEEEEEEEEEEEE",productcount[0].count)
   
       // console.log(cartItems[0].products)
       resolve(productcount[0].count)
   
   })

},

getEarnings:()=>{
    return new Promise(async(resolve,reject)=>{
       let earning= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                         {
                   $group:{
                       _id:null,
                       earning:{$sum:'$totalAmount'}
                       
                   }
               }
   
       ]).toArray()
       console.log("EEEEEEEEEEEEEEEE",earning)
       console.log("EEEEEEEEEEEEEEEE",earning[0].earning)
   
       // console.log(cartItems[0].products)
       resolve(earning[0].earning)
   
   })

},

}