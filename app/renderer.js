'use strict';
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { webContents, remote ,ipcRenderer } = require('electron')
const { BrowserWindow } = require('electron').remote
window.$ = window.jQuery = require('jquery')
window.Tether = require('tether')
window.Bootstrap = require('bootstrap')
const { Console } = require('console');
var net = require('net');
var _ = require('lodash');
const { Notify, Report, Confirm, Loading, Block } = require("notiflix");
var QrCode = require('qrcode-reader');


const helper = require('./helper');
const api = require('./api');
const config = require('./config');
const tcp = require('./tcp');




Notify.Success('BAŞLATILDI...');

var qr = new QrCode();

qr.callback = function(error, result) {
    if(error) {
      console.log(error)
      return;
    }
    console.log(result)
  }


let win = remote.getCurrentWindow();
win.setProgressBar(0.0);

$('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);

var body_color = function (color) {
    $("#body").removeClass("bg-success").removeClass("bg-info").removeClass("bg-danger").addClass(color, 1000);
};

body_color('bg-info');




$(".close").on("click", function () {
    win.close();
});


(async () => {


    helper.log_async("UYGULAMA BAŞLADI");
    helper.log_async("CONFIG : " + JSON.stringify(config));

    // console.log("start");
    // var depolama = await api.get("api/kantar/depolamaList");
    // console.log("end");
    // console.log(ddd);

    helper.log_async("LOGIN BAŞLADI");
    var user = await api.login("api/User/CheckUser", {
        username: config.username,
        password: config.password,
        IsMobile: false
    });
    helper.log_async("LOGIN BİTTİ : " + JSON.stringify(user));

    setInterval(function () {
        helper.log_async("UYGULAMA AYAKTA KULLANICI :" + user.username + " DEPOLAMA ALANI :" + user.depolamaAlanAdi);
    }, 1000000);

    $("#txtBelediyeAdi").text(user.buyuksehiradi);
    $("#txtDepolamaAlani").text(user.depolamaAlanAdi);

    helper.log_async("ARAC LISTESI BAŞLADI");
    var aracListesi = await api.get(user.authtoken, "api/kantar/araclistesi?EtiketNo=");
    helper.log_async("ARAC LISTESI BİTTİ " + aracListesi.length);
 
 
    var last_post_data = { rfid: 0, belgeNo: "" };
    var rfTag = "";
    var aracId = 0;
    var plakaNo = "";


    var temizle = function () {

        $('.progress-bar').css('width', 0 + '%').attr('aria-valuenow', 0).text(0 + "% HGS");

        tempEtiketNo = [];
        body_color('bg-info');
        $("#txtSonuc").text("...");
        $("#txtArac").text("...");
        aracId = 0;
        plakaNo = "";

        helper.log_async("EKRAN TEMİZLENDİ");

    };

    var tempEtiketNo = [];
    var client;
    tcp.myTcp(
        function (c) {
            client = c;
            helper.log_async("CLIENT CONNECTED");
        },
        function (data) {

            console.log(data);

            if (data.toString().substring(0, 4) != config.etiketStartWith) return;

            var number = parseInt(data);
            tempEtiketNo.push(number);


            var k = tempEtiketNo.length * 20;

            $('#broadcast').css('opacity', "0." + k);


            win.setProgressBar(parseFloat("0." + k));
            $('.progress-bar').css('width', k + '%').attr('aria-valuenow', k).text(k + "% HGS");

            if (tempEtiketNo.length < 5) return;

            var result = _.head(_(tempEtiketNo)
                .countBy()
                .entries()
                .maxBy(_.last));

            tempEtiketNo = [];

            if (last_post_data.rfid === data) return;


            var arac = _.first(_.filter(aracListesi, { OGSEtiket: result }));

            helper.log_async("BULUNAN ARAÇ : " + JSON.stringify(arac));

            if (arac == null) {
                helper.log_async("ARAÇ LİSTESİ BY ETIKET START");
                api.get(user.authtoken, "api/kantar/araclistesi?EtiketNo=" + result).then(data => {
                    helper.log_async("ARAÇ LİSTESİ BY ETIKET END : " + JSON.stringify(data));

                    if(data === null){

                        $("#txtSonuc").text("TANIMSIZ HGS ...");
                        helper.log_async("TANIMSIZ HGS ETIKET " + result);

                    }else{

                        aracId = data.aracId;
                        plakaNo = data.plakaNo;
    
                        aracListesi.push(data);
    
                        helper.log_async(JSON.stringify(data));
    
                        $("#txtArac").text(data.PlakaNo);
    
                        $("#txtSonuc").text("BARKOD OKUTUNUZ...");
                        helper.log_async("QRCODE BEKLENİYOR...");

                    }                 

                });

            } else {

                aracId = arac.aracId;
                plakaNo = arac.plakaNo;
                $("#txtArac").text(arac.PlakaNo);
                $("#txtSonuc").text("BARKOD OKUTUNUZ...");
                helper.log_async("QRCODE BEKLENİYOR...");

            }

            rfTag = result;

        });


    var readBarkod = "";
    window.onkeydown = function (event) {

        var key = event.key;

        if (event.keyCode == 223)
            key = "-";

        if (!(event.keyCode == 16 || event.keyCode == 13))
            readBarkod = readBarkod + key;



        if (event.keyCode == 13) {
            var belge = {};
            helper.log_async("BARKOD OKUTULDU : " + readBarkod);

            if (readBarkod.indexOf("KF-") > -1 && readBarkod.indexOf("-KF") > -1) {//KAMUFİŞ

                helper.log_async("KAMUFİŞ : " + readBarkod);

                var belgeNo = readBarkod.replace("KF-", "").replace("-KF", "");

                belge.Tur = "KAMU FİŞİ";
                belge.BarkodNo = Object.assign({}, readBarkod);
                belge.BelgeNo = Object.assign({}, belgeNo);

                helper.log_async(belgeNo);


                BelgeKontrol(belgeNo);

            } else if (readBarkod.indexOf("A") > -1 && readBarkod.indexOf("-") > -1) {//KABUL BELGESİ

                helper.log_async("KABUL BELGESİ : " + readBarkod);

                var belgeNo = readBarkod.split("A")[1];

                belge.Tur = "KABUL BELGESİ";
                belge.BarkodNo = Object.assign({}, readBarkod);
                belge.BelgeNo = Object.assign({}, belgeNo);
                helper.log_async(belgeNo);

                BelgeKontrol(belgeNo);


            } else if (readBarkod.indexOf("A") > -1) {//NAKİT

                helper.log_async("NAKİT : " + readBarkod);

                var belgeNo = readBarkod.split("A")[1];

                belge.BarkodNo = Object.assign({}, readBarkod);
                belge.BelgeNo = Object.assign({}, belgeNo);
                helper.log_async(belgeNo);

                BelgeKontrol(belgeNo);


            } else if (readBarkod.indexOf("-") > -1) {//FİRMA BARKOD

                helper.log_async("KABUL BELGESİ FIRMA BARKOD : " + readBarkod);

                var belgeNo = readBarkod;

                belge.Tur = "KABUL BELGESİ(FİRMA)";
                belge.BarkodNo = Object.assign({}, readBarkod);
                belge.BelgeNo = Object.assign({}, belgeNo);
                helper.log_async(belgeNo);


                BelgeKontrol(belgeNo);

            }

            readBarkod = "";
        }

    };

    var loading = false;
    var BelgeKontrol = async function (qrCode) {

        if (rfTag == "") {
            helper.log_async("ETİKET BOŞ");
            return;
        };

        if (aracId == 0) {
            helper.log_async("ARAÇ ID BOŞ");
            return;
        };

        if (qrCode == "") {
            helper.log_async("BARKOD BOŞ");
            return;
        };

        var data = {
            "username": config.username,
            "password": config.password,
            "qrCode": qrCode,
            "rfTag": rfTag,
            "alanId": user.depolamaalaniid
        };

        helper.log_async("LAST BN :" + last_post_data.belgeNo + " CURRENT BN :" + qrCode);
        //if (last_post_data.belgeNo == qrCode) return;

        if (!loading) {

            loading = true;

            last_post_data.rfid = rfTag;
            last_post_data.belgeNo = qrCode;

            $("#txtSonuc").text("BEKLEYİNİZ");
            helper.log_async("POST START");
            helper.log_async("POST DATA : " + JSON.stringify(data));
            var sonuc = await api.post(user.authtoken, "api/HafriyatDokum/DoorControl", data);
            helper.log_async("POST END " + sonuc);

            if (sonuc == "") {
                body_color('bg-success');
                $("#txtSonuc").text("BAŞARILI");

                if (client != null) { //anten kapı aç
                    client.write('0100000111040D12CA\r');
                    helper.log_async("DOOR OPEN " + plakaNo);
                }


            } else if (sonuc.response.status === 400) {//HATA
                helper.log_async("DOOR NOT OPEN " + plakaNo);
                $("#txtSonuc").text(sonuc.response.data);
                body_color('bg-danger');
            }


            setTimeout(temizle, 5000);

            loading = false;
        }


    };

    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
        $("#hybs-version").text("v" + arg.version);
        ipcRenderer.removeAllListeners('app_version');
        helper.log_async('Version ' + arg.version);
    });
 

})();
















