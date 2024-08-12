class NotClickableError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotClickableError";
    }
}

class ItemNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "ItemNotFoundError";
    }
}

class DriverInitFailed extends Error {
    constructor(message) {
        super(message);
        this.name = "DriverInitFailed";
    }
}

class UserSideError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserSideError";
    }
}

class WuDaFuError extends Error {
    constructor(message) {
        super(message);
        this.name = "WuDaFuError";
    }
}

class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}

module.exports = {
    NotClickableError,
    ItemNotFoundError,
    DriverInitFailed,
    UserSideError,
    WuDaFuError,
    AuthError
};
