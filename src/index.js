////////////////////////////////////////////////////////////////////////////////
// Secure-JSON Source Code
// Author: HydroCarbons@outlook.com (ADF)
////////////////////////////////////////////////////////////////////////////////

'use strict';
var fs = require('fs');
const path = require('path');
const { Krypton } = require('krypton-js');

////////////////////////////////////////////////////////////////////////////////
const LOG_LINE_SEPARATOR = " | ";
const ITEM_EXTENSION = ".json";
const STORE_ARCHIEVE = " [archieved]";
////////////////////////////////////////////////////////////////////////////////
// Utility functions
//
function NotEmpty(obj) {
  return ( obj != null && typeof(obj) !== 'undefined' ) ;
}

function Empty(obj) {
  return ( obj === null || typeof(obj) === 'undefined' ) ;
}

////////////////////////////////////////////////////////////////////////////////
class JStore {

  constructor() {
    this._data = {};
  }

  _createStore() {
     try {
       // Recursive: true
       fs.mkdirSync(this._storePath, { recursive: true } );
     } catch(e) {
       return {error: true, message: e.message};
     }
  }

  _getFileName(keyName) {
    var filePath = path.join(this._storePath, keyName + ITEM_EXTENSION);
    return filePath.toString();
  }

  _commitToDisk(keyName, keyValue) {
    var fd;
    try {
      var data = {};
      data[keyName] = keyValue;

      if( NotEmpty(this._password) ) {
        var file = this._getFileName(keyName);
        //console.log("\n",file);
        let krypton = new Krypton(file , this._password);
        krypton.encrypt( JSON.stringify( data ) );
      } else {
        fd = fs.openSync( this._getFileName(keyName), "w+");
        fs.writeFileSync(fd, JSON.stringify( data ), "utf-8" );
        fs.closeSync(fd);
      }
    } catch (e) {
      return {error: true, message: e.message};
    }
    return "successful";
  }

  _readDisk(keyName) {
    var fd, res;
    try {
      if( NotEmpty(this._password) ) {
        let krypton = new Krypton( this._getFileName(keyName) , this._password);
        res = JSON.parse( krypton.decrypt() );
      } else {
        fd = fs.openSync( this._getFileName(keyName), "r");
        res = JSON.parse( fs.readFileSync(fd) );
        fs.closeSync(fd);
      }

    } catch (e) {
      return {error: true, message: e.message};
    }
    return (res);
  }

  _readStoreSync() {
    var files = [];
    try {
      var dirent = fs.readdirSync( this._storePath, { encoding: "utf-8", withFileTypes: true } );
      for(var i=0; i<dirent.length; i++) {
        var f = dirent[i];
        if( f.isFile() && !['.DS_Store'].includes(f.name))
          files.push(f.name);
      }
    } catch (e) {
      return {error: true, message: e.message};;
    }
    return files;
  }

  _removeFromDisk(keyName) {
    try {
      fs.unlinkSync( this._getFileName(keyName) );
    } catch (e) {
      return {error: true, message: e.message};
    }
    return "successful";
  }

  /// if the storage dir is new, it will create it
  /// dbType = inmemory or database
  init(options) {
    if( Empty(options) )
      return {error: true, message: "Empty store path"};

    var storePath = options.store;
    var dbType = options.dbType;
    var password = options.password;

    if( NotEmpty(options.verbose) && options.verbose==true ) {
      this.fnLog = function(fnName) {
          var output = Date.now();
          for(var i=1; i<arguments.length; i++) {
            output += LOG_LINE_SEPARATOR + JSON.stringify( arguments[i] );
          }
          console.log("[ "+ fnName + " ],", output );
        }
    }

    if( this.fnLog ) {
       this.fnLog("Verbosity : enabled");
       this.fnLog("init", storePath);
    }
    if( NotEmpty(storePath) ) {
      this._storePath = storePath;
      if(NotEmpty(dbType)) this._dbType = dbType;
      if(NotEmpty(password)) this._password = password;

      if(this._dbType === "inmemory") {
        this._data = {};
        return "successful";
      }
      return this._createStore();
    }
  }

  /// This function sets 'key' in your database to 'value'
  setItem(keyName, keyValue) {
    if( this.fnLog ) this.fnLog("setItem", keyName);

    this._dbType === "inmemory" ? this._data[keyName] = keyValue : this._commitToDisk(keyName, keyValue);
  }

  /// This function will get the value for that key stored on disk
  getItem(keyName) {
    if(this._dbType === "inmemory") {
      return typeof(this._data[keyName])==='undefined' ? "Not Found" : this._data[keyName];
    }
    var k = this._readDisk(keyName);

    if( NotEmpty(k) && (Empty(k.error) || k.error==false) ) {
      return k[keyName];
    }
    return "Not Found";
  }

