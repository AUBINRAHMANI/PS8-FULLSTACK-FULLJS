/* Action is a class that represent an api call

 */
class Action {

    /* method is a string "get", "post", "put", "delete"
     * url is a string
     * body is a JSON Object required only for "post" and "put" method
     */
    constructor(method, url, body) {
        this.method = method
        this.url = url
        this.body = body

        this.checkMethod();
        this.checkBody();
    }

    checkMethod() {
        if (this.method !== "get" && this.method !== "post" && this.method !== "put" && this.method !== "delete") {
            throw new Error("Method is not valid");
        }
    }

    checkBody() {
        if (this.method === "post" || this.method === "put") {
            if (this.body === undefined || this.body === null) {
                throw new Error("Body is required for post and put method");
            }

            if (typeof this.body === "string") {
                this.body = JSON.parse(this.body);
            }
        } else {
            this.body = null;
        }
    }
}

export default Action;

