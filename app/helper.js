'use strict';

var moment = require('moment');



module.exports = {

    // log : function(text){
    //     console.log(text + " (" + moment().format('YYYY.MM.DD h:mm:ss') + ")");
    // },
     log_async: function (text) {
        const api = require('./api');
          (async () => {
              var sonuc = await api.post("", "api/HafriyatDokum/AddLog?text=" + text,null);
             console.log(text + " (" + moment().format('YYYY.MM.DD h:mm:ss') + ") " + sonuc);
          })();
     },
    byteToHex: function (byte) {
        // convert the possibly signed byte (-128 to 127) to an unsigned byte (0 to 255).
        // if you know, that you only deal with unsigned bytes (Uint8Array), you can omit this line
        const unsignedByte = byte & 0xff;

        // If the number can be represented with only 4 bits (0-15), 
        // the hexadecimal representation of this number is only one char (0-9, a-f). 
        if (unsignedByte < 16) {
            return '0' + unsignedByte.toString(16);
        } else {
            return unsignedByte.toString(16);
        }
    }

}

