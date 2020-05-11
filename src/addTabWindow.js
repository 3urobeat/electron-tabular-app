const electron = require("electron")

if (require("../config.json").language === "english") var lang = require("./languages/english.json")
if (require("../config.json").language === "german") var lang = require("./languages/german.json")

var lastcolumn = 0;

document.title = `${lang.addtab} - Electron Tabular App`

function addColumnInput() {    
    var addColumnButton = document.createElement("button")
    var columnInput = document.createElement("input")

    addColumnButton.innerText = lang.addColumn
    addColumnButton.id = "addTabAddColumn"

    columnInput.id = lastcolumn

    document.getElementById("inputSection").appendChild(columnInput)
    document.getElementById("inputSection").appendChild(addColumnButton)

    addColumnButton.onclick = function() {
        document.getElementById("inputSection").removeChild(document.getElementById("addTabAddColumn"))
        addColumnInput()
    }

    lastcolumn++
}

addColumnInput()

document.getElementById("addTabSave").addEventListener("click", () => {
    const fs = require('fs');
    var lastnumber = new String();
    var datatowrite = new Object();

    if (!document.querySelector("#tabNameInput").value || !document.querySelector("#tabNameInput").value.replace(/\s/g, '').length) {
        return alert(lang.newTabNameMissing) }
    datatowrite["name"] = document.getElementById("tabNameInput").value

    var inputarr = Array.from(document.getElementById("inputSection").getElementsByTagName("input"))
    console.log(inputarr)
    datatowrite["columns"] = []
    inputarr.forEach((e) => {
        if (!document.getElementById(e.id).value || !document.getElementById(e.id).value.replace(/\s/g, '').length) {
            datatowrite = {} //clear datatowrite
            return alert(lang.newTabInputEmpty)
        }
        datatowrite["columns"].push(document.getElementById(e.id).value) });

    fs.readdirSync("./Tabulars/").forEach(file => {
        lastnumber = file.match(/\d+/)[0] //remove chars from string and save last tabnumber
    });

    fs.writeFile(`./Tabulars/tab${Number(lastnumber) + 1}.json`, JSON.stringify(datatowrite, null, 4), (err) => {
        if (err) console.log("Error writing new tabular data! Error: " + err) 
        window.close() })

    electron.ipcRenderer.send("refreshStartWindow")
})