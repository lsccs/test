const mongoose = require('mongoose');

// 连接哪一个数据库
mongoose.connect('mongodb://localhost/user');
mongoose.set('useFindAndModify', false)
// 用户账户密码模板
const userSchema = new mongoose.Schema({
    
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    nickname:{
        type:String,
        default:Date.now
    },
    avatar:{
        type:String,
        default:"/public/img/99.jpg"
    },
    
    status:{
        type:Number,
        default:1
    },
    code:{
        type:Number,
        default:-1
    },
    // 我的收藏
    collect:[
        {
           bookid:String    
        }
    ],
    // 我的购物车
    shop:[
        {
            bookid:String,
            num:Number
        }
    ],
    address:{
        type:String,
        
    },
    phone:{
        type:Number,
        
    },
    payPassword:{
        type:String,
        
    },
    // 账户余额
    account:{
        type:String,
        default:"0.00"
    }
    
})
// 资讯模板
const releaseSchema = new mongoose.Schema({
    manaId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    nickname:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        default:""
    },
    title:{
        type:String,
        required:true
    },
    main:{
        type:String,
        required:true
    },
    img:{
        type:String,
        default:""
    },
    date:{
        type:String,
        required:true
    },
    stikey:{
        type:Boolean,
        required:true
    },
    // 浏览
    browse:{
        type:Number,
        default:0
    }
})

// 轮播图模板
const lunboSchema = new mongoose.Schema({
    image:{
        type:String,
        required:true
    }

})

// 管理员
const manaSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    nickname:{
        type:String,
        default:Date.now
    },
    avatar:{
        type:String,
        default:"/public/img/99.jpg"
    },
    
    status:{
        type:Number,
        default:1
    },
    code:{
        type:Number,
        default:1
    }
})

// 创建密码库模板
const passwordSchema = new mongoose.Schema({
    
    password:{
        type:String,
        default:"xxx123"
    }

})

// 教材管理模板

const bookSchema = new mongoose.Schema({

    bookName:{
        type:String,
        required:true
    },
    bookImg:[
        {
            type:String,
            required:true
        },
        {
            type:String,
            required:true
        },
        {
            type:String,
            required:true
        }
    ],

    price:{
        type:Number,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    maxClass:{
        type:String,
        required:true
    },
    class:{
        type:String,
        required:true
    },
    off:{
        type:Number,
        default:1
    },
    // 浏览
    browse:{
        type:Number,
        default:0
    },
    favorite:{
        type:Number,
        default:0
    },
    // 销量
    sales:{
        type:Number,
        default:0
    },
    // 描述
    val:{
        type:String,
        required:true
    }
   
})
// 订单模块
const orderSchema = new mongoose.Schema({

    userid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    bookId:[
        {   orderNum:Number,// 订单编号
            bookid:[
               {
                bookid:{
                        type:mongoose.Schema.Types.ObjectId,ref:"Book"},
                num:Number
               }
            ],
            allpri:Number,
            payTime:String,//支付时间
            deliTime:{type:String,default:""},//发货时间
            receipt:{type:Boolean,default:false}
        }

    ]
   
})
// 订单镜像
const MirorderSchema = new mongoose.Schema({

    userid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    bookId:[
        {   orderNum:Number,// 订单编号
            bookid:[
               {
                bookid:{
                        type:mongoose.Schema.Types.ObjectId,ref:"Book"},
                num:Number
               }
            ],
            allpri:Number,
            payTime:String,//支付时间
            deliTime:{type:String,default:""},//发货时间
            receipt:{type:Boolean,default:false}
        }

    ]
   
})



// 评论模块
const commentSchema = new mongoose.Schema({

    bookID:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Book"
    },

    comment:[
        {
            fromID:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
            toID:[
                {
                    toid:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
                    manaid:{type:mongoose.Schema.Types.ObjectId,ref:"Mana"},
                    tocon:{type:String,default:""},
                    likes:[
                        {id:{type:mongoose.Schema.Types.ObjectId}}
                    ]
                    ,time:{type:String,default:""},
                    atval:{type:String,default:""},
                    identity:{type:Number,default:-1}
                }
            ],
            content:{type:String,required:true},
            like:[
                {id:{type:mongoose.Schema.Types.ObjectId}}
            ]
            ,time:{type:String,required:true}
        }
    ]


})

// 存放离线消息模块
const msgSchema = new mongoose.Schema({
    touser:{
        id:{type:mongoose.Schema.Types.ObjectId,required:true},
        fromid:{type:mongoose.Schema.Types.ObjectId,required:true},
        nickname:{type:String,required:true},
        avatar:{type:String,required:true},
        val:{type:String,required:true}
    }
})
// 分类集合
const classSchema = new mongoose.Schema({
            maxClass:{type:String,required:true},
            min:[
                {
                    minClass:{type:String,required:true}
                }
            ]
})

//将结构发布作为模型，返回值是一个模型构造函数，可以操作user里的数据
const User = mongoose.model('User', userSchema);
const Rele = mongoose.model("Rele",releaseSchema);
const Mana = mongoose.model("Mana",manaSchema);
const Book = mongoose.model("Book",bookSchema);
const Password = mongoose.model("Password",passwordSchema);
const Lunbo = mongoose.model("Lunbo",lunboSchema)
const Order = mongoose.model("Order",orderSchema)
const Comment = mongoose.model("Comment",commentSchema)
const Msg = mongoose.model("Msg",msgSchema)
const Mirorder = mongoose.model("Mirorder",MirorderSchema)
const Class = mongoose.model("Class",classSchema)


// 导出模型
module.exports = {
    User,
    Rele,
    Book,
    Mana,
    Password,
    Lunbo,
    Order,
    Comment,
    Msg,
    Mirorder,
    Class
}