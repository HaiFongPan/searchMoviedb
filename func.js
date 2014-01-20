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
var leftpx;
var toppx;
function getPos(e){
    leftpx = e.clientX
    toppx = e.clientY
    toppx = toppx +  $(document).scrollTop();
}
function onClick(e){
    if(doubanMovieDom){
        doubanMovieDom.remove()
    }
}
function Press(e){
    if(e.altKey ==true && e.keyCode == 87){
        var selection = window.getSelection();
        var filmName = selection.toString();
        GetMovie(filmName)
    }else if( e.keyCode == 27){
        if(doubanMovieDom){
            doubanMovieDom.remove()
        }
    }
}
function GetMovie(filmName){
    url = "https://api.douban.com/v2/movie/search?q={"+filmName+"}"
    $.get(url,function(json){
        var obj = json.subjects[0]
        GetMovieById(obj.id)
    })
}
function GetMovieById(id){
    url = "http://api.douban.com/v2/movie/subject/"+id
    $.get(url,function(json){
        if(json){
            var li = '<div id="Pic"><img src="'+json.images.small+'" width =92 height=132></div>'+
                     '<div id="Content"><ul><li class="Info">片名： <a title="' + json.title + '" target="_blank" href="' + json.alt + '">'+json.title+'</a></li>'+
                     '<li class = "Info"><span class="Stars" style="background-position: 0 '+whichStar(json.rating.average)+'px;"><strong><p>'+'   '+json.rating.average+'</p></strong></span>'+
                     '</li><br><li class = "Info">'+json.countries+'</li><li class = "Info">'+json.genres+'</li><li class= "gray">导演：';
            
            for (var i = json.directors.length - 1; i >= 0; i--) {
                li = li + json.directors[i].name
                if(i!=0)
                    li += '/'
            };
            li = li +'</li><li class= "gray">主演：'
            for (var i = json.casts.length - 1; i >= 0; i--) {
                li = li + json.casts[i].name
                if(i!=0)
                    li += '/'
            };
        　　  li = li + '</li></ul></div><div id="Summary"><li class ="summary">'+json.summary+'</li></div>'
            console.log(li)
            buildDomTree(li)
        }
    })
}
function buildDomTree(movieInfo){
    var domTree =[];
    domTree.push('<div style="left:',leftpx,'px;top:',
                    toppx,'px" class="Movie">',movieInfo,
                    '</div>')
    var movieDom = $(domTree.join(''))[0]
    movieDom.onmousedown = function( e){
        e.stopPropagation();
    }
    movieDom.onmouseup = function( e){
        e.stopPropagation();
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
