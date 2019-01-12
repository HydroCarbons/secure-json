![Secure-JSON Icon](https://raw.githubusercontent.com/HydroCarbons/secure-json/master/secure-json-256.png)

# Secure JSON
- **Secure JSON** JSON storage library to securely persist JSON data on disk. **Cipher** is configured to use **AES-256-CBC** with initialization vector.
- There are two types of storage schema: inmemory or disk
- inmemory: Store items are not stored on disk and are not encrypted. 
- disk: Store items are stored on disk and can be encrypted.

## Usage

### Install
` npm install secure-json --save `

### Require
```javascript
const SecureJStore = require("secure-json");
```
### Create an instance of SecureJStore
```javascript
var instance = new SecureJStore();
```

### Initialize instance with options
```javascript

var options = {
    store: <Path to SecureJStore directory>,
    dbType: <Specify "inmemory" or "disk">,
    password: <Specify password to encrypt the SecureJStore>
  };

instance.init(options);
```

### Create an instance of SecureJStore
```javascript
var instance = new SecureJStore();
```

### Storing an item
```javascript
instance.setItem("key1", "value1");
```

### Retrieving an item
```javascript
let value = instance.getItem("key1");
```

### Removing an item
```javascript
let value = instance.removeItem("key1");
```

### Retrieving all keys
```javascript
let keys = instance.keys();
```

### Retrieving all values
```javascript
let values = instance.values();
```

### Retrieving all entries of (key, value) pairs
```javascript
let items = instance.entries();
```

### Retrieving all entries with for...of loop
```javascript
for(let item of instance ) { ... }
```

### Retrieving all entries with forEach loop
```javascript
instance.forEach( (x) => { ... });
```

### Archiving instance
```javascript
instance.archive();
```

## Library Usage/Test
### Try it out
` npm install `

### Test
` npm run test `

### Coverage
` npm run coverage`

OR

` istanbul cover ./test/test.js `

Check coverage folder
