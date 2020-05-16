const electron = require('electron');
const tabnumber = electron.remote.getCurrentWindow().tabnumber;
var thistab = require(`${electron.remote.app.getAppPath()}/Tabulars/tab${tabnumber}`);
if (require("../config.json").language === "english") var lang = require("./languages/english.json")
if (require("../config.json").language === "german") var lang = require("./languages/german.json")

document.title = `${lang.tabular} ${tabnumber}: ${thistab.name} - Electron Tabular App`

/*----------- Display the table -----------*/
var table = document.createElement('table');

electron.ipcRenderer.on("refreshTabs", () => {
    electron.remote.getCurrentWindow().reload()
})


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
Object.keys(thistab).forEach((e, i) => { //loop through all keys
    if (!isNaN(e)) { //check if this is data and not table information by checking if the key is a number

        var tr = document.createElement('tr'); 

        Object.values(thistab[e]).forEach((j) => { //loop through all values of the current key (e)
            var td = document.createElement('td');
            var text = document.createTextNode(j);
        
            td.appendChild(text);
            tr.appendChild(td);
        
            table.appendChild(tr);
        })

        //Add edit and remove buttons to Actions td
        var td = document.createElement('td');
        var editbutton = document.createElement("button")
        var addRowBeneathButton = document.createElement("button")
        var removebutton = document.createElement("button")
    
        editbutton.textContent = lang.edit
        editbutton.addEventListener("click", () => {
            electron.ipcRenderer.send('tabEditButtonPress', tabnumber, e)})
        td.appendChild(editbutton)

        addRowBeneathButton.textContent = lang.addrowbeneath
        addRowBeneathButton.addEventListener("click", () => {
            console.log(i + 1)
            electron.ipcRenderer.send('tabAddRowButtonPress', tabnumber, i + 1) })
        td.appendChild(addRowBeneathButton)

        removebutton.textContent = lang.remove

        removebutton.addEventListener("click", () => {
            electron.ipcRenderer.send("tabDeleteRow", e, thistab, tabnumber)
        })

        td.appendChild(removebutton)

        tr.appendChild(td);
    
        table.appendChild(tr);
    }
})

document.getElementById("tabularsectionform").appendChild(table);


/*----------- Search stuff -----------*/
//search radio buttons
Object.values(thistab["columns"]).forEach((e) => {
    var radioinput = document.createElement("input")
    var radiolabel = document.createElement("label")
    radioinput.type = "radio" 
    radioinput.name = "columncategory" //give all buttons the same name so that they uncheck each other
    radioinput.value = e
    radiolabel.htmlFor = radioinput //define for which button the label is
    radiolabel.textContent = e
    radiolabel.value = e
    
    document.getElementById("columncategory").appendChild(radioinput)
    document.getElementById("columncategory").appendChild(radiolabel)

    if (radioinput.value == thistab["columns"][0]) radioinput.checked = true //check first radio button to protect search

    radiolabel.addEventListener("click", () => { //check if user clicks label instead of radio button
        radioinput.checked = true
    }) })

//enable search button when typing in searchinput
var searchinput = document.getElementById("searchinput")
var searchbtn = document.getElementById("searchbtn")
searchinput.addEventListener("input", () => {
    if (!document.querySelector("#searchinput").value || !document.querySelector("#searchinput").value.replace(/\s/g, '').length) {
        searchbtn.disabled = true
    } else {
        searchbtn.disabled = false }
})

//search button press
searchbtn.addEventListener("click", () => {
    var checkedradiobtn = document.getElementById("columncategory").elements["columncategory"].value

    var checkedradiobtnid = thistab["columns"].indexOf(checkedradiobtn)
    var searchinputvalue = document.querySelector("#searchinput").value.toLowerCase()
    var searchresults = { }

    Object.keys(thistab).forEach((e) => { //loop through all keys
        if (isNaN(e)) return; //check if this is data and not table information by checking if the key is a number
        var targetkeyvalue = thistab[e][checkedradiobtnid].toLowerCase()

        if (targetkeyvalue.includes(searchinputvalue)) {
            Object.keys(searchresults).push(e)
            searchresults[e] = thistab[e]
        } })

    console.log(searchresults)
    electron.ipcRenderer.send("openSearchResultWindow", tabnumber, searchresults)

})