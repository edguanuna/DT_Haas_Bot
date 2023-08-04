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
    console.log(req.body)
    const { date, startTime, timeOfDay, duration, roomNumber, eventName, phoneNumber, calNetId, password } = req.body;
    initBrowser(calNetId, password, date, startTime, timeOfDay, duration, eventName, phoneNumber, roomNumber)
})


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

    const browser = await puppeteer.launch({headless: false});
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

    //Seal the deal.
    // await new Promise(r => setTimeout(r, 5000));
    // await page.waitForSelector('.btn-success');
    // const successBtn = await page.$('.btn-success')
    // await page.evaluate((successBtn) => successBtn.click(), successBtn)
}

async function loginScreen(page, username, password) {
    await page.type("#userID_input", username)
    await page.type("#password_input", password)
    await page.click("#pc_btnLogin")

    await page.waitForSelector('a[href="#my-home"]');
    const link = await page.$('a[href="#my-home"]');
    await page.evaluate((link) => link.click(), link);

    await page.waitForSelector('.btn-xs');
    const buttons = await page.$$('.btn-xs')
    const button = buttons[0]

    await page.evaluate((button) => button.click(), button)
}

async function runSearch(page, date, startTime, endTime) {
    await page.waitForSelector("#booking-date-input")
    const dateInput = await page.$('input[id="booking-date-input"]');
    const startTimeInput = await page.$('input[id="start-time-input"]');
    const endTimeInput = await page.$('input[id="end-time-input"]');

    //Clear date field
    await page.evaluate((dateInput) => dateInput.click(), dateInput)
    await new Promise(r => setTimeout(r, 400));
    await page.type("#booking-date-input", "no")
    await new Promise(r => setTimeout(r, 50));
    for (let i=0; i<16; i++) {
        await page.keyboard.press('Backspace')
    }
    await page.keyboard.type(date)
    // await new Promise(r => setTimeout(r, 50));
    // await page.type("#booking-date-input", "Thu 08/10/2023")

    //Clear start time field
    await page.evaluate((startTimeInput) => startTimeInput.click(), startTimeInput)
    await new Promise(r => setTimeout(r, 300));
    await page.type("#start-time-input", "")
    await new Promise(r => setTimeout(r, 100));
    for (let i=0; i<9; i++) {
        await page.keyboard.press('Backspace')
    }
    await page.type("#start-time-input", startTime)
    //Clear end time field
    await page.evaluate((endTimeInput) => endTimeInput.click(), endTimeInput)
    await new Promise(r => setTimeout(r, 300));
    await page.type("#end-time-input", "")
    await new Promise(r => setTimeout(r, 100));
    for (let i=0; i<9; i++) {
        await page.keyboard.press('Backspace')
    }
    await page.type("#end-time-input", endTime)
    //HIt that search button
    await page.waitForSelector('.find-a-room.btn-primary');
    const searchButtons = await page.$$('.find-a-room.btn-primary')
    const searchButton = searchButtons[0]
    await page.evaluate((searchButton) => searchButton.click(), searchButton)
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

    await page.waitForSelector('.btn-success');
    const searchButton = await page.$('.btn-success')
    await page.evaluate((searchButton) => searchButton.click(), searchButton)
}

async function checkoutScreen(page, eventName, phoneNumber) {
    await page.keyboard.type(eventName)
    await new Promise(r => setTimeout(r, 100));
    // //Fill out phone number
    // await page.waitForSelector('input[id="1stContactPhone1"]')
    // const phoneNumberInput = await page.$('input[id="1stContactPhone1"]');
    // await page.evaluate((phoneNumberInput) => phoneNumberInput.click(), phoneNumberInput)
    await page.waitForSelector('.btn-success');
    const searchButton = await page.$('.btn-success')
    await page.evaluate((searchButton) => searchButton.click(), searchButton)
    await page.keyboard.type(phoneNumber)
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate((searchButton) => searchButton.click(), searchButton)
    // //Seal the deal
}
