const { Builder, By, until, Key } = require('selenium-webdriver');
require('chromedriver');

// For password input (Note: Use a more secure method for handling passwords)
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

function getPassword(prompt) {
    return new Promise((resolve) => {
        rl.stdoutMuted = true;
        rl.question(prompt, function(password) {
            rl.stdoutMuted = false;
            console.log();
            resolve(password);
            rl.close();
        });

        rl._writeToOutput = function(stringToWrite) {
            if (rl.stdoutMuted)
                rl.output.write("*");
            else
                rl.output.write(stringToWrite);
        };
    });
}

async function clickElementWithRetries(driver, locator, maxAttempts = 25, interval = 500) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            let element = await driver.findElement(locator);
            await element.click();
            console.log(`[INFO] Clicked element successfully on attempt ${attempt}`);
            return; // Exit function on successful click
        } catch (error) {
            console.log(`[ERROR] Attempt ${attempt} failed: ${error.message}`);
            if (attempt < maxAttempts) {
                await driver.sleep(interval);
            } else {
                throw new Error(`Failed to click element after ${maxAttempts} attempts.`);
            }
        }
    }
}

(async function() {
    let password = await getPassword("Enter your password: ");

    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.manage().window().setRect({ width: 800, height: 1000 });
        let root = "https://myworkday.ubc.ca";
        await driver.get(root);

        await driver.wait(until.elementLocated(By.id("username")), 10000);
        console.log("[INFO] Reached login page. Entering login creds...");
        await driver.findElement(By.id("username")).sendKeys("a");
        await driver.findElement(By.id("password")).sendKeys(password);
        await driver.findElement(By.name("_eventId_proceed")).click();
        console.log("[INFO] Logging in... Approve DUO Push");
        await driver.sleep(10000);

        try {
            await driver.wait(until.elementLocated(By.id("dont-trust-browser-button")), 10000);
            console.log("[INFO] DUO auth completed");
            await driver.findElement(By.id("dont-trust-browser-button")).click();
        } catch (error) {
            console.log("[INFO] Skipping DUO auth step");
        }

        await driver.wait(until.elementLocated(By.css("[aria-label='Academics']")), 150000);
        console.log("[INFO] Reached Workday Homepage");
        await driver.sleep(1000);
        // let acadButtons = await driver.findElements(By.css("[aria-label='Academics']"));
        await clickElementWithRetries(driver, By.css("[aria-label='Academics']"), 14, 1000);

        console.log("[INFO] Navigating to academics...");

        await driver.wait(until.elementLocated(By.css("[data-automation-id='tabBar']")), 10000);
        console.log("[INFO] Reached Academics Page");
        let tabBar = await driver.findElement(By.css("[data-automation-id='tabBar']"));
        let courseTabButtons = await tabBar.findElements(By.tagName("li"));
        await courseTabButtons[1].click();

        await driver.wait(until.elementLocated(By.css("[title='Find Course Sections']")), 10000);
        console.log("[INFO] Reached Registration and Courses Page");
        await driver.sleep(5000);
        let exploreButton = await driver.findElement(By.css("[title='Find Course Sections']"));
        await exploreButton.click();
        console.log("[INFO] Navigating to exploring courses");
        await driver.sleep(5000);

        // For the date field of the form
        await driver.wait(until.elementLocated(By.id("ExternalField146_44940PromptQualifier1")), 10000);
        let dateButton = await driver.findElement(By.id("ExternalField146_44940PromptQualifier1"));
        console.log(dateButton);
        await dateButton.click();
        console.log("[INFO] Navigated to start date dropdown");

        let dateInput = await driver.findElement(By.css("[data-automation-id='multiselectInputContainer'] input"));
        let terms = [
            "2024-25 Winter Term 1 (UBC-O)",
            "2024-25 Winter Term 2 (UBC-O)",
            "2025 Summer Session (UBC-O)"
        ];

        for (let term of terms) {
            await dateInput.sendKeys(term);
            await dateInput.sendKeys(Key.RETURN);
            await driver.sleep(3000);
            console.log(`[INFO] Entered '${term}' in the search input and pressed Enter`);
        }

        // Click on a non-interactive element to close the first dropdown
        let nonInteractiveElement = await driver.findElement(By.xpath("//label[text()='Academic Level']"));
        await nonInteractiveElement.click();
        console.log("[INFO] Clicked on a non-interactive element to close the dropdown");
        await driver.sleep(2000);

        // For the level field of the form
        let levelButton = await driver.findElement(By.id("ExternalField146_44944PromptQualifier1"));
        console.log(levelButton);
        await levelButton.click();
        console.log("[INFO] Navigated to academic level dropdown");

        let levelInput = await driver.findElement(By.css("[data-uxi-element-id='ExternalField146_44944PromptQualifier1'] input"));
        let terms2 = ["Undergraduate", "Graduate", "Academic Level Not Applicable"];

        for (let term of terms2) {
            await levelInput.sendKeys(term);
            await levelInput.sendKeys(Key.RETURN);
            await driver.sleep(3000);
            console.log(`[INFO] Entered '${term}' in the search input and pressed Enter`);
        }

        await driver.sleep(2000);
        let submitButton = await driver.findElement(By.css("[data-automation-id='wd-CommandButton_uic_okButton']"));
        await submitButton.click();
        await driver.sleep(20000);
        console.log("SUCCESS");

    } finally {
        // Close the browser window
        await driver.quit();
    }
})();
