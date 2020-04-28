// 路由模块
const express = require("express")
const router = express.Router()
// 引入第三方加密包
const md5 = require("blueimp-md5")
// 获取数据库模块
const model = require("./mongod.js")
const fs = require("fs")
// 引入时间处理模块
const moment = require("moment")
// 引入处理ID模块
const objectId = require("mongodb").ObjectId
// 分页模块
const pagination = require("mongoose-sex-page")
// 运算模块
const Decimal = require("decimal.js")

// 客户端首页
router.get("/",async (res,rso)=>{
    
    let ret = await model.Lunbo.find()
    let uu = await model.Book.find().sort({browse:-1}).limit(5)
    let ee = await model.Rele.find()
    if(!res.session.user){
        rso.render("userIndex.html",{
            allBook:uu,
            lunbo:ret,
            zixun:ee
        })
    }else{
        rso.render("userIndex.html",{
            user:res.session.user,
            allBook:uu,
            lunbo:ret,
            zixun:ee
            
        })
    }

})
// 验证用户是否登陆
router.get("/usered",(res,rso)=>{
    if(res.session.user){
        rso.send({co:1})
    }
})



// 请求登陆页面
router.get("/login",function(res,rso){
    rso.render("index.html")
})
// 点击换一换
router.get("/changeBook",async (res,rso)=>{
    let all = await pagination(model.Book).find().page().size().display().exec()
    let total = all.total
    let index = Math.floor(Math.random()*total)
    let uu = await model.Book.find().skip(index).sort({browse:-1}).limit(5)
    rso.render("change.html",{
        allBook:uu
    })
})
// 全部课程的请求
router.get("/allcourse",async function(res,rso){
    let page = res.query.page
    
        if(res.query.index){
            let i = parseInt(res.query.index)
            if(i === 1){
                // 浏览量排序
               
                let result = await pagination(model.Book).find({off:1}).sort({browse:-1}).page(page).size(8).display(3).exec()
                
                fun2(result,result2)
            }else
            if(i === 2){
                // 销量排序
                
                let result = await pagination(model.Book).find({off:1}).sort({sales:-1}).page(page).size(8).display(3).exec()
                
                fun2(result)
            }else
            if(i === 3){
                // 收藏排序
               
                let result = await pagination(model.Book).find({off:1}).sort({favorite:-1}).page(page).size(8).display(3).exec()
               
                fun2(result)
    
            }
        }else{
            let result2 = await model.Class.find()
            let result = await pagination(model.Book).find({off:1}).sort({sales:-1}).page(page).size(8).display(3).exec()
            let user = JSON.stringify(result2)
                result2 = JSON.parse(user)
            fun(result,result2)
        }
    
    
    
    // 渲染函数
    function fun (result,result2){
        if(!res.session.user){
            rso.render("allcourse.html",{
                allBook2:result,
                allclass:result2
            })
        }else{
            rso.render("allcourse.html",{
                user:res.session.user,
                allBook2:result,
                allclass:result2
            })
        }
    }
    function fun2 (result,result2){
        if(!res.session.user){
            rso.render("fl.html",{
                allBook2:result
            })
        }else{
            rso.render("fl.html",{
                user:res.session.user,
                allBook2:result
            })
        }
    }

   
})
// 课程 模糊查询
router.get("/bookSearch",async (res,rso)=>{
    let key = res.query.val
    let page = res.query.page
    let reg = new RegExp(key,'i')   // 正则表达式，必须使用实例
                                    // 不可以用 / / 
     let obj = {$or:[        //$or: 操作符后跟一个数组，表示数组里面的条件是或的关系
        {bookName:{$regex : reg}},//$regex 用于模糊查询
        {class:{$regex : reg}}
    ]}
    
    // 整个对象就是查询条件
    let result = await pagination(model.Book).find(obj,{off:1}).page(page).size(8).display(3).exec()
    let result2 = await model.Class.find()
    let user = JSON.stringify(result2)
    result2 = JSON.parse(user)
    rso.render("allcourse.html",{
        user:res.session.user,
        allBook2:result,
        allclass:result2

    })

})


// 课程资讯详情
router.post("/details",function(res,rso){
    let id = objectId(res.body.id)
    model.Rele.findOne({_id:id},function(err,ret){
        let brw = ret.browse + 1
        model.Rele.findOneAndUpdate({_id:id},{browse:brw},function(err,ret){
        })
        rso.render("details.html",{
            user:res.session.user,
            massage:ret,
            len:ret.length
        })
    })


})


