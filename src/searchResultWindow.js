const electron = require('electron')
var searchresults = electron.remote.getCurrentWindow().searchresults;
const tabnumber = electron.remote.getCurrentWindow().tabnumber;
var thistab = require(`../Tabulars/tab${tabnumber}`);

if (require("../config.json").language === "english") var lang = require("./languages/english.json")
if (require("../config.json").language === "german") var lang = require("./languages/german.json")

document.title = `${lang.searchresults} - Electron Tabular App`

if (Object.keys(searchresults).length < 1) {
    var newlabel = document.createElement("label")
    newlabel.textContent = lang.nosearchresults
    document.getElementById("tabularsectionform").appendChild(newlabel)
    return;
}

var table = document.createElement('table');

//Columns
var tr = document.createElement('tr');                               // tr   = table row
Object.values(thistab["columns"]).forEach((e, i) => {                // tdc  = table data cell
    var tdc = document.createElement('td');                          // text = text for this specific tdc
    var text = document.createTextNode(e);

    tdc.appendChild(text);
    tr.appendChild(tdc);

    table.appendChild(tr);
})

//Data
Object.keys(searchresults).forEach((e) => { //loop through all keys
    if (!isNaN(e)) { //check if this is data and not table information by checking if the key is a number

        var tr = document.createElement('tr'); 

        Object.values(searchresults[e]).forEach((j) => { //loop through all values of the current key (e)
            var td = document.createElement('td');
            var text = document.createTextNode(j);
        
            td.appendChild(text);
            tr.appendChild(td);
        
            table.appendChild(tr);
        })

        //Add edit and remove buttons to Actions td
        var td = document.createElement('td');
        var editbutton = document.createElement("button")
        var removebutton = document.createElement("button")
        var addRowBeneathButton = document.createElement("button")
    
        editbutton.textContent = lang.edit
        editbutton.addEventListener("click", () => {
            electron.ipcRenderer.send('tabEditButtonPress', tabnumber, e)})
        td.appendChild(editbutton)

        addRowBeneathButton.textContent = lang.addrowbeneath
        addRowBeneathButton.addEventListener("click", () => {
            electron.ipcRenderer.send('tabAddRowButtonPress', tabnumber, i + 1) })
        td.appendChild(addRowBeneathButton)
        
        removebutton.textContent = lang.remove
        removebutton.addEventListener("click", () => {
            delete thistab[e];
            delete searchresults[e];
            
            Object.keys(thistab).forEach((k) => {
                if (isNaN(k)) return;
                if (k < e) return;
                delete Object.assign(thistab, {[k - 1]: thistab[k] })[k] //Credit: https://stackoverflow.com/a/50101979/12934162 
            })

            require("fs").writeFile(`./Tabulars/test.json`, JSON.stringify(searchresults, null, 4), err => {
                if (err) return console.log(`error writing delete to file: ${err}`) })

            require("fs").writeFile(`./Tabulars/tab${tabnumber}.json`, JSON.stringify(thistab, null, 4), err => {
                if (err) return console.log(`error writing delete to file: ${err}`)
                electron.remote.getCurrentWindow().reload()
                electron.ipcRenderer.send("refreshTabWindow") })
        })
        td.appendChild(removebutton)

        tr.appendChild(td);
    
        table.appendChild(tr);
    }
})

document.getElementById("tabularsectionform").appendChild(table);