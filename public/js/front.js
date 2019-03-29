const DATA_COLORING_ARRAY = [
    ["q", "<code class='simple'>&gt;</code>"],
    ["z", "<code class='simple'>&lt;</code>"],
    ["w", "<code class='simple'><br>\u200B</code>"],
    ["x", "<code class='simple'>&nbsp;</code>"],
    ["!", "<code class='danger'>!</code>"],
    ["+", "<code class='warning'>+</code>"],
    ["-", "<code class='warning'>-</code>"],
    [".", "<code class='primary'>.</code>"],
    [",", "<code class='primary'>,</code>"],
    ["[", "<code class='success'>[</code>"],
    ["]", "<code class='success'>]</code>"]
];
const ELEMENTS = ["div #create-file", "div #save-create", "div #open-file", "#rename-file", "div #save-file","#close-file", "#save-last-file", "#close-last-file", "div #run-button", "div #run-debug-button", "div #run-onebug-button", "#enter-success", "#enter-cansel", "#debug-success", "#onebug-success", "#debug-cansel", "div div #output-show-button", "div #output-close-button", "div #output-clear-button", "div #about-button", "#ok-alert", "body", "#entrance", "#registration", "#entrance-success", "#registration-success", "#exit", "div #save-server-file", "div #open-server-file", "div #delete-server-file", "#ok-file"];
const EVENTS_CLICK = [create, saveCreation, open, rename, save, close, saveLastFile, closeLastFile, runInterpretation, runDebug, runOneBug, enterSuccess, enterCansel, debugSuccess, oneBugSuccess, degusCansel, showOutputButton, closeOutputButton, clearOutputButton, sendAbout, onOkAlert, hideMenu, onEntrance, onRegistration, entranceSuccess, registrationSuccess, onExit, onServerSave, openServerFile, deleteServerFile, onFileChose];

const OPERATIONS = [">", "<", "+", "-", ".", ",", "!", "[", "]"], DEFAULT_FILE_NAME = "new.bf", BITS = 3, TWELVE_BIT_RESTRICTION = 4095, CELLS_QUANTITY = 300;
const FUNCTIONS = [incrementPointer, decrementPointer, incrementValue, decrementValue, outputValue, inputValue, debugData, startCycle, endCycle];

var fileName = DEFAULT_FILE_NAME, lastFileName = DEFAULT_FILE_NAME, isClear, lastFunction;
var idBrainFuck, pointerBrainFuck, arrayBrainFuck, breakBrainFuck, commandsBrainFuck, isDebug, isOneStap;


//Регистрирование событий

jQuery(function($) {

    for (var i = 0; i < ELEMENTS.length; i++) {
        addEvent(ELEMENTS[i], "mousedown" , EVENTS_CLICK[i]);
    }
    addNotClickEvents();
});

function addEvent(element, event, callback) {
    $(element).on(event, callback);
}

function addNotClickEvents() {
    $("#work-space").on("keypress", closeBadSimbols);
    $("#work-space").on("keydown", redirectTabPress);
    $("#enter-data").on("keydown", enterDataCode);
    $("#enter-data-simbol").on("keydown", enterDataSimbol);
    $("#enter-data").on("paste", pasteDataCode);
    $("#enter-data").on("focusout", focusoutDataCode);
    $("#enter-data-simbol").on("paste", pasteDataSimbol);
    $('#open-file-input').on("change", sendFileToServer);
    $('.btn-group button').on("mouseover", viewAllMenu);
    $('.btn-group button').on("mousedown", showMenu);
    document.getElementById('work-space').onpaste = onPaste;
}


// Новые методы объекта String

String.prototype.replaceAllFrom = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.deleteOnnecessary = function(arrayNeeded) {
    var arrayChars = this.split("");
    for (var i = 0; i < arrayChars.length; i++) {
        if(arrayNeeded.indexOf(arrayChars[i]) == -1){
            arrayChars.splice(i--, 1);
        }
    }
    return arrayChars.join("");
};

String.prototype.insertAt = function(index, value) {
    return this.substring(0, index) + value + this.substring(index);
};

String.prototype.countOf = function(substring) {
    return (this.split(substring).length - 1);
};


// Проверки формата

function isGoodFileName(data) {
    return /^[0-9a-zA-Zа-яА-Я.]+$/.test(data);
}

function isNeedExtension(data) {
    return /.{1}(\.bf|\.b){1}$/.test(data);
}

function isBrainFuck(data) {
    return /^[><\+\-\.,\[\]!\s]*$/.test(data);
}

function isInt(string){
    return string.match(/^[-\+]?\d+/) !== null;
}

function isHexInt(string){
    return string.match(/^[-\+]?[0-9a-fA-F]+/) !== null;
}

