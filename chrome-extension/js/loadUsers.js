let userIdMappings;

let iframeDoc;

let listRunning = 0;

const setList = async () => {

    listRunning = 0;

    if (typeof userIdMappings !== 'object') await loadData();

    const els = iframeDoc.querySelectorAll('.C_USER_LIST_TEXT_DIV');

    if (els.length > 0) {

        els.forEach(el => {

            const id = el.innerText;
            const newData = userIdMappings[id] ? userIdMappings[id] : 'Deleted user';
            el.innerText = newData;

        });


    }

}

let profileNameRunning = 0;

const setProfileName = async () => {

    profileNameRunning = 0;

    if (typeof userIdMappings !== 'object') await loadData();

    const el = iframeDoc.querySelector('._GAZeb');

    const id = el.innerText;

    const newData = userIdMappings[id] ? userIdMappings[id] : 'Deleted user';
    el.innerText = newData;

}

const loadData = () => {

    return new Promise(async (resolve, reject) => {

        const secret = 'c0lMbQRuvkpOWKRgm4fS';

        try {

            const data = await fetch(`https://us-central1-demurodas.cloudfunctions.net/gaUsers?secret=${secret}`);

            const json = await data.json();

            userIdMappings = json;

            resolve();


        } catch (err) {

            console.error(err);
            reject(err);

        }

    });

}

const setObserver = (targetNode) => {

    const config = { attributes: true, childList: true, subtree: true };

    const callback = function (mutationsList, observer) {

        for (var mutation of mutationsList) {

            if (mutation.type == 'childList') {

                const reportName = getReportName();

                if (reportName === 'DeMeroDas User ID Tracking') {

                    switch (mutation.target.id) {

                        case 'ID-activity-userActivityProfile':
                            if (mutation.addedNodes.length > 0) {
                                profileNameRunning++;
                                if (profileNameRunning < 2) {
                                    setProfileName();
                                }
                            }
                            break;

                        case 'ID-explorer-table-dataTable':
                            if (mutation.addedNodes.length > 0) {
                                listRunning++;
                                if (listRunning < 2) {
                                    setList();
                                }
                            }
                            break;

                    }

                }

            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

}

const getReportName = () => {

    const reportNameEl = document.querySelector('.gmp-text-name');

    if (reportNameEl) {

        const reportName = reportNameEl.innerText;

        return reportName;

    }

    return null;

}

const setTarget = () => {

    const iframe = document.querySelector('#galaxyIframe');

    if (iframe) {

        iframe.onload = () => {

            iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            const main = iframeDoc.querySelector('#main');

            setObserver(main);

        }

    } else {

        setTimeout(() => {

            setTarget();

        }, 200);

    }

}

window.onload = setTarget;