// 资讯模糊查询
router.get("/search",function(res,rso){
    
    let key = res.query.val
    let reg = new RegExp(key,'i')
    let obj = {$or:[
        {title:{$regex : reg}},
        {main:{$regex : reg}},
        {date:{$regex : reg}}

    ]}
    let page = res.query.page
    pagination(model.Rele).find(obj).page(page).size(5).display(3).exec((err,ret)=>{

        rso.render("bookzixun.html",{
                user:res.session.user,
                zixun:ret
            })


    })
    
})
// 处理评论时间函数
async function time(result){
    
    for(var i in result){
        for(var j in result[i].comment){
            let oldTime = result[i].comment[j].time
            result[i].comment[j].time = moment(moment(moment())).diff(moment(oldTime),"seconds")+"秒前"
            
            if(parseInt(result[i].comment[j].time) >=60){
                
                result[i].comment[j].time = moment(moment(moment())).diff(moment(oldTime),"minutes")+"分钟前"
                
                if(parseInt(result[i].comment[j].time)>=60){
                    
                    result[i].comment[j].time = moment(moment(moment())).diff(moment(oldTime),"hours")+"小时前"
                    if(parseInt(result[i].comment[j].time)>=24){
                        result[i].comment[j].time = moment(moment(moment())).diff(moment(oldTime),"days")+"天前"
                        if(parseInt(result[i].comment[j].time)>=30){
                            result[i].comment[j].time = moment(moment(moment())).diff(moment(oldTime),"months")+"月前"
                            if(parseInt(result[i].comment[j].time)>=12){
                                result[i].comment[j].time = moment(moment(moment())).diff(moment(oldTime),"years")+"年前"
                            }
                        }
                    }
                }
            }
            
            
        }
    }
    for(var i in result){
        for(var j in result[i].comment){
            for(var m in result[i].comment[j].toID){
                let oldTime = result[i].comment[j].toID[m].time
            result[i].comment[j].toID[m].time = moment(moment(moment())).diff(moment(oldTime),"seconds")+"秒前"
            
            if(parseInt(result[i].comment[j].toID[m].time) >=60){
                
                result[i].comment[j].toID[m].time = moment(moment(moment())).diff(moment(oldTime),"minutes")+"分钟前"
                
                if(parseInt(result[i].comment[j].toID[m].time)>=60){
                    
                    result[i].comment[j].toID[m].time = moment(moment(moment())).diff(moment(oldTime),"hours")+"小时前"
                    if(parseInt(result[i].comment[j].toID[m].time)>=24){
                        result[i].comment[j].toID[m].time = moment(moment(moment())).diff(moment(oldTime),"days")+"天前"
                        if(parseInt(result[i].comment[j].toID[m].time)>=30){
                            result[i].comment[j].toID[m].time = moment(moment(moment())).diff(moment(oldTime),"months")+"月前"
                            if(parseInt(result[i].comment[j].toID[m].time)>=12){
                                result[i].comment[j].toID[m].time = moment(moment(moment())).diff(moment(oldTime),"years")+"年前"
                            }
                        }
                    }
                }
            }
            }
            
            
        }
    }
}
// 接收教材详情页请求
router.get("/shoping",function(res,rso){
    let id = objectId(res.query.id)
    let browse= parseInt(res.query.browse) + 1
    model.Book.findOne({_id:id},function(err,ret){
        if(err){throw err}
        model.Book.findOneAndUpdate({_id:id},{browse:browse},function(err,br){
            model.Comment.find({bookID:id}).populate("comment.fromID comment.toID.toid comment.toID.manaid").then(result=>{
                let use = JSON.stringify(result)
                result = JSON.parse(use)
                time(result)
                rso.render("book.html",{
                    user:res.session.user,
                    book:ret,
                    com:result
                    
                })

            })

        })

    })
})
// 渲染评论
router.get("/com", async (res,rso)=>{
    let id = objectId(res.query.id)
    let date = new Date()
    model.Comment.find({bookID:id}).populate("comment.fromID comment.toID.toid comment.toID.manaid").then(result=>{
        let use = JSON.stringify(result)
        result = JSON.parse(use)
        time(result)
       
        rso.render("comment.html",{
             user:res.session.user,
             com:result
        })
    })
})  




