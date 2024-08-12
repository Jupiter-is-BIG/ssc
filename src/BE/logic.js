const { Builder, By, until, Key } = require('selenium-webdriver');
require('chromedriver');

const { DriverInitFailed, UserSideError, AuthError } = require('./error');
const Util = require('./utils'); 

class BE {
    static DRIVER = null;
    static LAST_CAMPUS_REQUEST = 'UNK';
    static LAST_SESSION_REQUEST = 'UNK';
    static ROOT = "https://myworkday.ubc.ca";
    static HOME = "https://wd10.myworkday.com/ubc/d/home.htmld";

    static instance;

    constructor() {
        if (BE.instance) {
            return BE.instance;
        }

        // Initialize attributes and methods as before...
        BE.instance = this;
    }

    static getInstance() {
        if (!BE.instance) {
            BE.instance = new BE();
        }
        return BE.instance;
    }

    static async INIT() {
        try {
            BE.DRIVER = await new Builder().forBrowser('chrome').build();
            await BE.DRIVER.manage().window().setRect({ width: 800, height: 10000 });
            await BE.DRIVER.get(BE.ROOT);
            await Util.waitToLoad(BE.DRIVER, By.id("username"));
        } catch (error) {
            throw new DriverInitFailed(`Failed to initialize the WebDriver: ${error.message}`);
        }
    }

    static async login(cwl, password) {
        Util.validate(cwl, 'cwl');
        Util.validate(password, 'password');
        await BE.DRIVER.findElement(By.id("username")).sendKeys(cwl);
        await BE.DRIVER.findElement(By.id("password")).sendKeys(password);
        await Util.pressButton(BE.DRIVER, By.name("_eventId_proceed"));
        await BE.authValidation();
        await Util.waitToLoad(BE.DRIVER, By.css("[aria-label='Academics']"));
    }

    static async query(session, campus, course) {
        Util.validate(session, 'session');
        Util.validate(campus, 'campus');
        Util.validate(BE.DRIVER, 'DRIVER');
        if (session !== BE.LAST_SESSION_REQUEST || campus !== BE.LAST_CAMPUS_REQUEST) {
            console.log('[INFO] Change in last state. This will cause latency.');
            await BE.goToSearch(session, campus);
        }
        let searchBar = await BE.DRIVER.findElement(By.id("wd-AdvancedFacetedSearch-SearchTextBox-input"));
        await searchBar.sendKeys(course);
        await searchBar.sendKeys(Key.ENTER);
        await Util.waitToLoad(BE.DRIVER, By.css('div.WNUN.WOUN[data-automation-id="facetGlassPanel"]'));
        await Util.waitToLoad(BE.DRIVER, By.css('[id^="wd-FacetedSearchResultList-PaginationText"]'));
        let sections = await BE.DRIVER.findElements(By.css('[id^=wd-CompositeWidget-]'));
        console.log(sections.length);
    }

    // ------------------------------- PRIVATE METHODS ---------------------------------------------
    // ------------------- DO NOT USE ANYWHERE ELSE THANK YOU UWU ----------------------------------

    static async authValidation() {
        try {
            await Util.pressButton(BE.DRIVER, By.id("dont-trust-browser-button"));
        } catch (error) {
            throw new AuthError(error.message);
        }
    }

    static async goToSearch(session, campus) {
        Util.validate(session, 'session');
        Util.validate(campus, 'campus');
        await BE.DRIVER.get(BE.HOME);
        await Util.pressButton(BE.DRIVER, By.css("[aria-label='Academics']"));
        await Util.waitToLoad(BE.DRIVER, By.css("[data-automation-id='tabBar']"));
        let tabBar = await BE.DRIVER.findElement(By.css("[data-automation-id='tabBar']"));
        let courseTabButtons = await tabBar.findElements(By.tagName("li"));
        await courseTabButtons[1].click();
        await Util.pressButton(BE.DRIVER, By.css("[title='Find Course Sections']"));
        await BE.handleSessionEntry(session, campus);
        await BE.handleLevelEntry();
        await Util.pressButton(BE.DRIVER, By.css("[data-automation-id='wd-CommandButton_uic_okButton']"));
        await Util.waitToLoad(BE.DRIVER, By.id("wd-AdvancedFacetedSearch-SearchTextBox-input"));
        BE.LAST_CAMPUS_REQUEST = campus;
        BE.LAST_SESSION_REQUEST = session;
    }

