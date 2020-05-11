console.log("Starting...")

const electron = require("electron");
const url = require("url");
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let startWindow;
let tabWindow;

/*----------- Variables -----------*/
var config = require("../config.json")

if (require("../config.json").language === "english") var lang = require("./languages/english.json")
if (require("../config.json").language === "german") var lang = require("./languages/german.json")

/*----------- Ready Event -----------*/
app.on('ready', function() {
    console.log("App is ready!")
    console.log("")

    startWindow = new BrowserWindow({ //Create a window
        width: 400,
        height: 300,
        webPreferences: {
            nodeIntegration: true }
    });
    startWindow.loadURL(url.format({ //Load html
        pathname: path.join(__dirname, 'startWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    const startMenu = Menu.buildFromTemplate(startMenuTemplate); //Build menu from template
    Menu.setApplicationMenu(null) //Remove default menu from all windows
    if (config.enabledevtools === true) {
        Menu.setApplicationMenu(startMenu) //add Dev Tools to all Windows when in development
    }
    startWindow.setMenu(startMenu) //Insert Menu in startWindow
});

/*----------- Create Windows -----------*/
function createTabWindow(tabnumber) {
    tabWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true }
    })
    tabWindow.tabnumber = tabnumber;

    tabWindow.loadURL(url.format({ //Load html
        pathname: path.join(__dirname, 'tabWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    const tabMenu = Menu.buildFromTemplate(tabMenuTemplate)
    tabWindow.setMenu(tabMenu)
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 300,
        height: 200,
        webPreferences: {
            nodeIntegration: true }
    })

    aboutWindow.loadURL(url.format({ //Load html
        pathname: path.join(__dirname, 'aboutWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function createExportTabToExcelWindow() {
    var Excel = require('exceljs');

    var workbook = new Excel.Workbook();
    var sheet = workbook.addWorksheet('Sheet1');

    let tabnumber = electron.BrowserWindow.getFocusedWindow().tabnumber;
    var thistab = require(`../Tabulars/tab${tabnumber}`)

    var mycolumns = []

    Object.values(thistab["columns"]).forEach((e) => {
        mycolumns.push({header: e, key: e})
    })

    Object.keys(thistab).forEach((e) => { //loop through all keys
        if (!isNaN(e)) { //check if this is data and not table information by checking if the key is a number
            var rowValues = [];
            Object.values(thistab[e]).forEach((j) => { //loop through all values of the current key (e)
                rowValues.push(j)
            })
            sheet.addRow(rowValues)
        }
    })
   
    sheet.columns = mycolumns

    //Better sizing. Credit: https://github.com/exceljs/exceljs/issues/83#issuecomment-552765943
    for (let i = 0; i < sheet.columns.length; i += 1) { 
        let dataMax = 0;
        const column = sheet.columns[i];
        for (let j = 1; j < column.values.length; j += 1) {
          const columnLength = column.values[j].length;
          if (columnLength > dataMax) {
            dataMax = columnLength;
          }
        }
        column.width = dataMax < 10 ? 10 : dataMax;
      }

    workbook.xlsx.writeFile(`${lang.tabular} ${tabnumber} Export.xlsx`)
    .then(function() {
        console.log("File Saved");
    });
}
function createEditRowWindow(tabnumber, e) {
    var thistab = require(`../Tabulars/tab${tabnumber}`)
    var height = 250 + thistab["columns"].length * 24

    editRowWindow = new BrowserWindow({
        width: 400,
        height: height,
        webPreferences: {
            nodeIntegration: true }
    })
    editRowWindow.tabnumber = tabnumber;
    editRowWindow.editKey = e

    editRowWindow.loadURL(url.format({ //Load html
        pathname: path.join(__dirname, 'editRowWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function createAddRowWindow(tabnumber, customNewKey) {
    var thistab = require(`../Tabulars/tab${tabnumber}`)
    var height = 250 + thistab["columns"].length * 24

    addRowWindow = new BrowserWindow({
        width: 400,
        height: height,
        webPreferences: {
            nodeIntegration: true }
    })
    addRowWindow.tabnumber = tabnumber;
    addRowWindow.customNewKey = customNewKey;

    addRowWindow.loadURL(url.format({ //Load html
        pathname: path.join(__dirname, 'addRowWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function createSearchResultWindow(tabnumber, searchresults) {
    var height = 250 + searchresults.length * 30

    searchResultWindow = new BrowserWindow({
        width: 700,
        height: height,
        webPreferences: {
            nodeIntegration: true }
    })
    searchResultWindow.searchresults = searchresults;
    searchResultWindow.tabnumber = tabnumber;

    searchResultWindow.loadURL(url.format({ //Load html
        pathname: path.join(__dirname, 'searchResultWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function createAddTabWindow() {
    addTabWindow = new BrowserWindow({
        width: 700,
        height: 500,
        webPreferences: {
            nodeIntegration: true }
    })

    addTabWindow.loadURL(url.format({ //Load html
        pathname: path.join(__dirname, 'addTabWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
}

function createEditTabWindow() {

}

function createDeleteTabWindow() {
    console.log("Delete!")
}

/*----------- Event Listener -----------*/
ipcMain.on('tabButtonPress', function(event, tabnumber) {
    createTabWindow(tabnumber);
})
ipcMain.on('tabEditButtonPress', function(event, tabnumber, e) {
    createEditRowWindow(tabnumber, e)
})
ipcMain.on('tabAddRowButtonPress', function(event, tabnumber, customNewKey) {
    createAddRowWindow(tabnumber, customNewKey);
})
ipcMain.on('refreshTabWindow', () => {
    tabWindow.webContents.send("refreshTabs")
})
ipcMain.on('openSearchResultWindow', function(event, tabnumber, searchresults) {
    createSearchResultWindow(tabnumber, searchresults)
})
ipcMain.on('refreshStartWindow', () => {
    startWindow.webContents.send("refreshTabs")
})

/*----------- Menu Templates -----------*/
//Template for the start menu
const startMenuTemplate = [
    {
        label: lang.application,
        submenu: [
            {
                label: lang.addtab,
                click() {
                    createAddTabWindow();
                }
            },
            {
                label: lang.settings,
                click() {
                    //Open Settings Menu
                    console.log("Settings!") }
            },
            {
                label: lang.quit,
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click() {
                    app.quit() }
            }
        ]
    },
    {
        label: lang.about,
        click() {
            createAboutWindow();
        }
    }
]
const tabMenuTemplate = [
    {
        label: lang.tabular,
        submenu: [
            {
                label: lang.edittab,
                click() {
                    createEditTabWindow();
                }
            },
            {
                label: lang.deletetab,
                click() {
                    createDeleteTabWindow();
                }
            },
            {
                label: lang.exporttab,
                click() {
                    createExportTabToExcelWindow();
                }
            },
            {
                label: lang.closetab,
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    },
    {
        label: lang.about,
        click() {
            createAboutWindow();
        }
    }
]

//Enable dev tools every time when the programm is running on my machine
if ((process.env.COMPUTERNAME === 'HÖLLENMASCHINE' && process.env.USERNAME === 'tomgo') || (process.env.USER === 'tom' && require('os').hostname() === 'Toms-Thinkpad')) {
    config.enabledevtools = true }

//Add developer tools to startMenu template menu
if (config.enabledevtools === true) {
    startMenuTemplate.push({
        label: lang.devtools,
        submenu: [
            {
                label: lang.toggledevtools,
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools() } 
            },
            {
                role: 'reload',
            }]
    }) 
    tabMenuTemplate.push({
        label: lang.devtools,
        submenu: [
            {
                label: lang.toggledevtools,
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools() } 
            },
            {
                role: 'reload',
            }]
    }) 
}