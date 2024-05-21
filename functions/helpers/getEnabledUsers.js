const getEnabledUsers = (admin) => {

    return new Promise((resolve, reject) => {

        console.log(`Getting list of users who are enabled from Firebase...`);

        let result = {};

        const list = async (nextPageToken) => {

            try {

                const userList = await admin.auth().listUsers(1000, nextPageToken);

                userList.users.forEach(user => {

                    const userData = user.toJSON();

                    if (userData.disabled === false) {

                        result[userData.uid] = { 
                            email: userData.email,
                            displayName: userData.displayName
                        };
                        
                    }

                });

                if (userList.nextPageToken) {

                    list(userList.nextPageToken);

                } else {

                    resolve(result);

                }

            } catch (err) {

                reject(err);
            }
        }

        list();

    });

}

module.exports = getEnabledUsers;