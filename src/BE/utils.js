const { until } = require('selenium-webdriver');
const { NotClickableError, ItemNotFoundError, UserSideError, WuDaFuError } = require('./error');

class Util {
    static async validate(data, label) {
        if (data === null || data === undefined) {
            throw new UserSideError(`Invalid input: ${label} must not be null or undefined`);
        }
    }
    
    static async waitToLoad(driver, locator, timeOutDuration = 150000) {
        this.validate(driver);
        this.validate(locator);
        this.validate(timeOutDuration);

        try {
            await driver.wait(until.elementLocated(locator), timeOutDuration);
        } catch (_) {
            throw new ItemNotFoundError(`Time out. Locator not found on the webpage.`);
        }
    }

    static async clickElementWithRetries(driver, locator, maxAttempts = 101, interval = 500) {
        this.validate(driver);
        this.validate(locator);
        this.validate(maxAttempts);
        this.validate(interval);
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                let element = await driver.findElement(locator);
                await element.click();
                console.log(`[INFO] Clicked element successfully on attempt ${attempt}`);
                return;
            } catch (error) {
                console.log(`[ERROR] Attempt ${attempt} failed: ${error.message}`);
                if (attempt < maxAttempts) {
                    await driver.sleep(interval);
                } else {
                    throw new NotClickableError(`Failed to click element after ${maxAttempts} attempts.`);
                }
            }
        }
    }

    static async pressButton(driver, locator) {
        await this.waitToLoad(driver, locator);
        await this.clickElementWithRetries(driver, locator);
    }
}

module.exports = Util;