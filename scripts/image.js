function filter(htmlContent) {
    if (!htmlContent.includes('<img ')) return htmlContent;

    return htmlContent.replace(/<img\s.*?(src="(.+?)").*?>/gim, (str, srcStr, src) => {
        return str.replace('/img/', 'https://xmuu.gitee.io/blog-images/')
    });
}

function lazyProcess(data) {
    data.content = filter(data.content);
    return data;
}

hexo.extend.filter.register('after_post_render', lazyProcess);