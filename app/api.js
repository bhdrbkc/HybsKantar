'use strict';
const axios = require('axios').default;
const config = require('./config');
const helper = require('./helper');



module.exports = {


  login: async (url, data) => {


    var data;
    try {
      const response = await axios({
        method: 'post',
        url: config.webApiUrl + url,
        data: data
      });
      data = response.data;
      return data;
    } catch (error) {
      console.log(error);
    }
  },


  get: async (token, url) => {

    var data;
    try {
      const response = await axios.get(config.webApiUrl + url, { headers: { 'Authorization': 'Basic ' + token } });
      data = response.data;
      return data;
    } catch (error) {
      console.log(error);
    }
  },

  post: async (token, url, data) => {    

    var data;
    try {
      const response = await axios({
        method: 'post',
        url: config.webApiUrl + url,
        data: data,
        headers: { 'Authorization': 'Basic ' + token }
      });
      data = response.data;
      return data;
    } catch (error) {
      return error;
    }
  },


  // post : function (url, data, success,error) {
  //     $.post({
  //         url: config.webApiUrl + url,
  //         contentType: 'application/json',
  //         data: JSON.stringify(data),
  //         dataType: 'json',
  //         success: success,
  //         error : error
  //     });

  // },
  // get : function (url,  success) {
  //     $.get({
  //         url: config.webApiUrl + url,
  //         contentType: 'application/json',          
  //         dataType: 'json',
  //         success: success
  //     });
  // }

}



