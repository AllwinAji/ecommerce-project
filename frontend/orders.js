function loadOrders() {

    const user_id = localStorage.getItem("user_id");

    fetch(`https://ecommerce-project-wosr.onrender.com/api/orders/${user_id}`)
    .then(res => res.json())
    .then(data => {

        const container = document.querySelector(".orders-container");
        container.innerHTML = "";

        const orders = {};

        data.forEach(item => {

            if (!orders[item.order_id]) {
                orders[item.order_id] = {
                    total: item.total,
                    created_at: item.created_at,
                    items: []
                };
            }

            orders[item.order_id].items.push(item);

        });

        Object.keys(orders).forEach(orderId => {

            const order = orders[orderId];

            const orderDiv = document.createElement("div");
            orderDiv.className = "order-card";

            let itemsHTML = "";

            order.items.forEach(product => {

                itemsHTML += `
                    <p>${product.name} (x${product.quantity}) - $${product.price}</p>
                `;

            });

            orderDiv.innerHTML = `
                <h3>Order #${orderId}</h3>
                <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
                ${itemsHTML}
                <strong>Total: $${order.total}</strong>
                <hr>
            `;

            container.appendChild(orderDiv);

        });

    });

}

loadOrders();