// 按分类查询课程
router.get("/cour",async function(res,rso){
    let page = res.query.page
    let result = await pagination(model.Book).find({off:1,class:res.query.class}).page(page).size(8).display(3).exec()
    let result2 = await model.Class.find()
    let user = JSON.stringify(result2)
    result2 = JSON.parse(user)
    rso.render("allcourse.html",{
        user:res.session.user,
        allBook2:result,
        allclass:result2
    })


})

// 我的收藏页面请求
router.get("/mycollect",function(res,rso){
    if(res.session.user){
        //登陆
            rso.render("mycollect.html",{
                user:res.session.user
            })

    }else{
        //未登录
        rso.send({co:-1})
    }
    


})
// 提交我的收藏
router.post("/mycollect",function(res,rso){
    let user = res.session.user
    let bookids = objectId(res.body.bookid)
    let fa = parseInt(res.body.favorite) + 1 
    let id = res.body.id
    if(res.session.user){
        model.User.findOneAndUpdate({username:user.username},{ $push:{collect:{bookid:id}}},{new:true},function(err,ret){

            res.session.user = ret
            if(err){throw err}
            rso.send({co:1})
        })
    
        model.Book.findOneAndUpdate({_id:bookids},{favorite:fa},{new:true},(err,ret)=>{
            res.session.user = ret
        })
    }else{
        rso.send({co:-1})
    }
    

})

// 获取所有收藏的书id
router.get("/collects",function(res,rso){
    let arr = res.query.ids
    let newarr = []
    let id = 0
    for(let i in arr){
        id = objectId(arr[i])
        newarr.push(id)
    }
    model.Book.find({_id:{$in:newarr}},function(err,ret){
        
        rso.render("mycollect.html",{
            user:res.session.user,
            bookss:ret
        })
    })



})

// 取消收藏的请求
router.get("/removecoll",function(res,rso){
    let id = res.query.removeID
    
    let bookids = objectId(res.query.bookid)
    let fa = parseInt(res.query.favorite) - 1 
    model.User.findOneAndUpdate({username:res.session.user.username},{$pull:{collect:{bookid:id}}},{new:true},function(err,ret){
            res.session.user = ret
            rso.send({co:1})

    })
    model.Book.findOneAndUpdate({_id:bookids},{favorite:fa},{new:true},(err,ret)=>{

        res.session.user = ret
    })
        


})

// 购物车页面请求
router.get("/shop",function(res,rso){
    if(!res.session.user){
        rso.send({co:-1})
    }else{
        rso.render("shop.html",{
            user:res.session.user
        })


    }
})
// 添加购物车
router.post("/shop",async function(res,rso){
    let user = res.session.user
    let id = res.body.id
    let num = res.body.num
    if(res.session.user){
        let result = await model.User.findOne({username:user.username,"shop.bookid":id})
        if(result){
            rso.send({co:-2})
            return
        }
        model.User.findOneAndUpdate({username:user.username},{ $push:{shop:{bookid:id,num:num}}},{new:true},function(err,ret){
            res.session.user = ret
            if(err){throw err}
            rso.send({co:1})
        })

    }else{
        rso.send({co:-1})
    }
    

})

router.get("/shopids",function(res,rso){
    let arr = res.query.ids
    
    let newarr = []
    
    let id = 0
    for(let i in arr){
        id = objectId(arr[i])
        newarr.push(id)
    }
    
    model.Book.find({_id:{$in:newarr}},function(err,ret){
        
        rso.render("shop.html",{
            user:res.session.user,
            shops:ret
        })
    })
})

// 删除购物车教材
router.post("/removeshop",function(res,rso){
    let id = res.body.id
    
    model.User.findOneAndUpdate({username:res.session.user.username},{$pull:{shop:{bookid:id}}},{new:true},function(err,ret){
            res.session.user = ret
            rso.send({co:1})

    })
})
// 添加订单之后清空购物车
router.post("/payshop",(res,rso)=>{
        let ids =  res.body.ids
            model.User.findOneAndUpdate({username:res.session.user.username},{$pull:{shop:{bookid:{$in:ids}}}},{new:true},function(err,ret){
                res.session.user = ret
                rso.send({co:1})
            })
})

