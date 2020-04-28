//获取homeImage

//获取按钮
window.onload = function(){

    


//轮播图
var image = document.getElementsByClassName("image")
var pointer = document.getElementsByClassName("piner")
//保存索引
var index = 1;
addClass(pointer[0],"pinerActive")
//绑定导航点
   
for(var m=0;m<pointer.length;m++){
    pointer[m].num = m
    pointer[m].onclick = function(){
        index = this.num
        getNext()//要再次调用
        clearInterval(timer)
        time = 0; //当点击换图时 使定时器重置
        funT();
        
    }
}

function getNext(){
    
    for(var j=0;j<image.length;j++){
        image[j].className = "image"
        pointer[j].className = "piner"
    }
    addClass(image[index],"active")
    addClass(pointer[index],"pinerActive")
    if(index<image.length-1){
        index++;
    }else{
        index=0
    }
    
    
}


    
//创建定时器



//定时器的变量
var time = 0;
//记录计时器id
var timer
function funT(){
clearInterval(timer)
timer = setInterval(function(){
        time++;
        if(time === 20){
            getNext();
        }else if(time >20){
            time=0
        }

},150)
}
funT()

let clear = setInterval(()=>{
    if($(".lunbo").length === 0){
        clearInterval(timer)
        clearInterval(clear)
    }
},1000)
}

