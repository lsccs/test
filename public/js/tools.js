// 工具类

 function addClass (obj,cn){ //第一个参数是添加的对象，第二个是class值
               //检查class中是否含有cn
               if(!hasClass(obj,cn)){
                obj.className +=" "+cn+" "; //如果没有则加上
                                            //有就不加
               }
                
        }

        //定义一个函数，来检查class中是否含有要加入的class
        function hasClass(obj,cn){

            //创建正则表达式
           // var teg = /\\bcn\\b/;  这种方式不可以使用变量
        //所以使用构造函数传递
        var teg = new RegExp("\\b"+cn+"\\b");
            return teg.test(obj.className);

        }


        //定义一个函数，用来删除classname
        function removeClass (obj,cn){
             var teg = new RegExp("\\b"+cn+"\\b");
             if(teg.test(obj.className)){
                 obj.className = obj.className.replace(cn,"");
             }
        }


        //创建一个函数，用来切换一个类
        function toggleClass(obj,cn){
            //如果有则删除
            if(hasClass(obj,cn)){
                removeClass(obj,cn);
            }else{  //没有则添加
                addClass(obj,cn);
            }
        }