// 修改保存购物车教材的数量
router.get("/num",function(res,rso){
    let bookid = res.query.id
    let num = res.query.num
    
    let swhere = {username:res.session.user.username,"shop.bookid":bookid}
    
    model.User.findOneAndUpdate(swhere,{$set:{"shop.$.num":num}},{new:true},function(err,ret){
        if(err){throw err}
        res.session.user = ret
        rso.render("shop.html",{
            user:res.session.user
        })
    })
})


// 验证提交个人信息
router.post("/personUpdate", async (res,rso)=>{
    let user = res.session.user
    let obj = res.body.obj
    let phone = parseInt(obj.phone)
    let address = obj.address
    let payPassword = md5(md5(obj.payPassword))
    let newobj = res.session.user
    newobj.phone = phone
    newobj.address = address
    newobj.payPassword = payPassword

        
    model.User.findOneAndUpdate({username:user.username},newobj,{new:true},function(err,ret){
        if(err){throw err}
        if(ret){
            rso.send({co:1})
        }else{
            rso.send({co:-1})
        }
        
                

    })
})

// 验证支付密码的正确性
router.post("/pay",async (res,rso)=>{
    let user = res.session.user
    let password = md5(md5(res.body.payPassword))
    let allpri = res.body.allpri

    let result = await model.User.findOne({username:user.username,"payPassword":password})
    if(result){
        
        let result2 = await model.User.findOne({username:user.username})
        let acc = parseFloat(result2.account)
        let acc2 = parseFloat(allpri)
        let newAcc = new Decimal(acc).sub(new Decimal(acc2)).toNumber().toFixed(2)
        if(newAcc <= 0){
            // 余额不足
            rso.send({co:0})
        }else{
            let result = await model.User.findOneAndUpdate({username:user.username},{account:newAcc},{new:true})
            res.session.user = result
            rso.send({co:1})
        }
    }else{
       
        rso.send({co:-1})
        
    }
    

} )

// 余额充值密码验证
router.post("/topUp",async (res,rso)=>{
    let user = res.session.user
    let payPassword = md5(md5(res.body.pass))
    let result = await model.User.findOne({username:user.username,"payPassword":payPassword})
    if(result){
        rso.send({co:1})
    }else{
        rso.send({co:-1})
    }
})
// 余额充值
router.post("/rechargeAmount", async (res,rso)=>{
    let user = res.session.user
    let result = await model.User.findOne({username:user.username})
    if(result.account){
        let acc = parseFloat(result.account)
        let acc2 = parseFloat(res.body.pass)
        let newAcc =  new Decimal(acc).add(new Decimal(acc2)).toNumber().toFixed(2)

        model.User.findOneAndUpdate({username:user.username},{account:newAcc},{new:true},(err,ret)=>{
            res.session.user = ret
            rso.send({co:1,acc:ret.account})
        })
    }
})




// 接收教材id处理订单
router.post("/order",async (res,rso)=>{
    let newObj = {}
    let date = new Date()
    newObj.userid = objectId(res.session.user._id)
    let oldarr = res.body.arr
    let allpri = res.body.allpri
    let newarr  = res.body.arr2
    
    let date2 = moment(date.getTime()).format("YYYY/MM/DD HH:mm:ss" )
    for(let i in oldarr){
        oldarr[i].bookid = objectId(oldarr[i].bookid)
        
    }
    
    let obj =
        {
            orderNum : Math.floor(Math.random()*1000000000000)+1,
            payTime :date2,
            bookid:oldarr,
            allpri
        }
    
    newObj.bookId=[
        obj
    ]
    // 修改销量
    let sales 
    for(let i in newarr){
      newarr[i].bookid = objectId(newarr[i].bookid)
      newarr[i].num = parseInt(newarr[i].num)
      newarr[i].sales = parseInt(newarr[i].sales)
      sales = newarr[i].num + newarr[i].sales
      model.Book.findOneAndUpdate({_id:newarr[i].bookid},{sales},function(err,ret){
        
        })
    }
    
    
    
    async function order (collections){
        return new Promise((reslove,reject)=>{
            collections.findOne({userid:newObj.userid},function(err,ret){
                if(err){throw err}
                if(!ret){
                    reslove()
                }else{
                    reject()
                }
                
            })
            
        })
    }
    
    await order(model.Order).then(()=>{
        model.Order.insertMany(newObj,function(err,ret){
            if(err){throw err}
            rso.send({co:1})
            model.Order.update({},{$push:{bookId:{$each:[],$sort:{'_id':-1}}}})
        })
    },()=>{
        model.Order.findOneAndUpdate({userid:newObj.userid},{$push:{bookId:obj}},function(err,ret){
            rso.send({co:1})
            model.Order.update({},{$push:{bookId:{$each:[],$sort:{'_id':-1}}}})
            
        })
    })
    
    order(model.Mirorder).then(()=>{
        model.Mirorder.insertMany(newObj,function(err,ret){
            if(err){throw err}
            
        })
    },()=>{
        model.Mirorder.findOneAndUpdate({userid:newObj.userid},{$push:{bookId:obj}},function(err,ret){
            
        })
    })

})

