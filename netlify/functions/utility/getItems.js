const fs = require('fs');

const getWfItems = require('../helpers/getWfItems');

getWfItems().then((items) => {
    fs.writeFileSync('items.json', JSON.stringify(items, null, 4))
});

