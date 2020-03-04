function imgFilter(htmlContent) {
    if (!htmlContent.includes('<img ')) return htmlContent;

    return htmlContent.replace(/<img\s.*?(src="(.+?)").*?>/gim, (str, srcStr, src) => {
        return str.replace('/img/', 'https://xmuu.gitee.io/blog-images/')
    });
}

function divFilter(result) {
    if (!result.includes('<div ')) return result;
    
    return result.replace(/<div\s.*?(data-bg="(.+?)").*?>/gim, (str, srcStr, src) => {
        return str.replace('/img/', 'https://xmuu.gitee.io/blog-images/')
    });
}

function postImageUrlUpdataProcess(data) {
    data.content = imgFilter(data.content);
    return data;
}

function lazyloadImageUrlUpdataProcess(result, data) {
    result = divFilter(result);
    return result;
}

hexo.extend.filter.register('after_post_render', postImageUrlUpdataProcess);
hexo.extend.filter.register('after_render:html', lazyloadImageUrlUpdataProcess);