const puppeteer = require('puppeteer')
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors({
    origin: "*"
}))

app.listen(port, () => { console.log(`Server is running on port ${port}`) });

app.get('/', function (req, res) {
    res.send('Hello World!')
  })

app.post('/', (req, res) => {
    console.log(req.body.calNetId)
    const { date, startTime, timeOfDay, duration, roomNumber, eventName, phoneNumber, calNetId, password } = req.body;
    initBrowser(calNetId, password, date, startTime, timeOfDay, duration, eventName, phoneNumber, roomNumber)
})

// app.post('/', async (req, res) => {
//     console.log(req.body.username)
//     const { date, startTime, timeOfDay, duration, roomNumber, eventName, phoneNumber, calNetId, password } = req.body;
//     try {
//         await initBrowser(calNetId, password, date, startTime, timeOfDay, duration, eventName, phoneNumber, roomNumber)
//         res.status(200).send('OK');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('An error occurred');
//     }
// });


const signInUrl = "https://ems.haas.berkeley.edu/emswebapp/Default.aspx?data=5BtDNigiZmYcBDtEfk61NA%3d%3d"

function addMinutes(time, mins) {
    // let timeParts = time.split(":");
    let date = new Date(2024, 0, 1, time)
    date.setHours(date.getHours() + 1)
    return date.getHours() + ":" + (date.getMinutes()<10?'0':"") + date.getMinutes();
    // let date = new Date(2023, 0, 1, timeParts[0], timeParts[1])
    // console.log(date)
    // date.setMinutes(date.getMinutes() + mins)
    // return date.getHours() + ":" + (date.getMinutes()<10?'0':"") + date.getMinutes();
}

async function initBrowser(username, password, date, startTime, timeOfDay, duration, eventName, phoneNumber, roomNumber) {
    const endTime = addMinutes(startTime, duration) + timeOfDay 
    startTime = startTime + " " + timeOfDay

    // const browser = await puppeteer.launch({headless: false});
    const browser = await puppeteer.launch({headless: "new", args: ['--no-sandbox']});
    const page = await browser.newPage();
    await page.goto(signInUrl);

    console.log("loginScreen()")
    await loginScreen(page, username, password)
    console.log("runSearch()")
    await runSearch(page, date, startTime, endTime)
    console.log("selectRoom()")
    await selectRoom(page, roomNumber)
    console.log("checkoutScreen()")
    await checkoutScreen(page, eventName, phoneNumber)
    // await browser.close()
}

async function loginScreen(page, username, password) {
    await page.type("#userID_input", username)
    await page.type("#password_input", password)
    await page.click("#pc_btnLogin"),

    await page.waitForSelector('a[href="#my-home"]');
    const link = await page.$('a[href="#my-home"]');
    await page.evaluate((link) => link.click(), link);

    await page.waitForSelector('.btn-xs');
    const buttons = await page.$$('.btn-xs')
    const button = buttons[0]
    await Promise.all([
        await page.evaluate((button) => button.click(), button),
        await page.waitForNavigation()

    ])
}

async function runSearch(page, date, startTime, endTime) {
    await page.waitForSelector("#booking-date-input")
    const dateInput = await page.$('input[id="booking-date-input"]');
    const startTimeInput = await page.$('input[id="start-time-input"]');
    const endTimeInput = await page.$('input[id="end-time-input"]');

    // //Clear date field
    await page.evaluate((dateInput) => dateInput.click(), dateInput),
    await new Promise(r => setTimeout(r, 300));
    await page.type("#booking-date-input", " ")
    // await new Promise(r => setTimeout(r, 10));
    for (let i=0; i<16; i++) {
        await page.keyboard.press('Backspace')
    }
    await page.keyboard.type(date)
    //Clear start time field
    await page.evaluate((startTimeInput) => startTimeInput.click(), startTimeInput)
    await new Promise(r => setTimeout(r, 200));
    await page.type("#start-time-input", " ")
    // await new Promise(r => setTimeout(r, 10));
    for (let i=0; i<9; i++) {
        await page.keyboard.press('Backspace')
    }
    await page.type("#start-time-input", startTime)
    // //Clear end time field
    await page.evaluate((endTimeInput) => endTimeInput.click(), endTimeInput)
    await new Promise(r => setTimeout(r, 200));
    await page.type("#end-time-input", "")
    // await new Promise(r => setTimeout(r, 10));
    for (let i=0; i<9; i++) {
        await page.keyboard.press('Backspace')
    }
    await page.type("#end-time-input", endTime)
    // //HIt that search button
    const searchButtons = await page.$$('.find-a-room.btn-primary')
    const searchButton = searchButtons[0]
    await Promise.all([
        page.evaluate((searchButton) => searchButton.click(), searchButton),
        await page.waitForSelector('div[data-room-id="345"]')
    ])
    // await page.screenshot({path: "screenshots/end.png", fullPage: "true"})
}

async function selectRoom(page, roomNumber) {
    //convert room to data-room-id
    await page.waitForSelector('div[data-room-id="' + roomNumber + '"]')
    const div = await page.$('div[data-room-id="' + roomNumber + '"]');
    const iTag = await div.$('i[tabindex="0"]');
    await page.evaluate((iTag) => iTag.click(), iTag);
    
    await page.waitForSelector('a[href="#details"]')
    const details = await page.$('a[href="#details"]');
    await page.evaluate((details) => details.click(), details);

    // await page.waitForSelector('.btn-success');
    // const searchButton = await page.$('.btn-success')
    // await Promise.all([
    //     await page.waitForSelector('div[data-room-id="345"]:not(.visible)'),
    //     await page.evaluate((searchButton) => searchButton.click(), searchButton)
    // ])
    await new Promise(r => setTimeout(r, 100));
}

async function checkoutScreen(page, eventName, phoneNumber) {

    await page.type("#event-name", eventName)
    await page.type('input[id="1stContactPhone1"]', phoneNumber)
    const final = await page.waitForSelector('#help-text-body-content')
    console.log(final)
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Enter")
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press("Enter")
    await new Promise(r => setTimeout(r, 5000));

    endPage = await page.$('#help-text-body-content');
    isVisible = await endPage.isVisible()
    console.log(isVisible)

    await page.screenshot({path: "screenshots/end.png", fullPage: "true"})
    // await page.waitForSelector('.btn-success');
    // const searchButton = await page.$('.btn-success')
    // await page.evaluate((searchButton) => searchButton.click(), searchButton)


    // //Fill out phone number
    // await page.waitForSelector('input[id="1stContactPhone1"]')
    // const phoneNumberInput = await page.$('input[id="1stContactPhone1"]');
    // await page.evaluate((phoneNumberInput) => phoneNumberInput.click(), phoneNumberInput)
}
