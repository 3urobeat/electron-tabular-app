const electron = require('electron')
const tabnumber = electron.remote.getCurrentWindow().tabnumber;
const customNewKey = electron.remote.getCurrentWindow().customNewKey;
var thistab = require(`${electron.remote.app.getAppPath()}/Tabulars/tab${tabnumber}`);

if (require("../config.json").language === "english") var lang = require("./languages/english.json")
if (require("../config.json").language === "german") var lang = require("./languages/german.json")

document.title = `${lang.addrow} - Electron Tabular App`

//Display input boxes as table to always have correct spacing (more easy you know)
var table = document.createElement('table');
                                                                     // tr   = table row
Object.values(thistab["columns"]).forEach((e, i) => {                // tdc  = table data cell
    var tr = document.createElement('tr');                           // text = text for this specific tdc
    var tdc1 = document.createElement('td');
    var tdc2 = document.createElement('td');     

    var inputbox = document.createElement("input");
    var inputboxlabel = document.createElement("label")

    inputboxlabel.textContent = e
    inputbox.id = e

    tdc1.appendChild(inputboxlabel);
    tdc2.appendChild(inputbox);

    if (e == lang.date) { //if column's name is date, add checkbox to automatically input today's date
        var inputcheckboxtoday = document.createElement("input")
        var inputcheckboxtodaylabel = document.createElement("label")
        var dateformat = require("../config.json").dateformat
        var d = function d() { return new Date() }

        var day = d().getUTCDate()
        if (day < 10) var day = "0" + day
        var month = d().getUTCMonth() + 1
        if (month < 10) var month = "0" + month

        inputcheckboxtoday.type = "checkbox"
        inputcheckboxtodaylabel.htmlFor = inputcheckboxtoday
        inputcheckboxtodaylabel.textContent = lang.inserttoday

        inputcheckboxtodaylabel.addEventListener("click", () => { //check if user clicks label instead of radio button
            inputcheckboxtoday.click() })

        inputcheckboxtoday.addEventListener("click", () => {
            if (inputbox.disabled == false) {
                inputbox.disabled = true
                inputbox.value = dateformat.replace("DD", day).replace("MM", month).replace("YYYY", d().getFullYear())
            } else { 
                inputbox.disabled = false 
                inputbox.value = ""
            }
        })

        tdc2.appendChild(inputcheckboxtoday)
        tdc2.appendChild(inputcheckboxtodaylabel)
    }

    tr.appendChild(tdc1);
    tr.appendChild(tdc2)

    table.appendChild(tr);
})

document.getElementById('addRowValueInput').appendChild(table);

document.getElementById("addRowToTabBtn").addEventListener("click", () => {
    thistabnewkey = 0;
    
    if (customNewKey) {
        thistabnewkey = customNewKey

        Object.keys(thistab).forEach((k) => { //add 1 to every key to account for the new key
            if (isNaN(k)) return;
            if (k < customNewKey) return;
            delete Object.assign(thistab, {[Number(k) + 1]: thistab[k] })[k] //Credit: https://stackoverflow.com/a/50101979/12934162 
        })
    } else {
        Object.keys(thistab).forEach((e) => { //get last numeric key of tab
            if (isNaN(e)) return
            thistabnewkey = Number(e) + 1 });
    }

    thistab[thistabnewkey] = {}

    Object.values(thistab["columns"]).forEach((e, i) => {  
        var thisinputvalue = document.getElementById(e).value
        var thisindex = thistab["columns"].indexOf(e)

        Object.keys(thistab[thistabnewkey]).push(thisindex)
        thistab[thistabnewkey][thisindex] = thisinputvalue
    }) 

    require("fs").writeFile(`${electron.remote.app.getAppPath()}/Tabulars/tab${tabnumber}.json`, JSON.stringify(thistab, null, 4), err => {
        if (err) return console.log(`error writing new data to file: ${err}`)
        electron.ipcRenderer.send("refreshTabWindow")
        window.close() })
})