// 处理我的订单页面
router.get("/myorder",function(res,rso){
        if(!res.session.user){
            rso.send({co:-1})
        }else{

        let userid = objectId(res.session.user._id)
        
        model.Mirorder.findOne({userid},function(err,ret){
            if(!ret){
                rso.render("myorder2.html",{
                    user:res.session.user,
                    
                })
                return
            }
        }).populate("bookId.bookid.bookid userid").then(result=>{
                var user = JSON.stringify(result)
                result = JSON.parse(user)
                rso.render("myorder.html",{
                    user:res.session.user,
                    allOrder:result
                })
            
        })

    }


})
// 订单收货
router.post("/receipt",async (res,rso)=>{
    let userid = res.session.user._id
    let orderNum = parseInt(res.body.orderNum)
    let result = await model.Order.findOneAndUpdate({userid,"bookId.orderNum":orderNum},{$set:{"bookId.$.receipt":true}},{new:true})
    let result2 = await model.Mirorder.findOneAndUpdate({userid,"bookId.orderNum":orderNum},{$set:{"bookId.$.receipt":true}},{new:true})
   
    if(result&&result2){
        rso.send({co:true})
    }
})
// 删除订单的请求
router.post("/removeOrder",(res,rso)=>{
    let orderNum = parseInt(res.body.orderNum)
    let userid = objectId(res.session.user._id)
    
    model.Mirorder.findOneAndUpdate({userid},{$pull:{bookId:{orderNum:orderNum}}},(err,ret)=>{
        if(ret){
            rso.send({co:1})
        }else{
            rso.send({co:-1})
        }
    })


})

// 评论提交 
router.post("/comment",(res,rso)=>{
    let date = new Date()
    let bookID = objectId(res.body.id)
    let time = moment(date.getTime()).format("YYYY/MM/DD HH:mm:ss" )
    let content = res.body.val
    let fromID = res.session.user._id
    
    if(res.body.user){
        let atval = res.body.atval
        let obj = {
            toid:fromID,
            tocon:content,
            time,
            atval
        }
        let toID = [
            obj
        ]
        // 进入判断表示回复其他人的评论
        
        let id = objectId(res.body.user)
        model.Comment.findOneAndUpdate({bookID,"comment._id":id},{$push:{"comment.$.toID":obj}},(err,ret)=>{
            rso.send({co:1})
        })
    }else{

   
    let obj = {
        fromID,
        content,
        time
    }
    let comment = [
        obj
    ]
    let newObj = {
        bookID,
        comment
    }

    let promise = new Promise((reslove,reject)=>{
        model.Comment.findOne({bookID},(err,ret)=>{
            if(!ret){
                reslove()
            }else{
                reject()
            }
        })



    })

    promise.then(()=>{
        model.Comment.insertMany(newObj,(err,ret)=>{
            rso.send({co:1})
        })    
    },()=>{
        model.Comment.findOneAndUpdate({bookID},{$push:{comment:obj}},()=>{
            rso.send({co:1})
        })
    })

} 

})
// 判断是否购买当前教材
router.get("/shoped",(res,rso)=>{
    let bookid = objectId(res.query.bookid)
    let userid = res.session.user._id
    model.Order.findOne({userid,"bookId.bookid.bookid":bookid},(err,ret)=>{
        if(err){throw err}
        if(!ret){
            rso.send({co:-1})
        }

    })
})
// 处理客户端个人信息页面

