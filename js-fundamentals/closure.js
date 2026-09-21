"use strict";
// What is closure in JavaScript?
// A closure is a concept of an inner function that has access to the outer function's variables and parameters
// even after the execution of the outer function has completed.

// Example of closure in JavaScript:

var count1 = 2;

function outerFunction() {
  var count2 = 3;

  return () => {
    return count1 + count2;
  };
}

const innerFunction = outerFunction();

console.log(innerFunction()); // Output: 5

// so we have understood the definitions of closure now we will
// some real use cases of closure step by step.

// we often see in oop that certain variables or properties can only be accessed by certain methods of class.
// So that sensitive data does not get modified accidentally. In JavaScript , we can achieve similar functionality using closure.

function bankAccount(initialBalance) {
  let balance = initialBalance;

  return function () {
    return balance;
  };
}

const myAccount = bankAccount(1000);
console.log(myAccount()); // Output: 1000

// Here balance is a private variable using closure we have achieved encapsulation in JavaScript. 
// The balance variable  is not accessible from outside the bankAccount function.

// Now let see an example with var and let whats the difference between them in closure.

var num1 = 2;
var num2 = 3;

function outerFunctionVar() {
  return function () {
    return num1 + num2;
  };
}

const innerFunctionVar = outerFunctionVar();
console.log(innerFunctionVar());

// if we do console.dir(outerFunctionVar) we will see that num1 and num2 are global scope variables. but with let  we will see they are in script scope.


function checkVar(){
  console.log(a)
  if(true){
    var a = 10;
    let b = 20;
    
  }
  console.log(a)
  //console.log(b)
}

checkVar();

// lets understand the scenario. var is function scoped and let is block scoped.so when we try to access b outside the block it will give referrence error.

// another advance example.


for(var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000*i);
}

for(let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000*i);
}
// Example with var will print 3,3,3 because var is function scoped and one single variable reference is created for all the functions.
// After execution of the loop i will be 3 and all the functions will refer to that variable.

// Example with let will print 0,1,2 because let is block scoped and a new variable is created for each iteration.