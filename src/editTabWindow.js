const electron = require('electron')
const tabnumber = electron.remote.BrowserWindow.getFocusedWindow().tabnumber;
var thistab = require(`${electron.remote.app.getAppPath()}/Tabulars/tab${tabnumber}`);

if (require("../config.json").language === "english") var lang = require("./languages/english.json")
if (require("../config.json").language === "german") var lang = require("./languages/german.json")

document.title = `${lang.edittab} - Electron Tabular App`

document.getElementById("editTabNameInput").value = thistab["name"]

//Display input boxes as table to always have correct spacing (more easy you know)
var table = document.createElement('table');
                                                                     // tr   = table row
Object.values(thistab["columns"]).forEach((e, i) => {                // tdc  = table data cell
    var tr = document.createElement('tr');                           // text = text for this specific tdc
    var tdc1 = document.createElement('td');
    var tdc2 = document.createElement('td');     

    var inputbox = document.createElement("input");
    var inputboxlabel = document.createElement("label")

    inputboxlabel.textContent = `${lang.column} ${i}: `
    inputbox.id = e
    inputbox.value = e

    tdc1.appendChild(inputboxlabel);
    tdc2.appendChild(inputbox);

    tr.appendChild(tdc1);
    tr.appendChild(tdc2)

    table.appendChild(tr);
})

document.getElementById('editTabColumnInput').appendChild(table);

/* document.getElementById("editTabAddColumn").addEventListener("click", () => {
    thistab["columns"].push("TEst")
}) */

document.getElementById("editTabSaveBtn").addEventListener("click", () => {
    if (!document.getElementById("editTabNameInput").value || !document.getElementById("editTabNameInput").value.replace(/\s/g, '').length) {
        return alert(lang.editTabNameMissing) 
    } else {
        thistab["name"] = document.getElementById("editTabNameInput").value

        Object.values(thistab["columns"]).forEach((e, i) => {  
            var thisinputvalue = document.getElementById(e).value
    
            if (!thisinputvalue || !thisinputvalue.replace(/\s/g, '').length) {
                return alert(lang.newTabInputEmpty) 
            } else {
                thistab["columns"][i] = thisinputvalue

                if (i + 1 == thistab["columns"].length) {
                    require("fs").writeFile(`${electron.remote.app.getAppPath()}/Tabulars/tab${tabnumber}.json`, JSON.stringify(thistab, null, 4), err => {
                        if (err) return console.log(`error writing new data to file: ${err}`)
                        electron.ipcRenderer.send("refreshTabWindow")
                        electron.ipcRenderer.send("refreshStartWindow") //refresh start window to get new name
                        window.close() })
                }
            }
        }) 
    }
})