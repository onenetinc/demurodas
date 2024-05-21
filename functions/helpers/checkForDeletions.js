const checkForDeletions = (existingMapping, newMapping) => {

    const existingEntries = Object.entries(existingMapping);

    if (existingEntries.length === 0) {

        return null;

    }

    let toDelete = [];

    existingEntries.forEach(([key]) => {

        if (!newMapping.hasOwnProperty(key)) {

            toDelete.push(key);

        }

    });

    return toDelete;


}

module.exports = checkForDeletions;