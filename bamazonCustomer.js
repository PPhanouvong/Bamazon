var mysql = require("mysql");
var inquirer = require("inquirer");


var connection = mysql.createConnection({
    host: "localhost",

    // Your port if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
});


connection.connect(function (err) {
    if (err) throw err;
    showProducts();
    startUp();
});

function showProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " $ " + " | ");
        }
        console.log("_______________________________________");
    });
}

function startUp() {

    connection.query("SELECT * FROM products", function (err, res) {
        inquirer.prompt([{
            name: "itemId",
            type: "input",
            message: "What is the item ID you would like to buy?",
            validate: function (value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            name: "Quantity",
            type: "input",
            message: "Quantity of items to purchase?",
            validate: function (value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }
        }]).then(function (answer) {
            var chosenId = answer.itemId - 1;
            var chosenProduct = res[chosenId];
            var chosenQuantity = answer.Quantity;
            if (chosenQuantity < chosenProduct.quantity) {
                console.log("Your total for " + "(" + answer.Quantity + ")" + " - " + chosenProduct.product_name + " is: " + chosenProduct.price * chosenQuantity);
                connection.query("UPDATE products SET ? WHERE ?", [{
                    quantity: chosenProduct.quantity - chosenQuantity
                }, {
                    id: chosenProduct.id
                }], function (err, res) {
                    //console.log(err);
                    startUp();
                });

            } else {
                console.log("Sorry, insufficient Quantity at this time. Stock available " + chosenProduct.quantity);
                startUp();
            }
        })
    });
};