function isEmail(string){
    return string.match(/^[0-9a-zA-Z]{3,20}@[a-zA-Z]{2,6}\.[a-z]{2,5}$/) !== null;
}


// Обработка событий работы с файлом

function create() {
    if(isSaved(create)){
        isClear = true;
        $('#myModal').modal("show");
    }
}

function isSaved(operation) { 
    if($("#work-space").text() != ""){
        lastFunction = operation;
        $('#saveModal').modal("show");
        return false;
    }
    return true;
}

function saveCreation() {
    var enterFileName = $("#enter-file-name").val();
    if(isGoodFileName(enterFileName)) {
        fileName = enterFileName + (!isNeedExtension(enterFileName) ? ".bf" : "");
        changeFileName();
        if(isClear) $("#work-space").text("");
        cearSaveModal();
    } else {
        $("#error-in-name").text("Введите корректное название!");
    }
}

function changeFileName() {
    $("#file-name").text(fileName);
    $("title").text("BrainFuck Studio 2019 - " + fileName);    
}

function cearSaveModal() {
    $("#error-in-name").text("");
    $("#enter-file-name").val("");
    $('#myModal').modal('hide');
}

function open() {
    if(isSaved(open)){
        $('#open-file-input').click();
    }
}

function rename() {
    isClear = false;
    $("#enter-file-name").val(fileName);
    $('#myModal').modal("show");    
}

function save() {
    var fileToDownload = "data:application/octet-stream;base64, " + btoa($("#work-space").text());
    $("#download-file").attr("download", fileName);
    $("#download-file").attr("href", fileToDownload);
    $("#download-file")[0].click();
}

function close() {
    if(isSaved(close)){
        fileName = DEFAULT_FILE_NAME;
        changeFileName();
        $("#work-space").text("");
    }
}

function saveLastFile() { 
    save();
    clearWorkSpace();
}

function closeLastFile() { 
    clearWorkSpace();
}

function clearWorkSpace() {
    $("#work-space").text("");
    $('#saveModal').modal("hide");
    lastFunction(); 
}

function viewAllMenu(event) {
    var showingMenu = $("div.show");
    var quantity = showingMenu.length;
    if(quantity > 0){
        showingMenu.removeClass("show");
        $(this).parent().children("div.dropdown-menu").addClass("show");
    }
    return false;
}

function showMenu(event) {
    var showingMenu = $(this).parent().children(".dropdown-menu").addClass("show");
    focusLastArea();
    event.stopPropagation();
    event.preventDefault();
}

function focusLastArea() {
    var areaId = $("#work-space:focus, #output-space:focus").attr("id");
    $("#" + areaId).focus();
}

function hideMenu(event) {
    var showingMenu = $(".btn-group div.show").removeClass("show");
}


// Работа с BrainFuck

function closeBadSimbols(event) {
    var interval = getSelectedRange(document.getElementById('work-space')); 
    var isRemove = isNeedRemove(event.which, event.charCode, interval);
    event.preventDefault();
    if(isBrainFuck(String.fromCharCode(event.which)) || isRemove){
        var position = getCursorPosition("#work-space");
        position = event.which == 9 ? position + 3 : position;
        createBackLite(false);
        choseInsertSimbol(event.which, position, isRemove, interval);
        createBackLite(true);
        moveCursor("work-space", shiftPosition(position, isRemove, event.which == 8, interval));
    }
}

function isNeedRemove(keyKode, charCode, interval) {
    if(interval.start == 0 && keyKode == 8 && interval.length == 0) {
        return false;
    }
    return (keyKode == 8 || keyKode == 46) && (charCode == undefined) ? true : false;
}

function shiftPosition(position, isRemove, isLeftShift, interval) {
    if(interval.length > 0){
        return isRemove ? interval.start-1 : interval.start;
    }
    if(isRemove ){
        if(isLeftShift){
            return position - 2;
        } else {
            return position - 1;
        }
    }
    return position ;
}

function getSelectedRange(element) { 
    var start = 0, end = 0, sel, range, priorRange; 
    range = window.getSelection().getRangeAt(0); 
    priorRange = range.cloneRange(); 
    priorRange.selectNodeContents(element); 
    priorRange.setEnd(range.startContainer, range.startOffset); 
    start = priorRange.toString().length; 
    end = start + range.toString().length; 
    return { start: start, end: end, length: end - start }; 
}

function redirectTabPress(event) {
    if(event.which == 9){
        event.preventDefault();
        for (var i = 0; i < 4; i++) {
            triggerEvent("keypress", "#work-space", 32) ;
        }
    }
    if(event.which == 8 ) {
        event.preventDefault();
        triggerEvent("keypress", "#work-space", 8);
    }
    if(event.which == 46) {
        event.preventDefault();
        triggerEvent("keypress", "#work-space", 46);
    }
}