    static async handleSessionEntry(session, campus) {
        await Util.pressButton(BE.DRIVER, By.id("ExternalField146_44940PromptQualifier1"));
        await Util.waitToLoad(BE.DRIVER, By.css("[data-automation-id='multiselectInputContainer'] input"));
        let dateInput = await BE.DRIVER.findElement(By.css("[data-automation-id='multiselectInputContainer'] input"));
        let terms = BE.getSessionMapping(session, campus);
        for (let term of terms) {
            await dateInput.sendKeys(term[0]);
            await dateInput.sendKeys(Key.RETURN);
            await Util.waitToLoad(BE.DRIVER, By.css(`[title='${term[1]}']`));
            console.log(`[INFO] Entered '${term[0]}' in the search input and pressed Enter`);
        }
        await Util.pressButton(BE.DRIVER, By.xpath("//label[text()='Academic Level']"));
    }

    static async handleLevelEntry() {
        await Util.pressButton(BE.DRIVER, By.id("ExternalField146_44944PromptQualifier1"));
        await Util.waitToLoad(BE.DRIVER, By.css("[data-uxi-element-id='ExternalField146_44944PromptQualifier1'] input"));
        let levelInput = await BE.DRIVER.findElement(By.css("[data-uxi-element-id='ExternalField146_44944PromptQualifier1'] input"));
        let levels = ["Undergraduate", "Graduate", "Academic Level Not Applicable"];
        for (let level of levels) {
            await levelInput.sendKeys(level);
            await levelInput.sendKeys(Key.RETURN);
            await Util.waitToLoad(BE.DRIVER, By.css(`[title='${level}']`));
            console.log(`[INFO] Entered '${level}' in the search input and pressed Enter`);
        }
    }

    static getSessionMapping(session, campus) {
        let terms = [];
        if (session === 'winter' && campus === 'ubco') {
            terms = [
                ["2024-25 Winter Term 1 (UBC-O)", "2024-25 Winter Term 1 (UBC-O) (2024-09-03-2024-12-06)"],
                ["2024-25 Winter Term 2 (UBC-O)", "2024-25 Winter Term 2 (UBC-O) (2025-01-06-2025-04-08)"],
            ];
        } else if (session === 'summer' && campus === 'ubco') {
            terms = [
                ["2025 Summer Session (UBC-O)", "2025 Summer Session (UBC-O) (2025-05-12-2025-08-08)"],
            ];
        } else if (session === 'winter' && campus === 'ubcv') {
            terms = [
                ["2024-25 Winter Term 1 (UBC-V)", "2024-25 Winter Term 1 (UBC-V) (2024-09-03-2024-12-06)"],
                ["2024-25 Winter Term 2 (UBC-V)", "2024-25 Winter Term 2 (UBC-V) (2025-01-06-2025-04-08)"],
            ];
        } else if (session === 'summer' && campus === 'ubcv') {
            terms = [
                ["2025 Summer Session (UBC-V)", "2025 Summer Session (UBC-O) (2025-05-12-2025-08-08)"],
            ];
        }
        return terms;
    }
}

// ------------------------------------- TEST ONLY ------------------------------------

(async function() {
    try {
        await BE.INIT();
        await BE.login("cwl", "password");
        await BE.goToSearch('winter', 'ubco');
        await BE.query('winter', 'ubco', 'COSC_O 111');
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
    } finally {
        if (BE.DRIVER) {
            await BE.DRIVER.quit();
        }
    }
})();
