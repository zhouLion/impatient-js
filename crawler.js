const got = require("got").default
const cheerio = require("cheerio")
const path = require("path")
const { writeFile, exists, mkdir, pathExistsSync, mkdirSync, copyFile } = require("fs-extra")

const base = "https://exploringjs.com/impatient-js/"
const index = "https://exploringjs.com/impatient-js/toc.html"

// 递归创建目录 异步方法  
function mkdirs(dirname, callback) {
    exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            // console.log(path.dirname(dirname));  
            mkdirs(path.dirname(dirname), function () {
                mkdir(dirname, callback);
                console.log('在' + path.dirname(dirname) + '目录创建好' + dirname + '目录');
            });
        }
    });
}
// 递归创建目录 同步方法
function mkdirsSync(dirname) {
    if (pathExistsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            mkdirSync(dirname);
            return true;
        }
    }
}

function getToc() {
    got.get(index).text().then((text) => {
        const $$ = cheerio.load(text)
        const tocList = $$("#TOC").find("a")
        tocList.each((i, a) => {
            a.attribs.target = "contentIframe"
            if (a.attribs.href && !a.attribs.href.includes("#")) {
                getContent(a.attribs.href)
            }
        })
        writeFile("ch/left.html", html($$("#TOC").html()), console.log)
    })
}

function getImgs(content) {
    const $$ = cheerio.load(content)
    $$("img").each((index, img) => {
        writeBuffer(img.attribs.src)
    })
}

function writeBuffer(src) {
    return got.get(base + src).buffer().then((buffer) => {
        writeContent(src, buffer)
    })
}

function writeContent(src, content) {
    writeFile("ch/" + src, content, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("loaded: ", src)
        }
    });
}

function getContent(href) {
    console.log("loading: ", href)
    got.get(base + href).text().then((text) => {
        const $$ = cheerio.load(text)
        const content = $$("#page-content").html()
        getImgs(content)
        writeContent(href, html(content))
    })
}

function html(content) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" href="book.css" type="text/css">
    </head>
    <body>
    ${content}
    </body>
    </html>
    `
}

mkdirsSync("ch/img-book/img/icons")
getToc()
writeContent("index.html", html(`<iframe src="left.html" id="leftIframe" name="leftIframe" frameborder="0"></iframe>
<iframe src="pt_variables-values.html" name="contentIframe" id="contentIframe" frameborder="0"></iframe>`))
copyFile("book.css", "ch/book.css")
