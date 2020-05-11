const electron = require('electron')
if (require("../config.json").language === "english") var lang = require("./languages/english.json")
if (require("../config.json").language === "german") var lang = require("./languages/german.json")

document.title = `${lang.start} - Electron Tabular App`

electron.ipcRenderer.on("refreshTabs", () => {
    electron.remote.getCurrentWindow().reload()
})

require('fs').readdir('./Tabulars/', (err, files) => {
    if (err) console.error(err);
    
    var tabulars = files.filter(f => f.split('.').pop() === 'json');
    if (tabulars.length <= 0) { return document.write(lang.notabularsfound) }
    
    tabulars.forEach((e, i) => {
        var tabular = require(`../Tabulars/${e}`);
        var newbutton = document.createElement("button")
        newbutton.textContent = tabular.name
        newbutton.addEventListener("click", () => {
            electron.ipcRenderer.send('tabButtonPress', i + 1)})
        document.body.appendChild(newbutton)
    })
})