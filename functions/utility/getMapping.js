const createNewMapping = require('../helpers/createNewMapping');
const fs = require('fs');

const getWfItems = require('../helpers/getWfItems');

getWfItems().then((items) => {
    const newMapping = createNewMapping(items);
    fs.writeFileSync('output.json', JSON.stringify(newMapping, null, 4));
});
