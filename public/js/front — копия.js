const DATA_COLORING_ARRAY = [
    ["q", "<code class='simple'>></code>"],
    ["z", "<code class='simple'><</code>"],
    ["!", "<code class='success'>!</code>"],
    ["+", "<code class='warning'>+</code>"],
    ["-", "<code class='warning'>-</code>"],
    [".", "<code class='primary'>.</code>"],
    [",", "<code class='primary'>,</code>"],
    ["[", "<code class='danger'>[</code>"],
    ["]", "<code class='danger'>]</code>"]
];
const OPERATIONS = [">", "<", "+", "-", ".", ",", "!", "[", "]"];
const FUNCTIONS = [incrementPointer, decrementPointer, incrementValue, decrementValue, outputValue, inputValue,
    debugData, startCycle, endCycle];
const DEFAULT_FILE_NAME = "file.bf";
var fileName = DEFAULT_FILE_NAME, lastFileName, isClear, lastFunction;
var idBrainFuck, pointerBrainFuck, arrayBrainFuck, breakBrainFuck, commandsBrainFuck, isDebug;


//Регистрирование событий

jQuery(function($) {
    const ELEMENTS = ["#create-file", "#save-create", "#open-file", "#rename-file", "#save-file","#close-file", "#save-last-file", "#close-last-file", "#run-button", "#run-debug-button", "#enter-success", "#enter-cansel", "#debug-success", "#debug-cansel", "#output-close-button", "#output-clear-button"];
    const FUNCTIONS = [create, saveCreation, open, rename, save, close, saveLastFile, closeLastFile, runInterpretation, runDebug, enterSuccess, enterCansel, degusSuccess, degusCansel, outputCloseButton, outputClearButton]
    for (var i = 0; i < ELEMENTS.length; i++) {
        addEvent(ELEMENTS[i], "click" ,FUNCTIONS[i]);
    }
    addNotClickEvents();
});

function addEvent(element, event, callback) {
    $(element).on(event, callback);
}

