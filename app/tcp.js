'use strict';

const helper = require('./helper');

module.exports = {

    myTcp: function (client_connected, e) {

      

        var server = net.createServer(function (client) {

            console.log('Client connect : ', client);
            client_connected(client);

            //client.setEncoding('utf-8');

            client.setTimeout(1000);

            client.on('data', function (received) {

                for (let i = 0; i < received.length; i++) {

                    if (received[i] == 0x13) {

                        if (received.Length < i + 3)
                            return;
                        var hex1 = helper.byteToHex(received[i + 1]);
                        var hex2 = helper.byteToHex(received[i + 2]);
                        var hex3 = helper.byteToHex(received[i + 3]);

                        var etiket = parseInt(hex1 + hex2 + hex3, 16);

                        e(etiket);

                    }
                }

                // Server send data back to client use client net.Socket object.
                //client.end('Server received data : ' + data + ', send back to client data size : ' + client.bytesWritten);
            });

            client.on('end', function () {
                console.log('Client disconnect.');

                server.getConnections(function (err, count) {
                    if (!err) {
                        console.log("There are %d connections now. ", count);
                    } else {
                        console.error(JSON.stringify(err));
                    }

                });
            });

            //  client.on('timeout', function () {
            //      console.log('Client request time out. ');
            //  })
        }).on('error', function (error) {
            console.log('TCP SERVER ERROR : ', error);
        });

        server.listen(config.tcpPort, function () {
            server.on('close', function () {
                console.log('TCP server socket is closed.');
            });

            server.on('error', function (error) {
                console.error(JSON.stringify(error));
            });
            console.log('TCP SERVER LISTEN:', server);
        });

    }

}

