/*
 *1. 获取内容
 *2. 通过api获取对应内容电影的id
 *3. 通过api获取对应id的具体内容
 *4. 构建DOM树，显示
 */
var DomTree ='<a e="pre" style="display:none;text-decoration:none">'+
        '<span class ="prev" e="pre">< 上一部</span></a><a e="next" style="display:none;text-decoration:none"><span e="next" class = "next">下一部 ></span></a>'+
        '<div id="Pic"><img class ="imgs" src="" width =92 height=132 /></div><div id="Content">'+
        '<ul><li class="Info" >片名：<a title="" target="_blank" href="" ><span id = "mtitle"></span></a></li>'+
        '<li class = "Info"><span class="Stars" style="background-position: 0;0px;">'+
        '<strong><p class="average"><span id = "average"></span></p></strong></span>'+
        '</li><br><li class = "Info" id = "countries"></li><li class = "Info" id = "genres"></li>'+
        '<li class= "gray" id = "directors"></li><li class= "gray" id ="actor"></li></ul>'+
        '</div><div id="Summary"><li class ="summary" id = "summary"></li></div></div>'
document.body.onkeyup = Press;
document.body.onclick = onClick;
document.body.onmousedown = getPos;
var doubanMovieDom;
var allResults ={}
allResults.movies =[]
allResults.current = 0
var leftpx;
var toppx;
var filmName ='';
function getPos(e){
    leftpx = e.clientX
    toppx = e.clientY
    toppx = toppx +  $(document).scrollTop();
}
function onClick(e){
    var target = e.target;
    var _event = target.getAttribute( 'e');
    if( _event != "next" && _event != "pre"){
        if(doubanMovieDom){
            doubanMovieDom.remove()
        }
    }
}
function Press(e){
    if(e.altKey ==true && e.keyCode == 87){
        var selection = window.getSelection()
        filmName = selection.toString()
        allResults.movies = []
        allResults.current = 0
        GetMovie(filmName,0,false)
    }else if( e.keyCode == 27){
        if(doubanMovieDom){
            doubanMovieDom.remove()
        }
    }
}
function GetMovie(filmName,start,rebuild){
    url = "https://api.douban.com/v2/movie/search?q={"+filmName+"}&start="+start
    $.get(url,function(json){
        if(json.total >0){
            allResults.movies.push(json)
            var obj = json.subjects[0]
            var displayN = json.total > 1 ?'':'none'
            GetMovieById(obj.id,rebuild,displayN)
        }else{
            console.log("没有搜索到结果")
        }
    })
}
function GetMovieById(id,rebuild,displayN){
    url = "https://api.douban.com/v2/movie/subject/"+id
    $.get(url,function(json){
        if(json){
            var data = transJsonToData(json)
            if(!rebuild){
                appendDom(displayN)
            }
            loadData(data)
        }
    })
}
function whichStar( average){
    var num = ( 11 *( parseInt( average) /10)).toFixed(0)  * 15 - 165;
    if( num == -165)
        num = -150;
    return num;
}
function NextItem () {
    allResults.current += 1
    if(allResults.current < allResults.movies[0].total){
        //当前页号 > 缓存总页数时 娶下一页
        if(Math.ceil((allResults.current+1)/20) > allResults.movies.length){
            GetMovie(filmName,allResults.current,true)
        }
        else{ //否则直接从对应页取id
            var obj = allResults.movies[Math.floor(allResults.current/20)].subjects[allResults.current%20]
            GetMovieById(obj.id,true)
        }
    }
}
//上一部
function PreItem(){
    allResults.current -= 1
    if(allResults.current >= 0){
        var obj = allResults.movies[Math.floor(allResults.current/20)].subjects[allResults.current%20]
        GetMovieById(obj.id,true)
    }
}
function appendDom(displayN){
    var dom = '<div id="movie" class="Movie" style="left:'+leftpx+'px;top:'+toppx+'px">' + DomTree
    doubanMovieDom = $(dom)[0]
    var pageNext = doubanMovieDom.getElementsByTagName("a")[1];
    pageNext.style['display'] = displayN
    doubanMovieDom.onmousedown = function( e){
        e.stopPropagation();
    }
    doubanMovieDom.onmouseup = function( e){
        e.stopPropagation();
    }
    doubanMovieDom.onclick = function(e){

        var target = e.target;
        var _event = target.getAttribute( 'e');
        if(_event == "next"){
            console.log("next")
            NextItem();
        }else if(_event == "pre"){
            console.log("pre")
            PreItem();
        }
    }
    document.body.appendChild(doubanMovieDom)
}

function transJsonToData(json){
    var directors = ''
    var actors = ''
    for (var i = 0; i <= json.directors.length - 1; i++) {
        if(i!=0)
            directors += '/'
        directors = directors + json.directors[i].name
        
    }
    for (var i = 0; i <= json.casts.length - 1; i++) {
        if(i!=0)
            actors += '/'
        actors = actors + json.casts[i].name
    }
    var data = {
                "link":json.alt,
                "mtitle":json.title,
                "average":json.rating.average,
                "countries":'国家：'+json.countries,
                "genres":'类型：'+json.genres,
                "directors":'导演：'+directors,
                "actor":'演员：'+actors,
                "summary":'简介：<br>'+json.summary,
                "stars": whichStar( json.rating.average),
                "imgsrc":json.images.small
        } 
    return data
}

function loadData (data) {
    // body...
    var title = doubanMovieDom.getElementsByTagName("a")[2]
    var image = doubanMovieDom.getElementsByClassName("imgs")[0]
    var stars = doubanMovieDom.getElementsByClassName("Stars")[0]
    var pagePre = doubanMovieDom.getElementsByTagName("a")[0]
    var pageNext = doubanMovieDom.getElementsByTagName("a")[1]
    image.src = data.imgsrc
    stars.style[ 'background-position-y'] =  data.stars+ "px"
    title.href = data.link
    if(allResults.current == allResults.movies[0].total-1){
        pageNext.style['display'] = 'none'
    }else{
        pageNext.style['display'] = ''
    }
    if(allResults.current == 0){
        pagePre.style['display'] = 'none'
    }else{
        pagePre.style['display'] = ''
    }
    $('div#movie').loadJSON(data);
}