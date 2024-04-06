

function displayACaughtError(error, customTitle = "") {
    console.log("--- Caught an error ---")
    console.log(customTitle + "\n")
    console.log(error)
    console.log("------------------------")
}


export { displayACaughtError };