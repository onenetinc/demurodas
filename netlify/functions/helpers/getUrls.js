const getUrls = (urlsString) => {

    let urls = [];

    const parts = urlsString.split(',');

    for (let [index, part] of parts.entries()) {

        if (index > 10) break;

        const url = decodeURI(part);

        if (url.includes('https://uploads-ssl.webflow.com')) urls.push(part);

    }

    return urls;

};

module.exports = getUrls;