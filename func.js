/*
 *1. 获取内容
 *2. 通过api获取对应内容电影的id
 *3. 通过api获取对应id的具体内容
 *4. 构建DOM树，显示
 */
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
            console.log(allResults.movies)
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
            if(!rebuild){
                var li = '<div id="Pic"><img class ="imgs" src="'+json.images.large+'" width =92 height=132 ></div>'+
                         '<div id="Content"><ul><li class="Info">片名： <a title="' + json.title + '" target="_blank" href="' + json.alt + '">'+json.title+'</a></li>'+
                         '<li class = "Info"><span class="Stars" style="background-position: 0 '+whichStar(json.rating.average)+'px;"><strong><p class="average">'+json.rating.average+'</p></strong></span>'+
                         '</li><br><li class = "Info">'+json.countries+'</li><li class = "Info">'+json.genres+'</li><li class= "gray">导演：';
                
                for (var i = 0; i <= json.directors.length - 1; i++) {
                    if(i!=0)
                        li += '/'
                    li = li + json.directors[i].name
                    
                };
                li = li +'</li><li class= "gray" id ="actor">主演：'
                for (var i = 0; i <= json.casts.length - 1; i++) {
                    if(i!=0)
                        li += '/'
                    li = li + json.casts[i].name
                };
                li = li + '</li></ul></div><div id="Summary"><li class ="summary">'+json.summary+'</li></div>'
                buildDomTree(li,displayN)
            }else{
                Rebuild(json)
            }
        }
    })
}
function buildDomTree(movieInfo,displayN){
    var domTree =[];
    domTree.push('<div style="left:',leftpx,'px;top:',
                    toppx,'px" class="Movie"><span class ="prev"><a e="pre" style="display:none;text-decoration:none">< 上一部</a></span><span class = "next"><a e="next" style="display:'+displayN+';text-decoration:none">下一部 ></a></span>',movieInfo,
                    '</div>')
    var movieDom = $(domTree.join(''))[0]
    movieDom.onmousedown = function( e){
        e.stopPropagation();
    }
    movieDom.onmouseup = function( e){
        e.stopPropagation();
    }
    movieDom.onclick = function(e){
        var target = e.target;
        var _event = target.getAttribute( 'e');
        if(_event == "next"){
            NextItem();
        }else if(_event == "pre"){
            PreItem();
        }
    }
    document.body.appendChild(movieDom)
    doubanMovieDom = movieDom
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
            console.log(allResults.current/20,allResults.current%20)
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
//重构DOM树
function Rebuild(obj){
    
    var image = doubanMovieDom.getElementsByClassName("imgs")[0]
    var stars = doubanMovieDom.getElementsByClassName("Stars")[0]
    var average = doubanMovieDom.getElementsByTagName("p")[0];
    //var ratings_count = doubanMovieDom.getElementsByTagName("p")[1];
    var pagePre = doubanMovieDom.getElementsByTagName("a")[0];
    var pageNext = doubanMovieDom.getElementsByTagName("a")[1];
    var info = doubanMovieDom.getElementsByClassName("Info")
    var title = info[0]
    var countries = info[2]
    var genres = info[3]

    var gray = doubanMovieDom.getElementsByClassName("gray")
    var directors = gray[0]
    var actors = gray[1]

    var summary = doubanMovieDom.getElementsByClassName("summary")[0]
    
    image.src = obj.images.small
    stars.style[ 'background-position-y'] = whichStar( obj.rating.average) + "px";
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
    title.innerHTML = obj.title
    average.innerHTML = obj.rating.average
    //ratings_count.innerHTML = obj.ratings_count
    countries.innerHTML = obj.countries
    genres.innerHTML = obj.genres
    directors.innerHTML ='导演：'
    actors.innerHTML ='演员：'
    for (var i = 0; i <= obj.directors.length - 1; i++) {
        if(i!=0)
            directors.innerHTML += '/'
        directors.innerHTML = directors.innerHTML + obj.directors[i].name
        
    }
    for (var i = 0; i <= obj.casts.length - 1; i++) {
        if(i!=0)
            actors.innerHTML += '/'
        actors.innerHTML = actors.innerHTML + obj.casts[i].name
        
    }
    summary.innerHTML = obj.summary
}
function imgError(e) {
    // body...
    console.log('imgError',e)
}

