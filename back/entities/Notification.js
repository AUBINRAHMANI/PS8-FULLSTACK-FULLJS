class Notification {

    /* Message is a string
     * Action is an action object representing an api call
     */
    constructor(message, action, link) {
        this.message = message
        this.action = action === undefined ? null : action
        this.link = link === undefined ? null : link
    }
}

export default Notification