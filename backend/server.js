const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "mysql.railway.internal",
    user: "root",
    password: "CxtfHDWWpvCoBaCvjaeXPkYzwyWlZSzG",
    database: "railway",
    port: 3306
});

app.get("/api/cart/:user_id", (req, res) => {
    const user_id = req.params.user_id;
    const query = `
        SELECT 
            c.product_id AS id,
            c.quantity,
            p.name,
            p.price,
            p.image
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
});

app.post("/api/cart", (req, res) => {

    const { user_id, product_id, quantity } = req.body;

    const query = `
        INSERT INTO cart (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        quantity = quantity + 1
    `;

    db.query(query, [user_id, product_id, quantity], (err) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        const getCartQuery = `
            SELECT 
                c.product_id AS id,
                c.quantity,
                p.name,
                p.price,
                p.image
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `;

        db.query(getCartQuery, [user_id], (err, results) => {

            if (err) {
                return res.status(500).json({ error: "Fetch failed" });
            }

            res.json(results);

        });

    });

});

app.delete("/api/cart/:user_id/:id", (req, res) => {

    const user_id = req.params.user_id;
    const productId = req.params.id;

    const deleteQuery = "DELETE FROM cart WHERE user_id=? AND product_id=?";

    db.query(deleteQuery, [user_id, productId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Delete failed" });
        }

        const getCartQuery = `
            SELECT 
                c.product_id AS id,
                c.quantity,
                p.name,
                p.price,
                p.image
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `;

        db.query(getCartQuery, [user_id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Fetch failed" });
            }

            res.json(results);
        });
    });
});

app.patch("/api/cart/increase/:user_id/:id", (req, res) => {

    const user_id = req.params.user_id;
    const id = req.params.id;

    const query = `
        UPDATE cart
        SET quantity = quantity + 1
        WHERE product_id = ? AND user_id = ?
    `;

    db.query(query, [id, user_id], (err) => {
        if (err) return res.status(500).json({ error: "Update failed" });

        const getCartQuery = `
            SELECT 
                c.product_id AS id,
                c.quantity,
                p.name,
                p.price,
                p.image
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `;

        db.query(getCartQuery, [user_id], (err, results) => {
            if (err) return res.status(500).json({ error: "Fetch failed" });

            res.json(results);
        });
    });

});

app.patch("/api/cart/decrease/:user_id/:id", (req, res) => {
    const user_id = req.params.user_id;

    const id = req.params.id;

    const decreaseQuery = `
        UPDATE cart
        SET quantity = quantity - 1
        WHERE product_id = ? AND user_id = ?
    `;

    db.query(decreaseQuery, [id, user_id], (err) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Update failed" });
        }

        const deleteZeroQuery = `
            DELETE FROM cart
            WHERE quantity <= 0 AND user_id = ?
        `;

        db.query(deleteZeroQuery, [user_id], (err) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Delete failed" });
            }

            const getCartQuery = `
                SELECT 
                    c.product_id AS id,
                    c.quantity,
                    p.name,
                    p.price,
                    p.image
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            `;

            db.query(getCartQuery, [user_id], (err, results) => {

                if (err) {
                    return res.status(500).json({ error: "Fetch failed" });
                }

                res.json(results);

            });

        });

    });

});

app.get("/api/products", (req, res) => {

    const query = "SELECT * FROM products";

    db.query(query, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch products" });
        }

        res.json(results);

    });

});

app.delete("/api/cart", (req, res) => {

    const { user_id } = req.body;

    const query = `
        DELETE FROM cart
        WHERE user_id = ?
    `;

    db.query(query, [user_id], (err) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Clear cart failed" });
        }

        res.json([]);

    });

});

app.post("/api/checkout", (req, res) => {

    const {user_id} = req.body;

    const getCartQuery = `
        SELECT c.product_id, c.quantity, p.price
        FROM cart c
        JOIN products p ON c.product_id = p.id WHERE c.user_id = ?
    `;

    db.query(getCartQuery, [user_id], (err, cartItems) => {

        if (err) {
            console.error("CART FETCH ERROR:", err);
            return res.status(500).json({ error: "Cart fetch failed" });
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        let total = 0;

        cartItems.forEach(item => {
            total += Number(item.price) * Number(item.quantity);
        });

        console.log("TOTAL:", total);

        const orderQuery = "INSERT INTO orders (user_id, total) VALUES (?, ?)";

        db.query(orderQuery, [user_id, total], (err, result) => {

            if (err) {
                console.error("ORDER INSERT ERROR:", err);
                return res.status(500).json({ error: "Order failed" });
            }

            const orderId = result.insertId;

            const values = cartItems.map(item => [
                orderId,
                item.product_id,
                item.quantity,
                item.price
            ]);

            const itemsQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ?
            `;

            db.query(itemsQuery, [values], (err) => {

                if (err) {
                    console.error("ORDER ITEMS ERROR:", err);
                    return res.status(500).json({ error: "Order items failed" });
                }

                db.query("DELETE FROM cart WHERE user_id = ?", [user_id], (err) => {

                    if (err) {
                        console.error("CART CLEAR ERROR:", err);
                        return res.status(500).json({ error: "Cart clear failed" });
                    }

                    res.json({
                        message: "Order placed successfully!"
                    });

                });

            });

        });

    });

});

app.get("/api/orders/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    const query = `
        SELECT 
            o.id AS order_id,
            o.total,
            o.created_at,
            p.name,
            oi.quantity,
            oi.price
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `;

    db.query(query, [user_id], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch orders" });
        }

        res.json(results);

    });

});

app.post("/api/register",(req,res)=>{
    const {name,email,password} = req.body;

    const query = `
    INSERT INTO users (name,email,password)
    VALUES (?,?,?)
    `;

    db.query(query,[name,email,password],(err,result)=>{

        if(err){
            return res.status(500).json({error:"Registration failed"});
        }

        res.json({
            message:"User created",
            user_id: result.insertId
        });
    });
});

app.post("/api/login",(req,res)=>{

    const {email,password} = req.body;

    const query = `
    SELECT * FROM users
    WHERE email=? AND password=?
    `;

    db.query(query,[email,password],(err,results)=>{

        if(err){
            return res.status(500).json({error:"Login failed"});
        }

        if(results.length===0){
            return res.status(401).json({error:"Invalid credentials"});
        }

        const user = results[0];

        res.json({
            message:"Login success",
            user_id:user.id
        });

    });

});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");

    app.listen(5000, () => {
        console.log("Server running on port 5000");
    });
});

