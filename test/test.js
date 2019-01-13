////////////////////////////////////////////////////////////////////////////////
// Secure-JSON test source code
// Author: HydroCarbons@outlook.com (ADF)
////////////////////////////////////////////////////////////////////////////////

const assert = require('assert');
const SecureJStore = require('../src/index');
////////////////////////////////////////////////////////////////////////////////

function Print(msg) {
  process.stdout.write( msg );
}
function PrintPass(msg) {
  process.stdout.write( msg );
}
function PrintFail(msg) {
  process.stdout.write( msg );
}

////////////////////////////////////////////////////////////////////////////////
function testViaClassInstantiation(inStore, inDbType, inPassword) {

  var N = 5;

  var instance = new SecureJStore();

  Print("Instance creation with //" + inDbType + ":");
    assert(null !== instance);
    PrintPass(' Passed');

  if(typeof(inPassword)!=='undefined') {
    Print("\nInstance encrypted with password " + ":");
    instance.init({ store: inStore, dbType: inDbType, password: inPassword });
    PrintPass(' Passed');
  } else {
    Print("\nInstance encrypted without any password " + ":");
    instance.init({ store: inStore, dbType: inDbType, verbose: true});
    PrintPass(' Passed');
  }

  Print("\nItem count must be Zero");
    assert(0 === instance.length() );
    PrintPass(' Passed');

  Print("\nAdd items:");
    for(var i = 0; i < N; i++) {
      instance.setItem("key-"+i, "value-"+i);
    }
    PrintPass(' Passed');

  Print("\nGet items:");
    for(var i = 0; i < N; i++) {
      assert ("value-"+i === instance.getItem("key-"+i) );
    }
    PrintPass(' Passed');

  Print("\nItem count:");
    assert(N === instance.length() );
    PrintPass(' Passed');

  Print("\nAll Item Keys:");
    assert.deepEqual( [ 'key-0', 'key-1', 'key-2', 'key-3', 'key-4' ], instance.keys() );
    PrintPass(' Passed');

  Print("\nAll Item Values:");
    assert.deepEqual( [ 'value-0', 'value-1', 'value-2', 'value-3', 'value-4' ], instance.values() );
    PrintPass(' Passed');

  Print("\nAll Items:");
    assert.deepEqual( [
      { 'key-0': 'value-0' },
      { 'key-1': 'value-1' },
      { 'key-2': 'value-2' },
      { 'key-3': 'value-3' },
      { 'key-4': 'value-4' } ], instance.entries() );
    PrintPass(' Passed');

  Print("\nSearch by key - All Matching Values:");
    assert.deepEqual( [ { 'key-2': 'value-2' } ], instance.valuesWithKeyMatch('key-2') );
    PrintPass(' Passed');

  Print("\nSearch by value - All Matching Keys:");
    assert.deepEqual( [ { 'key-2': 'value-2' } ], instance.keysWithValuesMatch('value-2'));
    PrintPass(' Passed');

  Print("\nFor Each Loop:");
    var i=0;
    instance.forEach( (x) => {
      var obj = {};
      obj['key-' + i] = 'value-'+i;
      assert.deepEqual(obj, x);
      PrintPass(i + ': Ok ');
      i++;
    });
    PrintPass(' Passed');

  Print('\nAll properties of store: \n');
    var _items = [ '_data', '_storePath', '_dbType', '_password' ], i = 0;
    for(let property in instance ) {
      Print("  " + property );
      if(property!=='fnLog')
        assert.deepEqual( _items[i++], property );
      PrintPass(' Passed\n');
    }

  Print('\nAll items: \n');
    var i=0;
    for(let item of instance ) {
      //console.log(item);
      Print(" * " + item );
      var obj = {};
        obj['key-' + i] = 'value-'+i ;
        assert.deepEqual( obj, item );
        PrintPass(' Passed\n');
      i++;
    }

  Print("\nRemove key-3");
    instance.removeItem("key-3");
    assert("Not Found" === instance.getItem("key-3") );
    PrintPass(' Passed');

  Print("\nFinally, archiving instance:");

    assert("successful" === instance.archive() );
    assert(null === instance._data );
    PrintPass(' Passed\n');

  PrintPass("\nTest via Class Instantiation: All done.\n\n\n");
}
////////////////////////////////////////////////////////////////////////////////

function negative_tests() {

  var instance0 = new SecureJStore();
    assert( true === instance0._commitToDisk('KEY', 'VALUE').error );

  var instance1 = new SecureJStore();
    Print("~Test : Instance creation with no options" + ":");
    assert( true === instance1.init().error );
    PrintPass(' Passed\n');

 var instance2 = new SecureJStore();
    Print("~Test : Instance creation with invalid path " + ":");
    assert(true === instance2.init({store: "" }).error );
    PrintPass(' Passed\n');

  var instance3 = new SecureJStore();
    Print("\n~Test : Null checks ");
    Print("\n~Test : keys " + ":");
    assert( 0 === instance3.keys().length );
    PrintPass(' Passed\n');
    Print("\n~Test : values " + ":");
    assert( 0 === instance3.values().length );
    PrintPass(' Passed\n');
    Print("\n~Test : entries " + ":");
    assert( 0 === instance3.entries().length );
    PrintPass(' Passed\n');
    Print("\n~Test : keysWithValuesMatch " + ":");
    assert( 0 === instance3.keysWithValuesMatch().length );
    Print("\n~Test : valuesWithKeyMatch " + ":");
    assert( 0 === instance3.valuesWithKeyMatch().length );
    PrintPass(' Passed\n');
    Print("\n~Test : removeItem " + ":");
    assert( true === instance3.removeItem('key-3').error );
    PrintPass(' Passed\n');

    var instance4 = new SecureJStore();
    Print("~Test : Instance creation with invalid path " + ":");
      assert( true === instance4.init().error );
      PrintPass(' Passed\n');

    var instance5 = new SecureJStore();
      Print("~Test : Instance creation with invalid path " + ":");
      assert( true === instance5.archive().error  );
      PrintPass(' Passed\n');

    PrintPass(' All ~Tests Passed\n');
}
////////////////////////////////////////////////////////////////////////////////

Print("\nRegular Test Cases___________________________\n");
testViaClassInstantiation('./store/store-in-mem1', "inmemory");
testViaClassInstantiation('./store/store-in-mem-encrypted', "inmemory", "password");
testViaClassInstantiation('./store/store-disk-1', "disk", "password");
testViaClassInstantiation('./store/store-disk-dir/store-disk-subdir', "disk");

Print("\nNegative Test Cases___________________________\n");
negative_tests();

////////////////////////////////////////////////////////////////////////////////
