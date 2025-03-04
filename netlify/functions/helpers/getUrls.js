const getUrls = (urlsString) => {

    let urls = [];

    const parts = urlsString.split(',');

    for (let [index, part] of parts.entries()) {

        if (index > 10) break;

        // const url = decodeURI(part);
        const url = part;

        // if (url.includes('https://uploads-ssl.webflow.com')) urls.push(part);
        if (url.includes('cdn.prod.website-files.com')) {

            const newPart = url.replace('https://cdn.prod.website-files.com/5c3e43b5d1dbdf536d64838f', 'https://onenet.twic.pics/ddas');
            const newPart2 = newPart + '?twic=v1/resize=-x1200';

            urls.push(newPart2);
        }
        

    }

    return urls;

};

module.exports = getUrls;