router.get("/myRele",function(res,rso){
    let userid = res.session.user._id
    model.User.findOne({_id:userid},function(err,ret){
        let user = JSON.stringify(ret)
        ret = JSON.parse(user)
        rso.render("myRele.html",{
            user:res.session.user,
            main:ret
        })
    })
})

// 客户端修改个人信息
router.post("/upUser",(res,rso)=>{
    let obj = res.body.obj
    let _id = res.session.user._id
    model.User.findOneAndUpdate({_id},obj,{new:true},(err,ret)=>{
        if(err){throw err}
        res.session.user = ret
        rso.send({co:1})
    })

})
// 修改密码页面请求
router.get("/updatePassword",(res,rso)=>{
    rso.render("password.html",{
        
    })
})
// 个人信息密码验证
router.post("/userUpdatePassword",(res,rso)=>{
    let password = md5(md5(res.body.passworded))
    let newPassword = md5(md5(res.body.password))
    let _id = res.session.user._id
    
    model.User.findOne({_id,password},(err,ret)=>{
        if(ret){
            model.User.findOneAndUpdate({_id},{password:newPassword},(err,ret)=>{
                if(ret){rso.send({co:1})}
            })
            
        }else{
            rso.send({co:-1})
        }
    })

})

// 联系我们页面请求
router.get("/sendMessage",(res,rso)=>{
    if(res.session.user){
        model.Mana.find((err,ret)=>{
            
            rso.render("endmessage.html",{
                user:res.session.user,
                mana:ret
            })
        })
        
    }else{
        rso.send({co:-1})
    }

})
// 修改支付密码
router.get("/payupdatePassword", async (res,rso)=>{
    rso.render("payPassword.html")
})
router.post("/userUpdatePayPassword",async (res,rso)=>{
    let password = md5(md5(res.body.passworded))
    let newPassword = md5(md5(res.body.password))
    let _id = res.session.user._id
    
    model.User.findOne({_id,payPassword:password},(err,ret)=>{
        if(ret){
            model.User.findOneAndUpdate({_id},{payPassword:newPassword},(err,ret)=>{
                if(ret){rso.send({co:1})}
            })



            
        }else{
            rso.send({co:-1})
        }
    })
})
// 客户端账户页面请求
router.get("/account", async (res,rso)=>{
    // user = res.session.user
    // user.account = parseFloat(user.account).toFixed(2)
    rso.render("account.html",{
        user : res.session.user
    })


})
// 点赞评论
router.post("/likes",async (res,rso)=>{
    let _id = objectId(res.body.toid)
    let id =  res.session.user._id
    let bookID = objectId(res.body.bookid)

    let findre = await model.Comment.findOne({bookID,"comment._id":_id})
    
    if(findre){
        let find = await model.Comment.findOne({bookID,"comment._id":_id},{"comment":{$elemMatch:{_id}}})
        let oldid = find.comment[0].like
        
        let off = true
        for(let i in oldid){
            
            if(oldid[i].id == id){
                off = false
            }
        }
        if(off){
            let re = await model.Comment.findOneAndUpdate({bookID,"comment._id":_id},{$push:{"comment.$.like":{id}}})
            rso.send({co:1})
        }else{
            
            let re = await model.Comment.findOneAndUpdate({bookID,"comment._id":_id},{$pull:{"comment.$.like":{id}}})
        }
        return
    }
    
    
        let find = await model.Comment.findOne({bookID,"comment.toID._id":_id},{"comment":{$elemMatch:{"toID._id":_id}}})
        
       
        let com = find.comment[0].toID
        let oldid2 = 0
        let off2 = true
       
        for(let i in com){

            if(JSON.stringify(com[i]._id) == JSON.stringify(_id)){
                oldid2 = com[i]
            }
        }
        
        let likeArr = oldid2.likes
        for(let i in likeArr){
            if(likeArr[i].id == id){
                off2 = false
            }
        }
        if(off2){
            
            let re = await model.Comment.findOneAndUpdate({bookID,"comment.toID._id":_id},{$push:{"comment.$.toID.$[inner].likes":{id}}},{"arrayFilters":[{"inner._id":_id}]})
            rso.send({co:1})
        }else{
            
            let re = await model.Comment.findOneAndUpdate({bookID,"comment.toID._id":_id},{$pull:{"comment.$.toID.$[inner].likes":{id}}},{"arrayFilters":[{"inner._id":_id}]})
        }
    
    

})

module.exports = router