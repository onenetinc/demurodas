const getAppSettings = require('../helpers/getAppSettings');

(async() => {
    const settings = await getAppSettings();
    console.log(settings);
})