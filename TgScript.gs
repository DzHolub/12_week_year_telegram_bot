var apiToken = "[INSERT YOUR TELEGRAM API TOKEN]";
var tgUrl = "https://api.telegram.org/bot" + apiToken + "/";
var webAppUrl = "[INSERT LINK OF THE GOOGLE SCRIPT WEB APP]";

var ssId = "[YOUR SPREADSHEET ID]";
var ssDataSheet = SpreadsheetApp.openById(ssId).getSheetByName("data");
var ssTaskSheet = SpreadsheetApp.openById(ssId).getSheetByName("weekly_tasks_db");
var ssTaskSheetRange = ["A1:A100","A1:V1"];
var ssQuarterTaskSheet = SpreadsheetApp.openById(ssId).getSheetByName("quarter_tasks_db");
var ssQuarterTaskSheetRange = ["A1:A5","A1:X1"];


var quarterTaskMessageId = ssDataSheet.getRange("B6");
var weekTaskMessageId = ssDataSheet.getRange("B7");


function initializeScript(){
  setWebhook();
  setMyCommands();
}


function doGet(e) {
  return HtmlService.createHtmlOutput(JSON.stringify(e));
}


function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var text = data.message.text;
  var chatId = data.message.chat.id;
  var messageId = data.message.message_id;
  if(text.charAt(0) == "/"){executeCommand(chatId, text);} 
  else if (text.charAt(0) == "."){changeTask(chatId, "text", ssTaskSheet, ssTaskSheetRange, text);} 
  else if (text.charAt(0) == "!"){changeTask(chatId, "prg", ssTaskSheet, ssTaskSheetRange, text);}
  else if (text.charAt(0) == "@"){changeTask(chatId, "text", ssQuarterTaskSheet, ssQuarterTaskSheetRange, text);}
  else if (text.charAt(0) == "'"){changeTask(chatId, "prg", ssQuarterTaskSheet, ssQuarterTaskSheetRange, text);}
  deleteMessage(chatId, messageId);
}


function executeCommand(chatId, text){
  switch (text){
    case "/start":
      return ensureBotMessageExists(chatId);
    case "/help":
      return sendMessage(chatId, ".[task number] [task text] to change task's text. Ex.: .1 Do 10 squats \n![task number] [task prgoress percent] to change task's progress Ex.: !3 17% \n@[task number] [task text] to change quarter task's text \n'[task number] [task prgoress percent] to change quarter task's progress");
    case "/refresh":
      return ensureBotMessageExists(chatId);
    default:
      return sendMessage(chatId, "Unknown command");
  }
}


function changeTask(chatId, type, taskSheet, taskSheetRange, text){
  var ssPeriod = ssDataSheet.getRange("B3").getValue();
  if (ssQuarterTaskSheetRange == ssTaskSheet){ssPeriod = 1};
  var taskNumber = parseInt(text.substring(1, 3));
  var firstSpacePos = text.indexOf(" ");
  var taskText = text.substring(firstSpacePos+1);
  if (taskNumber <= 10 && taskNumber >0){
    var column = findCellWithText(taskSheet.getRange(taskSheetRange[0]).getValues(),ssPeriod);
    var row = findCellWithText(taskSheet.getRange(taskSheetRange[1]).getValues(), taskNumber + "_tsk_" + type);
    taskSheet.getRange(column[0],row[1]).setValue(taskText);
    refreshTasks(chatId);
  } else {
    sendMessage(chatId, "Wrong number of a task");
  }
}


function refreshTasks(chatId){
  var ssWeek = ssDataSheet.getRange("B4").getValue();
  var ssPeriod = ssDataSheet.getRange("B5").getValue();
  var weekTasks = ssDataSheet.getRange("H1:H11").getValues().map(function(e){return e.toString()}).join("\n");
  var quarterTasks = ssDataSheet.getRange("O1:O11").getValues().map(function(e){return e.toString()}).join("\n");
  editMessage(chatId, weekTaskMessageId.getValue(), ssWeek + " tasks\n" + weekTasks);
  editMessage(chatId, quarterTaskMessageId.getValue(), ssPeriod + " tasks\n" + quarterTasks);
}


function sendMessage(chatId,text) {
  var commands = {
   'chat_id': chatId,
   'parse_mode': 'html'
  };
  return sendRequest('sendMessage?&text=' + encodeURIComponent(text), commands);
}


function editMessage(chatId, messageId, text) {
  var commands = {
   'chat_id': chatId,
   'message_id': messageId,
   'parse_mode': 'html'
  };
  return sendRequest('editMessageText?&text=' + encodeURIComponent(text), commands);
}


function deleteMessage(chatId, messageId){
  var commands = {
   'chat_id': chatId,
   'message_id': messageId
  };
  sendRequest('deleteMessage', commands);  
}


function findMessage(chatId, messageId){
//somewhy /searchMessages and /searchChatMessages refuse to work
var commands = {
   'chat_id': chatId,
   'text': 'checking...',
   'message_id': messageId
  };
var result = sendRequest('editMessageText', commands);
if (result['ok']) {
  return true
  } else {
    return false
  }
}


function findCellWithText(sheetWithRange, textToFind) {
  for (var i = 0; i < sheetWithRange.length; i++) {
    for (var j = 0; j < sheetWithRange[i].length; j++) {
      if (sheetWithRange[i][j] == textToFind) {
        return [i + 1, j + 1];
      }
    }
  }
}


function setWebhook() {
  var commands ={'url': webAppUrl};
  sendRequest('setWebhook', commands);
}


function setMyCommands() {
  var commands = {
    'commands': [
    {'command': '/start', 'description': 'Start your task journey'},
    {'command': '/help', 'description': 'Show help message'},
    {'command': '/refresh', 'description': 'Actualize current tasks'}
    ]
  }; 
  sendRequest('setMyCommands', commands);
}


function ensureBotMessageExists(chatId){
  Logger.log(quarterTaskMessageId.getValue() + " " + weekTaskMessageId.getValue());
  var quarterTaskMsgExist = findMessage(chatId,quarterTaskMessageId.getValue());
  var weekTaskMsgExist = findMessage(chatId, weekTaskMessageId.getValue());
  Logger.log(quarterTaskMsgExist + " " + weekTaskMsgExist);
  if (!quarterTaskMsgExist || !weekTaskMsgExist){
    quarterTaskMsgExist ? deleteMessage(chatId, quarterTaskMessageId.getValue()) : null;
    weekTaskMsgExist ? deleteMessage(chatId, weekTaskMessageId.getValue()) : null;
    var quraterTaskMessage = sendMessage(chatId, "there will be your quarter tasks");
    var weekTaskMessage = sendMessage(chatId, "there will be your weekly tasks");
    quarterTaskMessageId.setValue(quraterTaskMessage.result.message_id);
    weekTaskMessageId.setValue(weekTaskMessage.result.message_id);
  }
  refreshTasks(chatId);
}


function sendRequest(request, commands){
    var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(commands),
    'muteHttpExceptions': true
  };
  var response = UrlFetchApp.fetch(tgUrl + request, options);
  var result = JSON.parse(response.getContentText());
  if (response.getResponseCode() == 200) {
    if (result['ok']) {
      Logger.log('Sent successfully: '+ response.getContentText());
    } else {
      Logger.log('Error: ' + result['description']);
    }
  } else {
    Logger.log('Error: ' + response.getContentText());
  }
  return result;
}
