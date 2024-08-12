const { Builder, By, until, Key } = require("selenium-webdriver");
require("chromedriver");

const { DriverInitFailed, UserSideError, AuthError } = require("./error");
const Util = require("./utils");

let DRIVER = null;
let LAST_CAMPUS_REQUEST = "UNK";
let LAST_SESSION_REQUEST = "UNK";
let ROOT = "https://myworkday.ubc.ca";
let HOME = "https://wd10.myworkday.com/ubc/d/home.htmld";

async function INIT() {
  try {
    DRIVER = await new Builder().forBrowser("chrome").build();
    await DRIVER.manage().window().setRect({ width: 800, height: 10000 });
    await DRIVER.get(ROOT);
    await Util.waitToLoad(DRIVER, By.id("username"));
  } catch (error) {
    throw new DriverInitFailed(
      `Failed to initialize the WebDriver: ${error.message}`
    );
  }
}

async function login(cwl, password) {
  Util.validate(cwl, "cwl");
  Util.validate(password, "password");
  await DRIVER.findElement(By.id("username")).sendKeys(cwl);
  await DRIVER.findElement(By.id("password")).sendKeys(password);
  await Util.pressButton(DRIVER, By.name("_eventId_proceed"));
  await authValidation();
  await Util.waitToLoad(DRIVER, By.css("[aria-label='Academics']"));
}

async function query(session, campus, course) {
  Util.validate(session, "session");
  Util.validate(campus, "campus");
  Util.validate(DRIVER, "DRIVER");
  if (session !== LAST_SESSION_REQUEST || campus !== LAST_CAMPUS_REQUEST) {
    console.log("[INFO] Change in last state. This will cause latency.");
    await goToSearch(session, campus);
  }
  let searchBar = await DRIVER.findElement(
    By.id("wd-AdvancedFacetedSearch-SearchTextBox-input")
  );
  await searchBar.sendKeys(course);
  await searchBar.sendKeys(Key.ENTER);
  await Util.waitToLoad(
    DRIVER,
    By.css('div.WNUN.WOUN[data-automation-id="facetGlassPanel"]')
  );
  await Util.waitToLoad(
    DRIVER,
    By.css('[id^="wd-FacetedSearchResultList-PaginationText"]')
  );
  let sections = await DRIVER.findElements(By.css("[id^=wd-CompositeWidget-]"));
  console.log(sections.length);
  // for (let section of sections) {

  // }
}

// ------------------------------- PRIVATE METHODS ---------------------------------------------
// ------------------- DO NOT USE ANYWHERE ELSE THANK YOU UWU ----------------------------------

async function authValidation() {
  try {
    await Util.pressButton(DRIVER, By.id("dont-trust-browser-button"));
  } catch (error) {
    throw new AuthError(error.message);
  }
}

async function goToSearch(session, campus) {
  Util.validate(session, "session");
  Util.validate(campus, "campus");
  await DRIVER.get(HOME);
  await Util.pressButton(DRIVER, By.css("[aria-label='Academics']"));
  await Util.waitToLoad(DRIVER, By.css("[data-automation-id='tabBar']"));
  let tabBar = await DRIVER.findElement(
    By.css("[data-automation-id='tabBar']")
  );
  let courseTabButtons = await tabBar.findElements(By.tagName("li"));
  await courseTabButtons[1].click();
  await Util.pressButton(DRIVER, By.css("[title='Find Course Sections']"));
  await handleSessionEntry(session, campus);
  await handleLevelEntry();
  await Util.pressButton(
    DRIVER,
    By.css("[data-automation-id='wd-CommandButton_uic_okButton']")
  );
  await Util.waitToLoad(
    DRIVER,
    By.id("wd-AdvancedFacetedSearch-SearchTextBox-input")
  );
  LAST_CAMPUS_REQUEST = campus;
  LAST_SESSION_REQUEST = session;
}

async function handleSessionEntry(session, campus) {
  await Util.pressButton(
    DRIVER,
    By.id("ExternalField146_44940PromptQualifier1")
  );
  await Util.waitToLoad(
    DRIVER,
    By.css("[data-automation-id='multiselectInputContainer'] input")
  );
  let dateInput = await DRIVER.findElement(
    By.css("[data-automation-id='multiselectInputContainer'] input")
  );
  let terms = getSessionMapping(session, campus);
  for (let term of terms) {
    await dateInput.sendKeys(term[0]);
    await dateInput.sendKeys(Key.RETURN);
    await Util.waitToLoad(DRIVER, By.css(`[title='${term[1]}']`));
    console.log(
      `[INFO] Entered '${term[0]}' in the search input and pressed Enter`
    );
  }
  await Util.pressButton(DRIVER, By.xpath("//label[text()='Academic Level']"));
}

async function handleLevelEntry() {
  await Util.pressButton(
    DRIVER,
    By.id("ExternalField146_44944PromptQualifier1")
  );
  await Util.waitToLoad(
    DRIVER,
    By.css(
      "[data-uxi-element-id='ExternalField146_44944PromptQualifier1'] input"
    )
  );
  let levelInput = await DRIVER.findElement(
    By.css(
      "[data-uxi-element-id='ExternalField146_44944PromptQualifier1'] input"
    )
  );
  let levels = ["Undergraduate", "Graduate", "Academic Level Not Applicable"];
  for (let level of levels) {
    await levelInput.sendKeys(level);
    await levelInput.sendKeys(Key.RETURN);
    await Util.waitToLoad(DRIVER, By.css(`[title='${level}']`));
    console.log(
      `[INFO] Entered '${level}' in the search input and pressed Enter`
    );
  }
}

function getSessionMapping(session, campus) {
  let terms = [];
  if (session === "winter" && campus === "ubco") {
    terms = [
      [
        "2024-25 Winter Term 1 (UBC-O)",
        "2024-25 Winter Term 1 (UBC-O) (2024-09-03-2024-12-06)",
      ],
      [
        "2024-25 Winter Term 2 (UBC-O)",
        "2024-25 Winter Term 2 (UBC-O) (2025-01-06-2025-04-08)",
      ],
    ];
  } else if (session === "summer" && campus === "ubco") {
    terms = [
      [
        "2025 Summer Session (UBC-O)",
        "2025 Summer Session (UBC-O) (2025-05-12-2025-08-08)",
      ],
    ];
  } else if (session === "winter" && campus === "ubcv") {
    terms = [
      [
        "2024-25 Winter Term 1 (UBC-V)",
        "2024-25 Winter Term 1 (UBC-V) (2024-09-03-2024-12-06)",
      ],
      [
        "2024-25 Winter Term 2 (UBC-V)",
        "2024-25 Winter Term 2 (UBC-V) (2025-01-06-2025-04-08)",
      ],
    ];
  } else if (session === "summer" && campus === "ubcv") {
    terms = [
      [
        "2025 Summer Session (UBC-V)",
        "2025 Summer Session (UBC-O) (2025-05-12-2025-08-08)",
      ],
    ];
  }
  return terms;
}

// ------------------------------------- TEST ONLY ------------------------------------

(async function () {
  try {
    await INIT();
    await login("cwl", "password");
    await goToSearch("winter", "ubco");
    await query("winter", "ubco", "COSC_O 111");
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
  } finally {
    if (DRIVER) {
      await DRIVER.quit();
    }
  }
})();
