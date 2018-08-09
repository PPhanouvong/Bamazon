var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "root", //Your password
    database: "bamazon_db"
})


//MAIN MANAGER PROMPT, RUNS THE MANAGER FILE WHICH HAS DIFFERENT OPTIONS TO CHOOSE FROM 
var managerPrompt = function () {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "Hello! What would you like to do?",
        choices: ["View products for sale", 'View low inventory', "Add to inventory", "Add a new product", 'Exit']
    }).then(function (answer) {
        switch (answer.action) {
            case 'View products for sale':
                viewInven(function () {
                    managerPrompt();
                });
                break;

            case 'View low inventory':
                viewLowInven(function () {
                    managerPrompt();
                });
                break;

            case 'Add to inventory':
                addToInven();
                break;

            case 'Add a new product':
                addNewProd();
                break;
            //EXTRA CHOICE ADDED TO EXIT NODE
            case 'Exit':
                connection.end();
                break;
        }
    })
};

//PRINTS ALL THE ITEMS THAT ARE FOR SALE
var viewInven = function (cb) {
    connection.query('SELECT * FROM products', function (err, res) {
        //CREATES THE NEW CLI TABLE 
        var table = new Table({
            head: ['ID', 'Product Name', 'Department', 'Price', 'Stock Quantity']
        });
        console.log("HERE ARE ALL THE ITEMS AVAILABLE FOR SALE: ");
        console.log("===========================================");
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].id, res[i].product_name, res[i].department_name, res[i].price, res[i].quantity]);
        }
        //DISPLAYS THE PRODUCTS IN A TABLE VIEW USING CLI TABLE NPM PACKAGES. 
        console.log(table.toString());
        console.log("-----------------------------------------------");
        cb();
    })
}

//DISPLAYS THE LOW INVENTORY WHEN IT REACHES LESS THAN 5 
function viewLowInven(cb) {
    connection.query('SELECT * FROM products WHERE stock_quantity < 5',
        function (err, res) {
            if (err) throw err;
            //IF THERE ARE NO ITEMS IN QUANTITY ALERT THE USER AND RE-RUN.
            if (res.length === 0) {
                console.log("There are currently no items with Low Inventory!")
                cb();
            } else {
                //CREATES THE CLI TABLE 
                var table = new Table({
                    head: ['ID', 'Product Name', 'Department', 'Price', 'Stock Quantity']
                });
                for (var i = 0; i < res.length; i++) {
                    table.push([res[i].id, res[i].product_name, res[i].department_name, res[i].price, res[i].quantity]);
                }
                //DISPLAYS THE NEW TABLE 
                console.log(table.toString());
                console.log('These are all the items that are low on inventory.')
                cb();
            }
        });
}


//FUNCTION WHICH ADDS TO THE INVENTORY 
function addToInven() {
    var items = [];
    //GET ALL PRODUCTS FROM MYSQL
    connection.query('SELECT product_name FROM Products', function (err, res) {
        if (err) throw err;
        //PUSH PRODUCTS IN INVENTORY TO ARRAY
        for (var i = 0; i < res.length; i++) {
            items.push(res[i].product_name)
        }
        //ASK USER WHICH ITEMS FROM SHOWN WOULD THEY LIKE TO UPDATE?
        inquirer.prompt([{
            name: 'choices',
            type: 'checkbox',
            message: 'Which product would you like to add inventory for?',
            choices: items
        }]).then(function (user) {
            //IF NOTHING IS SELECTED RUN MANAGER PROMPT FUNCTION AGAIN
            if (user.choices.length === 0) {
                console.log('Oops! You didn\'t select anything!');
                managerPrompt();
            } else {

                addToInven2(user.choices);

            }
        });
    });
}


//ASK THE CUSTOMER HOW MANY ITEMS TO ADD?
function addToInven2(itemNames) {
    //SETS THE ITEM TO THE 1ST ITEM OF THE 1ST ELEMENT OF THE ARRAY AND RMEOVES THAT ELEMENT FORM THE ARRAY
    var item = itemNames.shift();
    var itemStock;
    //CONNECTION TO MYSQL TO QUERY AND GET QUANTITY FOR THAT ITEM 
    connection.query('SELECT quantity FROM products WHERE ?', {
        product_name: item
    }, function (err, res) {
        if (err) throw err;
        itemStock = res[0].stock_quantity;
        itemStock = parseInt(itemStock)
    });
    //ASK USER HOW MANY ITEMS TO ADD 
    inquirer.prompt([{
        name: 'amount',
        type: 'text',
        message: 'How many ' + item + ' would you like to add?',
        //HANDLES WHICH INPUT TO BE A NUMBER AND NOT A LETTER 
        validate: function (str) {
            if (isNaN(parseInt(str))) {
                console.log('Sorry that is not a valid number!');
                return false;
            } else {
                return true;
            }
        }
    }]).then(function (user) {
        var amount = user.amount
        amount = parseInt(amount);
        //UPDATES DATABASE PRODUCTS TO REFLECT THE NEW STOCK QUANTITY OF ITEMS.
        connection.query('UPDATE products SET ? WHERE ?', [{
            quantity: itemStock += amount
        }, {
            product_name: item
        }], function (err) {
            if (err) throw err;
        });
        //IF ITEMS STAYED IN THE ARRAY RUN THE ADDTOINVEN2 FUNCTION AGAIN 
        if (itemNames.length != 0) {
            addToInven2(itemNames);
        } else {
            //RUNS THE MANAGER PROMPT FUNCTION TO START OVER WHEN STOCK IS DEPLETED.
            console.log('Thank you, Your inventory has been updated.');
            managerPrompt();
        }
    });
}
//ADD NEW PRODUCTS TO THE TABLE. 
function addNewProd() {

    //PROMPTS FOR THE USER.
    inquirer.prompt([{
        name: 'id',
        type: 'text',
        message: 'Please choose the id number you would like to add to your product.',
    }, {
        name: 'item',
        type: 'text',
        message: 'Please enter the name of the product that you would like to add.'
    }, {
        name: 'department',
        type: 'text',
        message: 'Please enter the department name.',
    }, {
        name: 'price',
        type: 'text',
        message: 'Please enter the price for this product.'
    }, {
        name: 'stock',
        type: 'text',
        message: 'Plese enter the Stock Quantity for this item to be entered into current Inventory',
        validate: function (value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
    }
    ]).then(function (user) {
        //INSERTS THE NEW ITEM INTO THE DATABASE
        connection.query('INSERT INTO Products SET ?', {
            item_id: user.id,
            product_name: user.item,
            department_name: user.department,
            price: user.price,
            quantity: user.stock
        }, function (err) {
            if (err) throw err;
            console.log(user.item + ' has been added successfully to your inventory.');
            //THE MANAGER PROMPT FUNCTION IS RUN AGAIN.
            managerPrompt();
        });
    });
}


managerPrompt();
