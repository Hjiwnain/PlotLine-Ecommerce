import { json } from 'express';
import db from '../db/database.js';
import { verifyToken,getUsername } from '../middlewares/jwt.js';
import { escape } from 'mysql2';

//Admin API
async function totalOrders(req, res){
    // verifyToken(req,res);
    const username = getUsername(req.headers['authorization']);
    if(username === "AdminPlot"){
        console.log(username);
        try {
            const [orders] = await db.query(`
                SELECT * 
                FROM Total_orders
                ORDER BY order_id DESC
            `);

            if (!orders.length) {
                return res.status(404).json({ message: 'No orders found' });
            }

            res.json(orders);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Database error', error });
        }
    }
    else{
        res.status(403).json({message:"You are not authorized to access this resource"})
    }
};

//Function To Check For OrderDetails
async function orderDetails(req, res){
    const username = getUsername(req.headers['authorization']);
    if(username === "AdminPlot"){
        try {
            const [orders] = await db.query(`
                SELECT order_id 
                FROM Total_orders 
                WHERE username = ?
            `, [username]);

            if (!orders.length) {
                return res.status(404).json({ message: 'No orders found for this user' });
            }

            const orderIds = orders.map(order => order.order_id);

            const [orderDetails] = await db.query(`
                SELECT * 
                FROM Order_items 
                WHERE order_id IN (?)
            `, [orderIds]);

            res.json(orderDetails);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Database error', error });
        }
    }
    else{
        res.status(403).json({message:"You are not authorized to access this resource"});
    }
};


//// 1. Add a new stock item 'stock/add'
async function addStock(req, res){
    const { name, description, price, category, quantity, image_url } = req.body;
    const username = getUsername(req.headers['authorization']);
    if(username === "AdminPlot"){
        try {
            try {
                await db.query('INSERT INTO items (name, description, price, category, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)', 
                    [name, description, price, category, quantity, image_url]);
                res.json({ message: 'Item added to stock successfully!' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Database error', error });
            }
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Database error', error });
        }
    }
    else{
        res.status(403).json({message:"You are not authorized to access this resource"});
    }
};

// 2. Remove an existing stock item '/stock/remove'
async function removeStock(req, res){
    const { name } = req.body;
    const username = getUsername(req.headers['authorization']);
    if(username === "AdminPlot"){
        try {
            try {
                await db.query('DELETE FROM items WHERE name = ?', [name]);
                res.json({ message: 'Item removed from stock successfully!' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Database error', error });
            }
        }catch(error){
            res.status(500).json({ message: 'Database error', error });
        }
    }
    else{
        res.status(403).json({message:"You are not authorized to access this resource"});
    }
};

// 3. Update the details of a stock item (This API will update all provided details of an item)
async function updateStock(req, res){
    const username = getUsername(req.headers['authorization']);
    if(username === "AdminPlot"){
        try {
            const { name, description, price, category, quantity, image_url } = req.body;
            try {
                await db.query('UPDATE items SET description = ?, price = ?, category = ?, quantity = ?, image_url = ? WHERE name = ?', 
                    [description, price, category, quantity, image_url, name]);
                res.json({ message: 'Item details updated successfully!' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Database error', error });
            }
        }catch(error){
            res.status(500).json({ message: 'Database error', error });
        }
    }
    else{
        res.status(403).json({message:"You are not authorized to access this resource"});
    }
};

// 4. Increment or decrement the quantity of a stock item '/stock/quantity'
async function stockQuantity(req, res){
    const username = getUsername(req.headers['authorization']);
    if(username === "AdminPlot"){
        try {
            const { name, change } = req.body; // change can be positive (increment) or negative (decrement)
            try {
                await db.query('UPDATE items SET quantity = quantity + ? WHERE name = ?', [change, name]);
                res.json({ message: 'Stock quantity updated successfully!' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Database error', error });
            }
        }catch(error){
            res.status(500).json({ message: 'Database error', error });
        }
    }
    else{
        res.status(403).json({message:"You are not authorized to access this resource"});
    }
};


export const adminRoute = {
    totalOrders,
    orderDetails,
    addStock,
    removeStock,
    updateStock,
    stockQuantity
}