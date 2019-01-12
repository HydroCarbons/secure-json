![Secure-JSON Icon](https://raw.githubusercontent.com/HydroCarbons/secure-json/master/secure-json-256.png)

# Secure JSON
- **Secure JSON** JSON storage library to securely persist JSON data on disk. **Cipher** is configured to use **AES-256-CBC** with initialization vector.

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
