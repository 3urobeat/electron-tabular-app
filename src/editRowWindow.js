const electron = require('electron')
const tabnumber = electron.remote.getCurrentWindow().tabnumber;
const editKey = electron.remote.getCurrentWindow().editKey;
var thistab = require(`../Tabulars/tab${tabnumber}`);

if (require("../config.json").language === "english") var lang = require("./languages/english.json")
if (require("../config.json").language === "german") var lang = require("./languages/german.json")

document.title = `${lang.editrow} - Electron Tabular App`

//Display input boxes as table to always have correct spacing (more easy you know)
var table = document.createElement('table');
                                                                     // tr   = table row
Object.values(thistab[editKey]).forEach((e, i) => {                  // tdc  = table data cell
    var tr = document.createElement('tr');                           // text = text for this specific tdc
    var tdc1 = document.createElement('td');
    var tdc2 = document.createElement('td');

    var inputbox = document.createElement("input");
    var inputboxlabel = document.createElement("label")

    inputboxlabel.textContent = thistab["columns"][i]
    inputbox.id = i
    inputbox.value = e

    tdc1.appendChild(inputboxlabel);
    tdc2.appendChild(inputbox);

    tr.appendChild(tdc1);
    tr.appendChild(tdc2)

    table.appendChild(tr);
})

document.getElementById('editRowValueInput').appendChild(table);

document.getElementById("editRowSaveBtn").addEventListener("click", () => {   

    Object.values(thistab[editKey]).forEach((e, i) => {  
        var thisinputvalue = document.getElementById(i).value

        thistab[editKey][i] = thisinputvalue
    }) 

    require("fs").writeFile(`./Tabulars/tab${tabnumber}.json`, JSON.stringify(thistab, null, 4), err => {
        if (err) return console.log(`error writing edited data to file: ${err}`)
        electron.ipcRenderer.send("refreshTabWindow")
        window.close() })
})