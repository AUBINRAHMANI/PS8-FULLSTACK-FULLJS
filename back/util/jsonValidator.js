let jsonValidator = (data, schema) => {
    // Check if data is an object of type string
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }

    let newObject = {};
    for (const key in data) {
        if (data.key !== undefined) {
            console.log("Convert Data: data doesn't have key ", key, data);
            throw Error("Invalid data");
        }

        if (typeof data[key] !== schema[key]) {
            console.log("Convert Data: data type doesn't match schema type ", key, "is type", typeof data[key], "and should be type", typeof schema[key]);
            console.log(typeof data[key], typeof schema[key]);
            throw Error("Invalid data");
        }
        newObject[key] = data[key];
    }
    return newObject;
}

export {jsonValidator};
