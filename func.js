/*
 *1. 获取内容
 *2. 通过api获取对应内容电影的id
 *3. 通过api获取对应id的具体内容
 *4. 构建DOM树，显示
 */
var DomTree = '<span  class="prev"><a e="pre" style="display:none" e="pre"> &lt; 上一部</a></span>' +
    '<span class="next"><a e="next" style="" >下一部 &gt;</a></span>' +
    '<div id="Pic"><img class ="imgs" src="" width =95 /></div><div id="Content">' +
    '<ul><li class="Info" >片名：<a title="" target="_blank" href="" ><span e = "openmovie" id = "mtitle"></span></a></li>' +
    '<li class = "Info"><span class="Stars">' +
    '<strong><p class="average"><span id = "daverage"></span></p></strong></span>' +
    '</li><br><li class = "Info" id = "dcountries"></li><li class = "Info" id = "dgenres"></li>' +
    '<li class= "gray" id = "ddirectors"></li><li class= "gray" id ="dactor"></li></ul>' +
    '</div><div id="Summary"><section style ="height:auto" class ="summary" id ="summarydiv"><span id = "dsummary"></span><span id ="hiddenSummary"></span><br><em><b e ="show_hidden"></b></em></section></div></div>'
document.body.onkeyup = Press;
document.body.onclick = onClick;
document.body.onmousedown = getPos;
var doubanMovieDom;
var allResults = {}
allResults.movies = []
allResults.current = 0
var leftpx;
var toppx;
var filmName = '';
var split = 280

    function getPos(e) {
        leftpx = e.clientX
        toppx = e.clientY
        toppx = toppx + $(document).scrollTop();
    }

    function onClick(e) {
        var target = e.target;
        var _event = target.getAttribute('e');
        if (_event != "next" && _event != "pre" && _event != "show_hidden" && _event !="openmovie") {
            if (doubanMovieDom) {
                doubanMovieDom.remove()
            }
        }
    }

    function Press(e) {
        if (e.altKey == true && e.keyCode == 87) {
            var selection = window.getSelection()
            filmName = selection.toString()
            allResults.movies = []
            allResults.current = 0
            GetMovie(filmName, 0, false)
        } else if (e.keyCode == 27) {
            if (doubanMovieDom) {
                doubanMovieDom.remove()
            }
        }
    }

    function GetMovie(filmName, start, rebuild) {
        url = "https://api.douban.com/v2/movie/search?q={" + filmName + "}&start=" + start
        $.get(url, function(json) {
            if (json.total > 0) {
                allResults.movies.push(json)
                var obj = json.subjects[0]
                var displayN = json.total > 1 ? '' : 'none'
                GetMovieById(obj.id, rebuild, displayN)
            } else {
                alert("没有搜索到该电影")
            }
        })
    }

    function GetMovieById(id, rebuild, displayN) {
        url = "https://api.douban.com/v2/movie/subject/" + id
        $.get(url, function(json) {
            if (json) {
                var data = transJsonToData(json)
                if (!rebuild) {
                    appendDom(displayN)
                } 
                loadData(data)
            }
        })
    }

    function whichStar(average) {
        var num = (11 * (parseInt(average) / 10)).toFixed(0) * 15 - 165;
        if (num == -165)
            num = -150;
        return num;
    }

    function NextItem() {
        allResults.current += 1
        if (allResults.current < allResults.movies[0].total) {
            //当前页号 > 缓存总页数时 娶下一页
            if (Math.ceil((allResults.current + 1) / 20) > allResults.movies.length) {
                GetMovie(filmName, allResults.current, true)
            } else { //否则直接从对应页取id
                var obj = allResults.movies[Math.floor(allResults.current / 20)].subjects[allResults.current % 20]
                GetMovieById(obj.id, true)
            }
        }
    }
    //上一部
    function PreItem() {
        allResults.current -= 1
        if (allResults.current >= 0) {
            var obj = allResults.movies[Math.floor(allResults.current / 20)].subjects[allResults.current % 20]
            GetMovieById(obj.id, true)
        }
    }

    function appendDom(displayN) {
        var dom = '<div id="movie" class="Movie" style="left:' + leftpx + 'px;top:' + toppx + 'px">' + DomTree
        doubanMovieDom = $(dom)[0]
        var pageNext = doubanMovieDom.getElementsByTagName("a")[1];
        pageNext.style['display'] = displayN
        doubanMovieDom.onmousedown = function(e) {
            e.stopPropagation();
        }
        doubanMovieDom.onmouseup = function(e) {
            e.stopPropagation();
        }
        doubanMovieDom.onclick = function(e) {

            var target = e.target;
            var _event = target.getAttribute('e');
            if (_event == "next") {
                NextItem();
            } else if (_event == "pre") {
                PreItem();
            } else if (_event == "show_hidden") {
                showHidden();
            }
        }
        document.body.appendChild(doubanMovieDom)
    }

    function transJsonToData(json) {
        var directors = ''
        var actors = ''
        for (var i = 0; i <= json.directors.length - 1; i++) {
            if (i != 0)
                directors += '/'
            directors = directors + json.directors[i].name

        }
        for (var i = 0; i <= json.casts.length - 1; i++) {
            if (i != 0)
                actors += '/'
            actors = actors + json.casts[i].name
        }

        var data = {
            "link": json.alt,
            "mtitle": json.title,
            "daverage": json.rating.average,
            "dcountries": '国家：' + json.countries,
            "dgenres": '类型：' + json.genres,
            "ddirectors": '导演：' + directors,
            "dactor": '演员：' + actors,
            "dsummary": '<strong>简介：</strong><br>' + json.summary.substring(0, split),
            "hiddenSummary": json.summary.substring(split),
            "starsStyle": whichStar(json.rating.average),
            "imgsrc": json.images.large,
            "needsplit":json.summary.length >split ? 'inline':'none'
        }
        return data
    }

    function loadData(data) {
        var title = doubanMovieDom.getElementsByTagName("a")[2]
        var image = doubanMovieDom.getElementsByClassName("imgs")[0]
        var stars = doubanMovieDom.getElementsByClassName("Stars")[0]
        var pagePre = doubanMovieDom.getElementsByTagName("a")[0]
        var pageNext = doubanMovieDom.getElementsByTagName("a")[1]
        var hiddenS = document.getElementById("hiddenSummary")
        var b = doubanMovieDom.getElementsByTagName("b")[0]

        hiddenS.style['display'] = 'none'
        b.style['display'] = data.needsplit
        image.src = data.imgsrc
        title.href = data.link
        stars.style['background-position-y'] = data.starsStyle + "px"
        if (allResults.current == allResults.movies[0].total - 1) {
            pageNext.style['display'] = 'none'
        } else {
            pageNext.style['display'] = ''
        }
        if (allResults.current == 0) {
            pagePre.style['display'] = 'none'
        } else {
            pagePre.style['display'] = ''
        }
        $('div#movie').loadJSON(data);
    }

    function showHidden() {
        var summary = document.getElementById("summarydiv")
        var hiddenS = document.getElementById("hiddenSummary")
        var b = doubanMovieDom.getElementsByTagName("b")[0]
        b.style['display'] = 'none'
        summary.style['height'] = 'auto'
        hiddenS.style['display'] = 'inline'
    }