function triggerEvent(event = "keypress", element = "#work-space", keyKode = 9) {
    var press = jQuery.Event(event); 
    press.ctrlKey = false;
    press.which = keyKode;
    press.which = keyKode;
    $(element).trigger(press);
}

function getCursorPosition(element) {
    var range = window.getSelection().getRangeAt(0)
    var charCount = 0, treeWalker = createTreeWalker(range, element);
    while (treeWalker.nextNode()) {
        charCount += treeWalker.currentNode.length;
    }
    return charCount + (range.startContainer.nodeType == 3 ? range.startOffset : 0);
}


function createTreeWalker(range, element) {
    var node = $(element).get(0);
    return document.createTreeWalker(node, NodeFilter.SHOW_TEXT, createNewRange(node, range), false);
}

function createNewRange (node, range) {
    return function(node) {
        var nodeRange = document.createRange();
        nodeRange.selectNode(node);
        return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1 ?
            NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
}

function choseInsertSimbol(eventWhick, position, isRemove, interval) {
    position = checkClearing(interval, "#work-space", "");
    if(isRemove){
        deleteHTML(eventWhick == 8, position, interval);
    } else {
        simbol = prepareSimbol(eventWhick);
        insertHTML(simbol, "#work-space", position) ;
    }
}

function checkClearing(interval, selector, newValue) {
    if(interval.end != interval.start){
        updateText(interval, selector, newValue);
    }
    return interval.start;
}

function updateText(interval, selector, newValue) {
    var htmlText = replaceSpecialSimbols($(selector).html());
    htmlText = $(selector).html(htmlText);
    htmlText = $(selector).text();
    var result = htmlText.slice(0, interval.start) + newValue + htmlText.slice(interval.end);
    $(selector).html(result);
}


function prepareSimbol(eventWhick) {
    var simbol = String.fromCharCode(eventWhick);
    switch(eventWhick){
        case 60:  return "z";
        case 62:  return "q";
        case 13:  return "w";
        case 32:  return "x";
        default:  return simbol;
    }
}

function insertHTML(simbol, selector, position) {
    prepareResult("#work-space", position, 0, 0, simbol);
}

function deleteHTML(isDeleteLeft, position, interval) {
    var leftId = isDeleteLeft ? 1 : 0;
    var rightId = isDeleteLeft ? 0 : 1;
    if(interval.length != 0) {
        prepareResult("#work-space", position, 0, 0, "");
    } else {
        prepareResult("#work-space", position, leftId, rightId, "");
    }
}


function prepareResult(selector, position, leftId, rightId, innerSimbol) {
    var htmlText = replaceSpecialSimbols($(selector).html());
    htmlText = $(selector).html(htmlText);
    htmlText = $(selector).text();
    var result = htmlText.slice(0, position-leftId) + innerSimbol + htmlText.slice(position + rightId);
    $(selector).html(result);
}

function replaceSpecialSimbols(text) {
    const SIMBOLS_ARRAY = [["&gt;", "q"], ["&lt;", "z"], ["<br>\u200B", "w"], ["&nbsp;", "x"]];
    for (var i = 0; i < SIMBOLS_ARRAY.length; i++) {
        text = text.replaceAllFrom(SIMBOLS_ARRAY[i][0], SIMBOLS_ARRAY[i][1])
    }
    return text;
}

function getCountX(string, position) {
    var count = 0, newString = string.slice(0, position);
    for (var i = position; newString[i-1] == "x"; i--) {
        count++;
    }
    return count;
}

function createBackLite(isToColor) {
    var text = replace($("#work-space").html(), isToColor);
    $("#work-space").html(text);
}

function replace(text, isToColor) {
    var firstID = isToColor ? 0 : 1, secondID = isToColor ? 1 : 0;
    for (var i = 0; i < DATA_COLORING_ARRAY.length; i++) {
         text = text.replaceAllFrom(DATA_COLORING_ARRAY[i][firstID], DATA_COLORING_ARRAY[i][secondID]);
    }
    return text;
}

function moveCursor(selector, position) {
    if(document.getElementById(selector).innerHTML.length > 0) {
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(document.getElementById(selector), position + 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function sendFileToServer() {
    var lastFileName = fileName;
    fileName = $('#open-file-input').val().split('\\').reverse()[0];
    if(isNeedExtension(fileName)) {
        createAjaxRequest();
    } else {
        fileName = lastFileName;
        runAlert("Не верное расширение файла!");
    }
}

function createAjaxRequest() {
    $.ajax({
        url: "/readFile",
        method: "post",
        contentType: false, 
        processData: false,
        data: new FormData($("#my-form").get(0)),
        success: checkFile
    });
}

function checkFile(fileData) {
    if(isBrainFuck(fileData)) {
        $("#work-space").text(replaceOuterData(fileData));
        createBackLite(true);
    } else {
        fileName = lastFileName;
        runAlert("В файле содержатется недопустимая информация!");
    }
    changeFileName();
}

function replaceOuterData(text) {
    return replaceSpecialSimbols(replaceChars(text));
}

function onPaste(event) {
    var interval = getSelectedRange(document.getElementById('work-space'));
    var paste = (event.clipboardData || window.clipboardData).getData('text');
    paste = replaceOuterData(paste.deleteOnnecessary("><+-.,[]!"));
    updateText(interval, "#work-space", paste + "");
    createBackLite(true);
    moveCursor("work-space",  paste.length-1 + interval.start); 
    return false;
}

function prepareInjectText(lastText, paste, position) {
    return replace(lastText.substring(0, position) + paste + lastText.substring(position), true)
}


// Работа с BrainFuck

function runInterpretation() {
    runProgramm(false, false);

}

function runDebug() {
    runProgramm(true, false);
}

function runOneBug() {
    runProgramm(true, true);
}

function runProgramm(isNeededDebug, isHardDebug) {
    resetInterpretation(isNeededDebug, isHardDebug);
    showOutputButton();
    commandsBrainFuck = replace($("#work-space").text(), false).split("");
    preCheckingCode();
}

function resetInterpretation(isNeededDebug, isHardDebug) {
    idBrainFuck = 0;
    pointerBrainFuck = 0;
    arrayBrainFuck = generateArray(); 
    breakBrainFuck = 0;
    isDebug = isNeededDebug;
    isOneStap = isHardDebug;
}

function generateArray() {
    var array = [];
    for (var i = 0; i < CELLS_QUANTITY; i++) {
        array.push(0);
    }
    return array;
}

function preCheckingCode() {
    var cycleArray = commandsBrainFuck.join("").deleteOnnecessary("[]").split("");
    if(deleteRangeCycle(cycleArray) == ""){
        parse();
    } else {
        printOutput("Ошибка! Есть незакрытые циклы!" + "\n");
    }
}

function deleteRangeCycle(cycleArray) {
    do {
        var counter = 0;
        for (var i = 0; i < cycleArray.length; i++) {
            if((cycleArray[i] + cycleArray[i+1]) == "[]"){
                cycleArray.splice(i, 2);
                counter++;
                i--;
            }
        }
    } while(counter != 0);
    return cycleArray;
}

function parse(){
    for (; idBrainFuck < commandsBrainFuck.length; idBrainFuck++) {
        for (var i = 0; i < OPERATIONS.length; i++) {
            if (commandsBrainFuck[idBrainFuck] == OPERATIONS[i]){
                if((answer = FUNCTIONS[i]()) != "") {
                    printOutput(answer + "\n");
                    return "";
                } 
                if(i == 5 || (i == 6 && isDebug && !isOneStap)) return "";
                if(isOneStap && i != 6) {
                    stopRunning();
                    return "";
                }
            }
        }
    } 
}

function printOutput(text) {
    $("#output-space").val($("#output-space").val()  + text);
    toggleElement ("div #output-clear-button", false);
}

function incrementPointer() {
    if(pointerBrainFuck + 1 < CELLS_QUANTITY) {
        pointerBrainFuck++;
        return "";
    } else return "Ошибка! указатель вышел за лимит " + CELLS_QUANTITY + "!";
}

function decrementPointer() {
    if(pointerBrainFuck - 1 >= 0) {
        pointerBrainFuck--;
        return "";
    } else return "Ошибка! указатель вышел за лимит 0!";
}

function incrementValue() {
    if(arrayBrainFuck[pointerBrainFuck] + 1 < TWELVE_BIT_RESTRICTION) {
        arrayBrainFuck[pointerBrainFuck]++;
        return "";
    } else return "Ошибка! значение вышло за лимит " + TWELVE_BIT_RESTRICTION + " !";
}

function decrementValue() {
    if(arrayBrainFuck[pointerBrainFuck] - 1 >= 0) {
        arrayBrainFuck[pointerBrainFuck]--;
        return "";
    } else return "Ошибка! значение вышло за лимит 0!";
}

function outputValue() {
    var value = String.fromCharCode(arrayBrainFuck[pointerBrainFuck]) ;
    printOutput(value);
    return "";
}

function inputValue() {
    inputData();
    return "";
}

function debugData() {
    if (isDebug && !isOneStap){
        stopRunning();
    } 
    return "";
}

function startCycle() {
    var countOperation = 0;
    if (arrayBrainFuck[pointerBrainFuck] == 0) {
        while (++breakBrainFuck != 0) {
            ++idBrainFuck;
            if (commandsBrainFuck[idBrainFuck] == '[') breakBrainFuck++;
            if (commandsBrainFuck[idBrainFuck] == ']')  breakBrainFuck--;
            if(++countOperation == 1000) return "Ошибка, цикл зациклен!";
        }
    }
    return "";
}

function endCycle() {
    var countOperation = 0;
    if (arrayBrainFuck[pointerBrainFuck] != 0){
        if (commandsBrainFuck[idBrainFuck] == ']') breakBrainFuck++;
        while (breakBrainFuck != 0) {
            idBrainFuck--;
            if (commandsBrainFuck[idBrainFuck] == '[') breakBrainFuck--;
            if (commandsBrainFuck[idBrainFuck] == ']') breakBrainFuck++;
            if(++countOperation == 1000) return "Ошибка, цикл зациклен!";
        }
        --idBrainFuck;
    }
    return "";
}

function inputData() {
    setTimeout(function(){
        showModal("#enterData", 'static');
    }, 500);
}

 function showModal(modalID, isBackdrop) {
    $(modalID).modal( {"backdrop": isBackdrop, "show": false} );
    $(modalID).modal('show');
 }

function stopRunning() {
    addTable();
    addInputEvents();
    setTimeout(function(){
        showModal("#current-debug", 'static');
    }, 500);
}

function addTable() {
    for (var i = 0; i < arrayBrainFuck.length; i+=10) {
        var pointer = i != pointerBrainFuck ? "" : "<==";
        addOneRow(i, pointer);

    }
}


function addOneRow(id, isPointer) {
    var tr = $("<tr>", {id: "tr" + addingZero(id)});
    tr.append( addIndexColumn(addingZero(id)) );
    tr = addOneColumn(id, tr);
    tr.append(addTextColumn(id));
    $("#debugging tbody").eq(0).append(tr);
}

function addIndexColumn(value) {
    var input = createInput(0, value);
    return $("<td>", {}).append(input);
}

function addTextColumn(id) {
    var value = "";
    for (var i = id; i < id+10; i++) {
        value += String.fromCharCode(arrayBrainFuck[i]);
    }
    var input = createInput(1, value);
    input.addClass ("onText");
    return $("<td>", {}).append(input);
}

function addOneColumn(id, tr) {
    for (var i = id; i < id+10; i++) {
        var currentColumn = $("<td>", {id: "td" + (i - id)});

        var dex = arrayBrainFuck[i];
        var inputDex = createInput(1, dex);
        inputDex.addClass("onDex");

        var hex = toHex(arrayBrainFuck[i]);
        var inputHex = createInput(1, hex);
        inputHex.addClass("onHex"); 


        currentColumn.append(inputDex);
        currentColumn.append(inputHex);
        tr.append(currentColumn);
    }
    return tr;
}

function createInput(index, value) {
    return $("<input>", {
        disabled: (index == 0 ? true : false),
        type : "text",
        value : value,
        class : "form-control",
    });
}

function toHex(number) {
    var hexString = Number(number).toString(16).toUpperCase(), zero = "";
    for (var i = 0; i < BITS-hexString.length; i++) {
        zero += "0";
    }
    return zero + hexString;
}

function addInputEvents() {
    var dex = $(".onDex"), hex = $(".onHex"), text = $(".onText"), pointer = $(".pointer");
    for (var i = 0; i < dex.length; i++) {
        dex.eq(i).on("keydown", onDexKeyDown);
        hex.eq(i).on("keydown", onHexKeyDown);
        text.eq(i).on("keyup", onTextKeUp);
        text.eq(i).on("focusout", onTextFocusout);
        pointer.eq(i).on("click", onPointerClick);
    }
}

function onDexKeyDown(event){
    onIntKeyDown(this, event, isInt, 10);
    return false;
}

function onHexKeyDown(event) {
    onIntKeyDown(this,event, isHexInt, 16);
    return false;
}  


function onTextFocusout(event) {
    var currentValue = $(this).val();
    currentValue = currentValue.substring(0, 10);
    $(this).val(toTenZero(currentValue));
}

function onTextKeUp(event) {
    var currnetText = $(this).val();
    var id =  Number($(this).parent().parent().attr("id").replace("tr", ""));
    for (var i = id; i < id+10; i++) {
        var currentCode = currnetText.length > i-id ? currnetText[i-id].charCodeAt().toString() : 0;
        arrayBrainFuck[i] = currentCode;
        $(this).parent().parent().children("#td" + i).eq(0).children().eq(0).val(currentCode);
        $(this).parent().parent().children("#td" + i).eq(0).children().eq(1).val(toHex(currentCode));
    }

}

function toTenZero(text) {
    var zero = ""
    for (var i = 0; i < 10-text.length; i++) {
        zero += String.fromCharCode(0);
    }
    return zero + text;
}

function onIntKeyDown(thisElement, event, isSomethingInt, numberSystem) {
    var value = String.fromCharCode(event.which);
    var position = $(thisElement)[0].selectionStart;
    if(event.which == 8) {
        deleteLeftSimbol(thisElement, numberSystem, position, value);
    } else if(event.which == 46) {
        deleteRightSimbol(thisElement, numberSystem, position, value);
    } else {
        changeIfIsInt(isSomethingInt, thisElement, numberSystem, position, value, event);
    }
}

function deleteLeftSimbol(thisElement, numberSystem, position, value) {
    var newValue;
    if (position == 1  && numberSystem != 16) newValue = "0";
    else newValue = $(thisElement).val().substring(0, position-1) + $(thisElement).val().substring(position);
    position -= numberSystem == 16 ? 0 : 1;
    startCheckValues(thisElement, numberSystem, position,  newValue);
}

function deleteRightSimbol(thisElement, numberSystem, position, value) {
    var newValue;
    if (position == 0 && $(thisElement).val().length == 1) newValue = "0"; 
    else newValue = $(thisElement).val().substring(0, position) + $(thisElement).val().substring(position+1);
    position -= numberSystem == 16 ? -1 : 0;
    startCheckValues(thisElement, numberSystem, position,  newValue);
}


function changeIfIsInt(isSomethingInt, thisElement, numberSystem, position, value, event) {
    if(!isSomethingInt(value)){
        value = "";
        position = checkPosition(event.which, position);
    }
    var newValue = $(thisElement).val().insertAt(position, value); 
    if(numberSystem == 16) {
        newValue.substring(-1); 
    }
    startCheckValues(thisElement, numberSystem,  position + 1, newValue)
}

function checkPosition(key, position) {
    if(key == 37 && position != 0) position--;
    if(key == 39) position++;
    return --position;
}


function startCheckValues(thisElement, numberSystem, position,  newValue) {
    checkCurrentValue(thisElement, Number.parseInt(newValue, numberSystem));
    $(thisElement)[0].selectionStart = $(thisElement)[0].selectionEnd = position;
}

function checkCurrentValue(thisElement, newValue) {
    if(newValue >= 0 && newValue <= TWELVE_BIT_RESTRICTION) {
        var parent = $(thisElement).parent().parent();
        var id = Number(parent.attr("id").replace("tr", ""));
        var currentId = $(thisElement).parent().attr("id").replace("td", "");//.id()
        arrayBrainFuck[id + Number(currentId)] = newValue;
        parent.children("#td" + currentId).eq(0).children().eq(0).val(newValue);
        parent.children("#td" + currentId).eq(0).children().eq(1).val(toHex(newValue));
        changeText(parent, newValue, id, Number(currentId));
    } 
}

function changeText(parent, changedSimbolCode, startId, id,) {
    var text = "";
    for (var i = startId; i < startId+10; i++) {
        text += String.fromCharCode(arrayBrainFuck[i]);
    }
    parent.children().eq(-1).children(".onText").val(text);
}

function enterSuccess() {
    var userData = checkData($("#enter-data").val());
    if(userData !== null){
        enterCansel();
        arrayBrainFuck[pointerBrainFuck] = userData;
        if(isOneStap) stopRunning();
        else {
            idBrainFuck++;
            preCheckingCode();
        }
    }
}

function onDexFocusout (event) {
    if($(this).val() == ""){
        addDefaultValue(this, "0"); 
    } 
}

function onHexFocusout (event) {
    var correctValue = $(this).val();
    for (var i = 0; i < BITS-$(this).val().length; i++) {
        correctValue = "0" + correctValue;
    }
    addDefaultValue(this, Number.parseInt(correctValue, 16)); 
}

function onPointerClick(event) {
    var allPointerCells = $("tr td .pointer");
    allPointerCells.val("");
    pointerBrainFuck = $(this).parent().parent().attr("id").replace("tr", "");
    $(this).val("<==")
}

function addDefaultValue(thisElement, defaultValue) {
    var thisRow = $(thisElement).parent().parent().children();
    thisRow.eq(1).children().eq(0).val(defaultValue);
    thisRow.eq(2).children().eq(0).val(toHex(defaultValue));
}

function enterCansel() {
    $("#enterData").modal("hide");
    $("#enter-data").val("48");
    $("#enter-data-simbol").val("0");
}

function toggleElement(element, isShow) {
    if(isShow) {
        $(element).attr("disabled", true);
        $(element).addClass("disabled");
    } else {
        $(element).removeAttr("disabled");
        $(element).removeClass("disabled");
    }
}

function managementOutputMenu(isShow) {
    toggleElement("div #output-show-button", isShow);
    toggleElement("div #output-close-button", !isShow);
    toggleElement("div #output-clear-button", !isShow);
}

function showOutputButton() {
    managementOutputMenu(true);
    $(".output").css( {"display": "block", "position": "absolute"} );
    $(".first-space").css({"height":"55%"});
}

function closeOutputButton() {
    managementOutputMenu(false);
    $(".output").css({"display":"none"});
    $(".first-space").css({"height":"75%"});
}

function clearOutputButton() {
    $("div #output-space").val("");
    toggleElement ("div #output-clear-button", true);
}

function checkData(string) {
    if(isInt(string)){ 
        var integerAnswer = Number.parseInt(string);
        return integerAnswer < 0 || integerAnswer > TWELVE_BIT_RESTRICTION ? null : integerAnswer;

    } else {
        return null;
    }
}

function debugSuccess() {
    clearDebugModal();
    idBrainFuck++;
    isOneStap = false;
    preCheckingCode();
}

function oneBugSuccess() {
    clearDebugModal();
    idBrainFuck++;
    isOneStap = true;
    preCheckingCode();
}

function degusCansel() {
    clearDebugModal();
}

function clearDebugModal() {
    clearTable();
    $("#current-debug").modal("hide");
}

function clearTable(){
    $("#debugging tbody tr").remove();
}

function sendAbout(event) {
    runAlert("©BrainFuck Studio 2019-" + (new Date()).getFullYear() + ". Все права защищены! ");
    var properties =  {
        "href" : "https://vk.com/forever_best_in_the_world", 
        "target" : "_blank",
        "class" : "text-danger"
    }
    $("#alert-text").append($("<a>", properties).text("СОЗДАТЕЛЬ!"));
}

function runAlert(text) {
    $("#alert-text").text(text);
    showModal("#alertModal", true);
}

function onOkAlert(argument) {
    $("#alertModal").modal('hide');
}

function addingZero(number) {
    var answer = Number(number).toString();
    while (answer.length < 4) {
        answer = "0" + answer;
    }
    return answer;
}

function enterDataCode(event) {
    var newValue = String.fromCharCode(event.which);
    if(newValue >= 0 && newValue <= 9) {
        var position = getCaret($(this)[0]);
        var newText = $(this).val().substring(0, position) + newValue + $(this).val().substring(position);
        if(newText <= TWELVE_BIT_RESTRICTION){
            $(this).parent().children("#enter-data-simbol").val(String.fromCharCode(newText));
            return true;
        }
    }
    return [8, 46, 37, 38, 39, 40].indexOf(event.which) != -1 || event.ctrlKey ? true : false;   
}

function getCaret(el) { 
  if (el.selectionStart) { 
    return el.selectionStart; 
  } else if (document.selection) { 
    el.focus(); 

    var r = document.selection.createRange(); 
    if (r == null) { 
      return 0; 
    } 

    var re = el.createTextRange(), rc = re.duplicate(); 
    re.moveToBookmark(r.getBookmark()); 
    rc.setEndPoint('EndToStart', re); 
    return rc.text.length; 
  }  
  return 0; 
}

function enterDataSimbol(event) {
    if([37, 38, 39, 40].indexOf(event.which) == -1 && !event.ctrlKey) {
        $(this).val(String.fromCharCode(event.which));
        $(this).parent().children("#enter-data").val(event.which);
        return false;
    } else return true; 
}

function pasteDataCode(event) {
    var position = getCaret($(this)[0]);
    var newValue = event.originalEvent.clipboardData.getData('text');
    var newText = $(this).val();
    newText = newText.substring(0, position) + newValue + newText.substring(position);

    if(newText <= TWELVE_BIT_RESTRICTION){
        $(this).parent().children("#enter-data-simbol").val(String.fromCharCode(newText));
        return true;
    }
    return false;  
}

function pasteDataSimbol(event) {
    var newSimbol = event.originalEvent.clipboardData.getData('text')[0];
    $(this).val(newSimbol);
    $(this).parent().children("#enter-data").val(newSimbol.charCodeAt().toString());
    return false;
}

function focusoutDataCode(event) {
    if($(this).val() == "") {
        $(this).val(0);
    } else {
        $(this).val(Number($(this).val()));
    }
    $(this).parent().children("#enter-data-simbol").val(String.fromCharCode($(this).val()));
}

function onEntrance() {
    $("#entrance-error").text("");
    showModal("#entranceInApp", true);
}

function onRegistration() {
    $("#registration-error").text("");
    showModal("#registrationInApp", true);
}


function entranceSuccess(data){
    $("#entrance-error").text("");
    var mail = $("#entrance-mail").val();
    var password = $("#entrance-password").val();
    if(password.length >= 5 && isEmail(mail)){
        createEntranceAjax("/get", "mail=" + mail + "&password=" + password, onEntranceAjax);
    } else {
        $("#entrance-error").text("Некорректные почта и\\или пароль!");
    }
}

function createEntranceAjax(path, data, funSucces) {
    $.ajax({
        url: path,
        method: "get",
        contentType: false, 
        processData: false,
        data: data,
        success: funSucces
    });
}

function onEntranceAjax(data) {
    onAuth(data, "Почта и\\или пароль не существуют!", "#entranceInApp", "#entrance-error");
}

function registrationSuccess(data){
    $("#registratuion-error").text("");
    var mail = $("#registration-mail").val();
    var login = $("#registration-login").val();
    var password = $("#registration-password").val();
    if(password.length >= 5 && login.length >= 5 && isEmail(mail)){
        createEntranceAjax("/add", "mail=" + mail + "&password=" + password + "&login=" + login, onRegistrationAjax);
    } else {
        $("#registration-error").text("Некорректные почта и\\или пароль!");
    }

}

function onRegistrationAjax(data) {
    onAuth(data, "Данная почта уже занята!", "#registrationInApp", "#registration-error");
}

function onAuth(data, message, id, errorId) {
    if(data.answer == null){
        $(".no-auth").css({display: "none"});
        $(".auth").css({display: "block"});
        $(".auth button").text(data.login);
        enableButtons(true);
        $(id).modal("hide");
    } else {
        $(errorId).text(message);
    }
}


function enableButtons(isRemove) {
    var arrayId = ["div #open-server-file", "div #save-server-file", "div #delete-server-file"];
    for (var i = 0; i < arrayId.length; i++) {
        if(isRemove){
            $(arrayId[i]).removeClass("disabled");
            $(arrayId[i]).removeAttr("disabled");
        } else {
            $(arrayId[i]).addClass("disabled");
            $(arrayId[i]).attr("disabled", true);
        }
    }
    // $("div #save-server-file").removeClass("disabled");
    // $("div #delete-server-file").removeClass("disabled");
    // $("div #open-server-file").removeAttr("disabled");
    // $("div #save-server-file").removeAttr("disabled");
    // $("div #delete-server-file").removeAttr("disabled");
}

function onExit(event) {
    $(".no-auth").css({display: "block"});
    $(".auth").css({display: "none"});
    $(".auth button").text("<Пользователь>");
    enableButtons(false);
    $.ajax({
        url: "/close",
        method: "get",
        contentType: false, 
        processData: false,
        data: ""
    });
}

function onServerSave(event) {
    $.ajax({
        url: "/save",
        method: "get",
        contentType: false, 
        processData: false,
        data: "name=" + fileName + "&data=" +  $("#work-space").text()
    });
}

function openServerFile(event) {   
    getFileAjax(showFileListOpen);
}

function deleteServerFile(event) {  
    getFileAjax(showFileListDelete);
}

function getFileAjax(functionGet) {
    $.ajax({
        url: "/filelist",
        method: "get",
        contentType: false, 
        processData: false,
        data: "",
        success: functionGet
    });
}

function showFileListOpen(data) {
    showFileList(data, "Выберите файл для открытия:", "Открыть");
}

function showFileListDelete(data) {
    showFileList(data, "Выберите файл для удаления:", "Удалить");
}

function showFileList(data, message, buttonName) {
    $("#chose-file").text(message);
    $("#ok-file").text(buttonName);
    var selection = $("#file-select").empty();
    if(data.files != null) {
        for (var i = 0; i < data.files.length; i++) {
            selection.append($("<option>", {"text": data.files[i]}));
        }
    }
    showModal("#showFileLish", true);
}

function onFileChose(event) {
    var selectedName = $("#file-select :selected").text();
    if(selectedName != "") {
        if($(this).text() == "Открыть") {
            createAjaxChange(selectedName, "/openfile", onOpenServerFile);
        } else {
            createAjaxChange(selectedName, "/removefile", function () {});
        }
    }
    $("#showFileLish").modal("hide");
}

function createAjaxChange(name, path, functionSuccess) {
    $.ajax({
        url: path,
        method: "get",
        contentType: false, 
        processData: false,
        data: "name=" + name,
        success: functionSuccess
    });
}

function onOpenServerFile(data) {
    $("#work-space").html(replace(replaceSpecialSimbols(replaceChars(data.data)), true));
    fileName = data.filename;
    changeFileName();
}

function replaceChars(text) {
    return text.replaceAllFrom("<", "&lt;").replaceAllFrom(">", "&gt;");
}
