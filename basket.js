'use strict';

const axios = require('axios');

const HOST = "https://syvvdfor2a.execute-api.us-east-1.amazonaws.com";
const BASE_PATH = "/test";

/**
 * Creates a Basket instance for interacting with a single basket.
 * @param {String} basketId - Basket identifier string.
 * @param {String} apiKey - API Key giving certain interaction permission. May be null if
 *  not required.
 */
function Basket(basketId, apiKey) {
  this.basketId = basketId;
  this.apiKey = apiKey;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                        Instance methods for public access                           *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Adds a table with tableId to the basket.
Basket.prototype.addTable = function(optTableId, optCallback) {
  // Since the optTableId is optional, it may be the optCallback function.
  if (!optCallback && typeof optTableId === 'function') {
    optCallback = optTableId;
    optTableId = null;
  }
  return request('POST', `/${this.basketId}/tables`, { tableId: optTableId },
    { apiKey: this.apiKey }, optCallback);
};

// Retrieves all data from the table with tableId from the basket.
Basket.prototype.getTable = function(tableId, optCallback) {
  return request('GET', `/${this.basketId}/tables/${tableId}`, null, { apiKey: this.apiKey },
    optCallback);
};

// Renames the table from oldTableId to newTableId.
Basket.prototype.renameTable = function(oldTableId, newTableId, optCallback) {
  return request('PUT', `/${this.basketId}/tables/${oldTableId}`, { tableId: newTableId },
    { apiKey: this.apiKey }, optCallback);
};

// Replaces table with tableId data with columnValues.
Basket.prototype.replaceTableData = function(tableId, columnValues, optCallback) {
  return request('PUT', `/${this.basketId}/tables/${tableId}/records`, columnValues, { apiKey: this.apiKey },
    optCallback);
};

// Deletes table with tableId from the basket.
Basket.prototype.deleteTable = function(tableId, optCallback) {
  return request('DELETE', `/${this.basketId}/tables/${tableId}`, null, { apiKey: this.apiKey },
    optCallback);
};

// Returns a list of tableIds in the current basket.
Basket.prototype.getTables = function(optCallback) {
  return request('GET', `/${this.basketId}/tables`, null, { apiKey: this.apiKey }, optCallback);
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                    Instance methods for authenticated access                        *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Deletes a basket with the given basketId. Requires a login object.
Basket.prototype.delete = function(login, optCallback) {
  return request('DELETE', `/${this.basketId}`, null, { login: login }, optCallback);
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                     Class methods for authenticated access                          *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Adds a basket belonging to the user. Requires a login object.
Basket.addBasket = function(login, optCallback) {
  return request('POST', `/`, null, { login: login }, optCallback);
};

// Returns an array of basketIds belonging to the user. Requires a login object.
Basket.getBaskets = function(login, optCallback) {
  return request('GET', `/`, null, { login: login }, optCallback);
};

/**
 * Makes a request to the API Gateway controlling the Basket Lambda function.
 * @param {String} method - The name of the HTTP method in all caps (ex: GET)
 * @param {String} path - The resource path (ex: /b12345678/tables/Menu)
 * @param {Object} body - The JSON body of the request
 * @param {Object} options.apiKey - The key used to give permission to perform the method
 *  on the resource path.
 * @param {Object} options.login - The login object mapping from provider to token, which
 *  should be provided for methods which require authorization.
 * @param {Function} optCallback - The callback function of the form function(err, res) {}.
 *  If omitted, the function returns an ES6 Promise.
 */
function request(method, path, body, options, optCallback) {
  // If the callback is provided, use the standard callback function. Otherwise, use
  //  the promisifed function.
  if (optCallback) {
    return _requestCallback(method, path, body, options, optCallback);
  }
  return new Promise((resolve, reject) => {
    return _requestCallback(method, path, body, options,
      (err, result) => err ? reject(err) : resolve(result));
  });
}

// The request function, implemented with axios and a callback.
function _requestCallback(method, path, body, options, callback) {
  options = options || {};
  let auth = options.login ? JSON.stringify(options.login) : options.apiKey;
  axios.request({
    method: method,
    baseURL: HOST + BASE_PATH,
    url: path,
    headers: Object.assign({ 'Content-Type': 'application/json' },
      auth ? { 'Authorization': auth } : {}),
    data: body
  }).then(response => {
    let data = response.data;
    if (data.errorMessage) {
      callback(new Error(data.errorMessage));
    } else {
      callback(null, data);
    }
  })
  .catch(error => {
    callback(error, null);
  });
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Basket;
} else {
  window.Basket = Basket;
}
