'use strict';

/***
 This class handles the activity regarding
 the messages exports to the SD memory card

 Refer to:
 https://developer.mozilla.org/en-US/docs/Web/API/MozSmsManager -- windows.navigator.MozSmsManager
 https://developer.mozilla.org/en-US/docs/Web/API/MozMobileMessageManager -- window.navigator.mozMobileMessage 
 https://developer.mozilla.org/en-US/docs/Web/API/MozSmsMessage

 **/

function MessagesBackup() {

  //-------------------------------------------------------------------------------------
  // OBJET INITIALISATION
  //-------------------------------------------------------------------------------------
  alert('Welcome!');
  var global = this;
  var messages = [];

  var backupSMSButton = document.getElementById("backupSMS");
  backupSMSButton.addEventListener('click', function onMessagesBackupHandler() {
      window.setTimeout(global.BackupMessages, 0);
  });

  

  

  //-------------------------------------------------------------------------------------
  // BACKUP MESSAGES
  //-------------------------------------------------------------------------------------

  /**
   * Backup messages
   */ 
  this.BackupMessages = function() {

    alert('Starting BackupMessages!');

    // Get message manager
     var smsManager = window.navigator.mozSms || window.navigator.mozMobileMessage;

     if(!smsManager)
      alert("SMS API is not supported on this device.")

    // Get read messages
    var request = smsManager.getMessages(null, false);

    // Process messages
    var foundSmsCount = 0;
    request.onsuccess = function() {
      // Get cursor
      var domCursor = request;
      if (!domCursor.result) {
        console.log('End of message');
        global.ExportMessages(foundSmsCount);
        return;
      }

      console.warn('domCursor=' + domCursor);

      var xmlMessage = global.BuildXMLMessage(domCursor.result);
      messages.push(xmlMessage);
      foundSmsCount++;
      document.getElementById("log").innerHTML = "SMS found: " + foundSmsCount; // SMS counter status.
      // Now get next message in the list
      domCursor.continue();
    };

    // Ctach error(s)
    request.onerror = function() {
      alert("Received 'onerror' smsrequest event.");
      alert("sms.getMessages error: " + request.error.name);
    };
    

  };

  /**
   * Build message xml string
   */
  this.BuildXMLMessage = function(message) {
    var xml = '<message>\n';
    xml += '\t<type>' + message.type + '</type>\n';
    xml += '\t<id>' + message.id + '</id>\n';
    xml += '\t<threadId >' + message.threadId + '</threadId>\n';
    xml += '\t<body><![CDATA[' + message.body + ']]></body>\n';
    xml += '\t<delivery>' + message.delivery + '</delivery>\n';
    xml += '\t<read>' + message.read + '</read>\n';
    xml += '\t<receiver>' + message.receiver + '</receiver>\n';
    xml += '\t<sender>' + message.sender + '</sender>\n';
    xml += '\t<timestamp>' + message.timestamp + '</timestamp>\n';
    xml += '\t<messageClass>' + message.messageClass + '</messageClass>\n';
    xml += '</message>\n';

    return xml;
  };

  /**
   * Export messages in output file (sdcard/backup-messages.xml)
   */
  this.ExportMessages = function(foundSmsCount) {
    
    alert(foundSmsCount + " messages found.\n Start exporting...");

    messages.unshift('<?xml version="1.0"?>\n'); // XML document declaration

    var oMyBlob = new Blob(messages, { "type" : "text\/xml" }); // the blob

    var sdcard = navigator.getDeviceStorage("sdcard");
    var del = sdcard.delete("backup-messages.xml"); // delete file if exists
    
    del.onsuccess = function(){
      alert('File already found. Deleting backup-messages.xml');
    }
    del.onerror = function(){
      alert('Unable to delete the file backup-messages.xml')
    }

    var request = sdcard.addNamed(oMyBlob, "backup-messages.xml");

    request.onsuccess = function() {
      alert('Messages successfully wrote on the sdcard storage area in backup-messages.xml');
    }

    // An error typically occur if a file with the same name already exist
    request.onerror = function() {
      alert('Unable to write the file backup-messages.xml: ' + this.error);
    }
    
    return 0;

  };

 

 }

window.addEventListener('DOMContentLoaded', function() {
  var backuper = new MessagesBackup();
});