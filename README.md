# basket
Standalone data solution useful for displaying and interacting with data on your website

API

All methods implement node-style callback functions or, if omitted, return ES6 Promises.
The listed return values show what is passed to the callback or the Promise.

```js
/**
 * Creates a Basket instance for interacting with a single basket.
 * @param {String} basketId - Basket identifier string.
 * @param {String} apiKey - API Key giving certain interaction permission. May be null if
 *  not required.
 */
let basket = new Basket(basketId, apiKey)

/**
 * Adds a table to the basket
 * @param {String} optTableId - Optional name for the new table. If omitted, a default 'Table1'
 *  style name is used.
 * @returns {String} - The name of the new table, which may be a sanitized version of the input.
 */
basket.addTable(optTableId, callback)

/**
 * Retrieves a table from the basket
 * @param {String} tableId - The name of the table to retreive.
 * @returns {Object} - The table data.
 */
basket.getTable(tableId, callback)

/**
 * Renames a table in the basket
 * @param {String} oldTableId - The current name of the table to rename.
 * @param {String} newTableId - The new name for the table.
 * @returns {String} - The name of the new table, which may be a sanitized version of the input.
 */
basket.renameTable(oldTableId, newTableId, callback)

/**
 * Overwrites the current data in a table with new data
 * @param {String} tableId - The name of the table whose data should be replaced.
 * @param {Object} columnValues - The new data for the table.
 * @returns null
 */
basket.replaceTableData(tableId, columnValues, callback)

/**
 * Deletes the table in the basket
 * @param {String} tableId - The name of the table to be deleted.
 * @returns null
 */
basket.deleteTable(tableId, callback)

/**
 * Lists tables in the basket
 * @returns {Array} - An array of tableIds of tables in the basket
 */
 basket.getTables(callback)
```

index.js is produced by babel from basket.js via:
```sh
babel basket.js --watch --out-file index.js
```
