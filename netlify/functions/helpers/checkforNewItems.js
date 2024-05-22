const checkforNewItems = (existingMapping, newMapping) => {

    const newEntries = Object.entries(newMapping);

    if (newEntries.length === 0) {

        return null;

    }

    let newItems = [];

    newEntries.forEach(([key]) => {

        if (!existingMapping.hasOwnProperty(key)) {

            newItems.push(key);

        }

    });

    return newItems;


}

module.exports = checkforNewItems;