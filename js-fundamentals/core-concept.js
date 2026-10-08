function myFunction(){
    console.log("Function declaration!");
}

const hello = function(){
    console.log("Function stored in a variable");
}

const arrowFunction = () => {
    console.log("Arrow function!");
}


function myFunctionCallback(callback) {
    callback();
}

console.log(myFunctionCallback(()=>{
    console.log("This is a callback function!");
}))


function makeCounter(){
    let count = 0;
    return ()=>{
        count++;
        return count;
    }
}

const counter = makeCounter();
console.log(counter()); // output: 1
console.log(counter()); // output: 2
console.log(counter()); // output: 3


const product = {
    name: "Laptop",
    price: 1000,
    getPrice: function(){
        return this.price;
    }
}

const {name, price, getPrice} = product;

const newProducct = {...product}

const user = {
    name: "John",
    address:{
        city:"New York",
    }
}

const copyUser  = {...user};
copyUser.address.city = "Dhaka";
copyUser.name = "Tanvir";

console.log(user, copyUser);

const deep = structuredClone(user);

deep.address.city = "Pabna";
console.log(user.address.city);  // "Dhaka" (unchanged)

// Asynchronous programming

// function checkInventory(){

//     setTimeout(()=>{
//         console.log("Checking inventory...");
//     }, 1000);
// }


// function createOrder(){
//     setTimeout(()=>{
//         console.log("Creating order...");
//     }, 3000);
// }

// function processPayment(){
//     setTimeout(()=>{
//         console.log("Processing payment...");
//     }, 2000);
// }

// function sendEmail(){
//     setTimeout(()=>{
//         console.log("Sending email...");
//     }, 1000);
// }


// function placeOrder(){
//     checkInventory();
//     createOrder();
//     processPayment();
//     sendEmail();
// }

// placeOrder();

// function checkInventory(callback){
//     setTimeout(()=>{
//         console.log("Checking inventory...");
//         callback();
//     }, 1000);
// }

// Callback hell

// function checkInventory(callback){
//     setTimeout(()=>{
//         console.log("Checking inventory...");
//         callback();
//     }, 1000);
// }

// function createOrder(callback){
//     setTimeout(()=>{
//         console.log("Creating order...");
//         callback();
//     }, 3000);
// }

// function processPayment(callback){
//     setTimeout(()=>{
//         console.log("Processing payment...");
//         callback();
//     }, 2000);
// }

// function sendEmail(callback){
//     setTimeout(()=>{
//         console.log("Sending email...");
//         callback();
//     }, 1000);
// }

// function placeOrder(){
//     checkInventory(()=>{
//         createOrder(()=>{
//             processPayment(()=>{
//                 sendEmail(()=>{
//                     console.log("Order placed successfully!");
//                 });
//             });
//         });
//     });
// }


// placeOrder();


// Promises

function checkInventory(){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            console.log("Checking inventory...");
            resolve();
        }, 1000);
    });
}

function createOrder(){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            console.log("Creating order...");
            resolve();
        }, 3000);
    });
}

function processPayment(){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            console.log("Processing payment...");
            resolve();
            // const error = new Error("Payment failed!");
            // reject(error);
        }, 2000);
    });
}

function sendEmail(){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            console.log("Sending email...");
            resolve();
        }, 1000);
    });
}

// async function placeOrder(){
//     // checkInventory(). 
//     // then(createOrder).
//     // then(processPayment).
//     // then(sendEmail).
//     // then(()=>{
//     //     console.log("Order placed successfully!");
//     // })
//     // .catch((error)=>{
//     //     console.log(error.message);
//     // });
//     // await checkInventory();
//     // await createOrder();
//     // await processPayment();
//     // await sendEmail();
//     // console.log("Order placed successfully!");
// }

//placeOrder();