function addNotClickEvents() {
    $("#work-space").on("keypress", closeBadSimbols);
    $('#open-file-input').on("change", sendFileToServer);
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


// Проверки формата

function isGoodFileName(data) {
    return /^[0-9a-zA-Zа-яА-Я.]+$/.test(data);
}

function isNeedExtension(data) {
    return /.+(\.bf|\.b)$/.test(data);
}

function isBrainFuck(data) {
    return /^[><\+\-\.,\[\]!]*$/.test(data);
}

// Обработка событий работы с файлом

function create() {
    if(isSaved(create)){
        isClear = true;
        $('#myModal').modal("show");
    }
}

function isSaved(operation) { 
    if($("#work-space").val() != ""){
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
        $("#file-name").text(fileName);
        if(isClear) $("#work-space").text("");
        cearSaveModal();
    } else {
        $("#error-in-name").text("Введите корректное название!");
    }
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
    var fileToDownload = "data:application/octet-stream;base64, " + btoa($("#work-space").val());
    $("#download-file").attr("download", fileName);
    $("#download-file").attr("href", fileToDownload);
    $("#download-file")[0].click();
}

function close() {
    if(isSaved(close)){
        fileName = DEFAULT_FILE_NAME;
        $("#file-name").text(fileName);
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
    $("#work-space").val("");
    $('#saveModal').modal("hide");
    lastFunction(); 
}


// Работа с BrainFuck

function closeBadSimbols(event) {
    event.preventDefault();
    if(isBrainFuck(String.fromCharCode(event.which))){
        var position = getCursorPosition();
        createBackLite(false);
        choseInsertSimbol(event.which, position);
        createBackLite(true);
        moveCursor("work-space", position);
    }
}

function getCursorPosition() {
    var range = window.getSelection().getRangeAt(0)
    var charCount = 0, treeWalker = createTreeWalker(range);
    while (treeWalker.nextNode()) {
        charCount += treeWalker.currentNode.length;
    }
    return charCount + (range.startContainer.nodeType == 3 ? range.startOffset : 0);
}


function createTreeWalker(range) {
    var node = document.getElementById("work-space");
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

function choseInsertSimbol(eventWhick, position) {
    var simbol = eventWhick == "60" ? "z" : (eventWhick == "62"  ? "q" : String.fromCharCode(eventWhick));

    insertHTML(simbol, "#work-space", position) ;
}

function insertHTML(text, selector, position) {
    var htmlText = $(selector).html();
    htmlText = htmlText.replaceAllFrom("&gt;", "q").replaceAllFrom("&lt;", "z");
    var result = htmlText.slice(0, position) + text + htmlText.slice(position);
    $(selector).html(result);
}

function createBackLite(isToColor) {
    var text = replace($("#work-space").text(), isToColor);
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
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(document.getElementById(selector), position + 1);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}

function sendFileToServer() {
    var lastFileName = fileName;
    fileName = $('#open-file-input').val().split('\\').reverse()[0];
    if(isNeedExtension(fileName)) {
        createAjaxRequest();
    } else {
        fileName = lastFileName;
        alert("Не верное расширение!");
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
        $("#work-space").text(fileData);
        createBackLite(true);
    } else {
        fileName = lastFileName;
        alert("В файле содержатся недопустимые символы!");
    }
    $("#file-name").text(fileName);
}

function onPaste(event) {
    var paste = (event.clipboardData || window.clipboardData).getData('text');
    paste = paste.deleteOnnecessary("><+-.,[]!");
    $("#work-space").html($("#work-space").html() + replace(paste, true));
    return false;
}


// Работа с BrainFuck

function runInterpretation() {
    runProgramm(false);

}

function runDebug() {
    runProgramm(true);
}

function runProgramm(isNeededDebug) {
    resetInterpretation(isNeededDebug);
    $(".output").css( {"display": "block"} );
    commandsBrainFuck = replace($("#work-space").text(), false).split("");
    parse();
}

function resetInterpretation(isNeededDebug) {
    idBrainFuck = 0;
    pointerBrainFuck = 0;
    arrayBrainFuck = generateArray(); 
    breakBrainFuck = 0;
    isDebug = isNeededDebug;
}

function generateArray() {
    var array = [];
    for (var i = 0; i < 30000; i++) {
        array.push(0);
    }
    return array;
}


function parse(){
    for (; idBrainFuck < commandsBrainFuck.length; idBrainFuck++) {
        for (var i = 0; i < OPERATIONS.length; i++) {
            if (commandsBrainFuck[idBrainFuck] == OPERATIONS[i]){
                FUNCTIONS[i]();
                if(i == 5 || i == 6) return;
                else break;
            }
        }
    } 
}

function incrementPointer() {
    pointerBrainFuck++;
}

function decrementPointer() {
    pointerBrainFuck--;
}

function incrementValue() {
    arrayBrainFuck[pointerBrainFuck]++;
}

function decrementValue() {
    arrayBrainFuck[pointerBrainFuck]--;
}

function outputValue() {
    addPrint( String.fromCharCode(arrayBrainFuck[pointerBrainFuck]) );
}

function inputValue() {
    inputData();
}

function debugData() {
    if (isDebug){
        stopRunning();
    }
}

function startCycle() {
    if (arrayBrainFuck[pointerBrainFuck] == 0) {
        while (++breakBrainFuck != 0) {
            ++idBrainFuck;
            if (commandsBrainFuck[idBrainFuck] == '[') breakBrainFuck++;
            if (commandsBrainFuck[idBrainFuck] == ']')  breakBrainFuck--;
        }
    }
}

function endCycle() {
    if (arrayBrainFuck[pointerBrainFuck] != 0){
        if (commandsBrainFuck[idBrainFuck] == ']') breakBrainFuck++;
        while (breakBrainFuck != 0) {
            idBrainFuck--;
            if (commandsBrainFuck[idBrainFuck] == '[') breakBrainFuck--;
            if (commandsBrainFuck[idBrainFuck] == ']') breakBrainFuck++;
        }
        --idBrainFuck;
    }
}

















function inputData() {
    setTimeout(function(){$('#enterData').modal({backdrop:'static'});}, 500);
}

function stopRunning() {
    for (var i = 0; i < arrayBrainFuck.length; i++) {
        if(i == pointerBrainFuck ){
            addOneRow(i, "<==");
        } else if(arrayBrainFuck[i] != 0){
            addOneRow(i, "");
        }
    }
    addDHex();
    $("#current-debug").modal({"backdrop":'static', "show": false});
    $("#current-debug").modal('show');
}

function addDHex() {
    var dex = $(".onDex"), hex = $(".onHex");
    for (var i = 0; i < dex.length; i++) {
        dex.eq(i).on("focusout", getDexFocusout);
    }
    for (var i = 0; i < hex.length; i++) {
        hex.eq(i).on("focusout", getHexFocusout);
    }
    
}

function addOneRow(id, isPointer) {
    var tr = document.createElement('tr');
    tr.id = "tr"+id ;
    var arrData = [id, arrayBrainFuck[id], toHex(arrayBrainFuck[id]), isPointer];
    for (var i = 0; i < 4; i++) {
        var td = document.createElement('td');
        var input = document.createElement('input');
        input.disabled = i != 2 && i != 1 ? "disabled" : "";
        input.type = "text";
        input.value =  arrData[i];
        input.classList.add("form-control") ;
        if(i == 1) {
            input.classList.add("onDex") ;
        }
        if(i == 2) {
            input.classList.add("onHex") ;
        }
        tr.appendChild(td).appendChild(input);
    }
    document.getElementById('debugging').appendChild(tr);
}

function toHex(number) {
    var hexString = Number(number).toString(16), zero = "";
    for (var i = 0; i < 4-hexString.length; i++) {
        zero += "0";
    }
    return zero + hexString;
}

function addPrint(value) {
    $("#output-space").val($("#output-space").val() + value);
}



function enterSuccess() {
    var data = $("#enter-data").val();
    var answer = checkData(data);
    if(answer === null){
        $("#error-in-data").text("Введите корректные данные!");
    } else {
        $("#enterData").modal("hide");
        $("#enter-data").val("");
        $("#error-in-data").text("");
        arrayBrainFuck[pointerBrainFuck] = answer;
        idBrainFuck++;
        parse();
    }

}

function enterCansel() {
    $("#enterData").modal("hide");
    $("#enter-data").val("");
    $("#error-in-data").text("");
}

function degusSuccess() {
    deleteChildren();
    $("#current-debug").modal("hide");
    idBrainFuck++;
    parse();
}

function degusCansel() {
    deleteChildren();
    $("#current-debug").modal("hide");
}

function deleteChildren(){
    var container = document.getElementById('debugging');

    while (container.lastChild) {
        if(container.children.length <= 1) break;
        container.removeChild(container.lastChild);
    }
}

function checkData(string) {
    var integerAnswer;
    if(isInt(string)){ 
        integerAnswer = Number.parseInt(string);
        if(integerAnswer >= 0 && integerAnswer <= 9){
            return string.charCodeAt().toString();
        } else {
            return integerAnswer < 0 || integerAnswer > 65535 ? null : integerAnswer;
        }
    } else {
        if(string.length != 1){
            return null;
        } else {
            return string.charCodeAt().toString();
        }
    }
}

function isInt(string){
    return string.match(/^[-\+]?\d+/) !== null;
}

function isIntHex(string){
    return string.match(/^[-\+]?[0-9abcdef]+/) !== null;
}


function getDexFocusout(){
    var value = $(this).val();
    if(isInt(value)){
        var intValue = Number(value).toString();
        if(intValue >= 0 && intValue <= 65535){
            var parent = $(this).parent().parent();
            var id = parent.attr('id').replace("tr", "");
            arrayBrainFuck[id] = intValue;
            parent.children().eq(2).children().eq(0).val(toHex(intValue));
        } else {
            $(this).val("0");
        }

    } else {
        $(this).val("0");
    }
}

function getHexFocusout(){
    var value = $(this).val();
    if(isIntHex(value)){
        var intValue = Number.parseInt(value, 16);
        if(intValue >= 0 && intValue <= 65535){
            var parent = $(this).parent().parent();
            var id = parent.attr('id').replace("tr", "");
            arrayBrainFuck[id] = intValue;
            parent.children().eq(1).children().eq(0).val(intValue);
            parent.children().eq(2).children().eq(0).val(toHex(intValue));
        } else {
            $(this).val("0000");
        }

    } else {
        $(this).val("0000");
    }
}    

function outputCloseButton() {
    $(".output").css({"display":"none"});
}

function outputClearButton() {
    $("#output-space").val("");
}
