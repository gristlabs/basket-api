'use strict';

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
 *                             Public class methods                                    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Adds a table with tableId to the basket.
Basket.prototype.addTable = function(optTableId, callback) {
  // Since the optTableId is optional, it may be the callback function.
  if (!callback && typeof optTableId === 'function') {
    callback = optTableId;
    optTableId = null;
  }
  return request('POST', `/${this.basketId}/tables`, { tableId: optTableId },
    { apiKey: this.apiKey }, callback);
};

// Retrieves all data from the table with tableId from the basket.
Basket.prototype.getTable = function(tableId, callback) {
  return request('GET', `/${this.basketId}/tables/${tableId}`, null, { apiKey: this.apiKey },
    callback);
};

// Renames the table from oldTableId to newTableId.
Basket.prototype.renameTable = function(oldTableId, newTableId, callback) {
  return request('PUT', `/${this.basketId}/tables/${oldTableId}`, { tableId: newTableId },
    { apiKey: this.apiKey }, callback);
};

// Replaces table with tableId data with columnValues.
Basket.prototype.replaceTableData = function(tableId, columnValues, callback) {
  return request('PUT', `/${this.basketId}/tables/${tableId}`, columnValues, { apiKey: this.apiKey },
    callback);
};

// Deletes table with tableId from the basket.
Basket.prototype.deleteTable = function(tableId, callback) {
  return request('DELETE', `/${this.basketId}/tables/${tableId}`, null, { apiKey: this.apiKey },
    callback);
};

// Returns a list of tableIds in the current basket.
Basket.prototype.getTables = function(callback) {
  return request('GET', `/${this.basketId}/tables`, null, { apiKey: this.apiKey }, callback);
};

// Basket.prototype.getRows = function(tableId, columnValues, callback) {

// };

// Basket.prototype.addRows = function(tableId, columnValues, callback) {

// };

// Basket.prototype.editRows = function(tableId, columnValues, callback) {

// };

// Basket.prototype.deleteRows = function(tableId, columnValues, callback) {

// };

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                  Private class methods (require authentication)                     *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Deletes a basket with the given basketId. Requires a login object.
Basket.prototype.delete = function(login, callback) {
  return request('DELETE', `/${this.basketId}`, null, { login: login }, callback);
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                 Private static methods (require authentication)                     *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Adds a basket belonging to the user. Requires a login object.
Basket.addBasket = function(login, callback) {
  return request('POST', `/`, null, { login: login }, callback);
};

// Returns an array of basketIds belonging to the user. Requires a login object.
Basket.getBaskets = function(login, callback) {
  return request('GET', `/`, null, { login: login }, callback);
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

// The request function, implemented with a callback.
function _requestCallback(method, path, body, options, callback) {
  options = options || {};
  let xhr = new XMLHttpRequest();
  let url = HOST + BASE_PATH + path;
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  if (options.login) {
    xhr.setRequestHeader('Authorization', JSON.stringify(options.login));
  } else if (options.apiKey) {
    xhr.setRequestHeader('Authorization', options.apiKey);
  }
  xhr.onload = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      let response = JSON.parse(xhr.responseText);
      if (response.errorMessage) {
        callback(new Error(response.errorMessage));
      } else {
        callback(null, response);
      }
    }
    callback(new Error(xhr.statusText));
  };
  xhr.onerror = () => {
    callback(new Error(xhr.statusText));
  };
  xhr.send(body ? JSON.stringify(body) : null);
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Basket;
} else {
  window.Basket = Basket;
}