  /// This function immediately deletes it from the file system asynchronously
  removeItem(keyName) {
    if( this.fnLog ) this.fnLog("removeItem", keyName);
    return this._dbType === "inmemory"? delete this._data[keyName] : this._removeFromDisk(keyName);
  }

  /// This function returns all of the values
  values() {
    if(this._dbType === "inmemory") {
      return Object.values(this._data);
    }
    var keys = this._readStoreSync();

    var vals = [];
    for(var i=0; i<keys.length; i++) {
      var keyName = path.basename( keys[i], ITEM_EXTENSION );
      vals.push( this.getItem( keyName ) );
    }
    return vals;
  }

  /// This function returns all of the values
  entries() {
    var vals = [];
    if(this._dbType === "inmemory") {
      new Map(Object.entries(this._data)).forEach( (value, key) => {
          vals.push({[key]: value});
      });
      return vals;
    }

    var keys = this._readStoreSync();

    for(var i=0; i<keys.length; i++) {
      var keyName = path.basename( keys[i], ITEM_EXTENSION );
      var obj = {};
      obj[ keyName ] = this.getItem( keyName );
      vals.push( obj );
    }
    return vals;
  }

  /// This function returns all of the values matching a string or RegExp
  valuesWithKeyMatch(stringToMatch) {
    var vals = [];
    if(this._dbType === "inmemory") {
      new Map(Object.entries(this._data)).forEach( (value, key) => {
        if( key.match(stringToMatch) ) {
          vals.push({[key]: value});
        }
      });
      return vals;
    }

    var keys = this._readStoreSync();

    for(var i=0; i<keys.length; i++) {
      var keyName = path.basename( keys[i], ITEM_EXTENSION );
      if(keyName.match(stringToMatch)) {
        vals.push( this._readDisk(keyName) );
      }
    }
    return vals;
  }

  keysWithValuesMatch(stringToMatch) {
    var vals = [];
    if(this._dbType === "inmemory") {
      new Map(Object.entries(this._data)).forEach( (value, key) => {
        if( JSON.stringify(value).match(stringToMatch) ) {
          vals.push({[key]: value});
        }
      });
      return vals;
    }

    var keys = this._readStoreSync();

    for(var i=0; i<keys.length; i++) {
      var keyName = path.basename( keys[i], ITEM_EXTENSION );
      var keyValue = this._readDisk(keyName);

      if(JSON.stringify(keyValue).match(stringToMatch)) {
          vals.push( keyValue );
      }
    }
    return vals;
  }

  /// this function returns an array of all the keys in the database
  keys() {
    if(this._dbType === "inmemory") {
      return Object.keys(this._data);
    }
    var keys = this._readStoreSync();

    var vals = [];
    for(var i=0; i<keys.length; i++) {
      var keyName = path.basename( keys[i], ITEM_EXTENSION );
      vals.push( keyName );
    }
    return vals;
  }

  /// This function returns the number of keys stored in the database.
  length() {
    if(this._dbType === "inmemory") {
      return Object.keys(this._data).length;
    }
    var keys = this._readStoreSync();

    var vals = [];
    for(var i=0; i<keys.length; i++) {
      var keyName = path.basename( keys[i], ITEM_EXTENSION );
      vals.push( keyName );
    }
    return vals.length;
  }

  /// This function iterates over each key/value pair and executes an asynchronous callback as well
  forEach(callback) {
    if( NotEmpty(callback) ) {
      if(this._dbType === "inmemory") {
          new Map(Object.entries(this._data)).forEach( (value, key) => {
            callback( { [key]: value } );
          });
          return;
      }

      var keys = this._readStoreSync();
      for(var i=0; i<keys.length; i++) {
        var keyName = path.basename( keys[i], ITEM_EXTENSION );
        var keyValue = this._readDisk(keyName);
        callback( keyValue );
      }
    }
  }

  /// This function immediately archives all files from the file system asynchronously.
  archive() {
    if(this._dbType === "inmemory") {
        this._data = null;
        return "successful";
    }

    try {
      this._data = null;
      fs.renameSync(this._storePath, this._storePath + STORE_ARCHIEVE );
    } catch(e) {
      return {error: true, message: e.message};
    }
    return "successful";
  }

  // Iterator (for..of)
  [Symbol.iterator]() {
    return this.entries().values();
  }

}
////////////////////////////////////////////////////////////////////////////////
module.exports = JStore;
//////////////////////////////////////////////////////////////////////////////
