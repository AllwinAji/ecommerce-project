const cart = document.querySelector('.cart');
const cartBtn= document.querySelector('.cart-btn');
const closeBtn = document.querySelector('.close-cart-btn');
const overlay = document.querySelector('.overlay');
//const addToCartBtn= document.querySelector('.add-to-cart-btn');
const cartcount = document.querySelector('.cart-count');
const cartItemsContainer = document.querySelector(".cart-items");
const API = "https://ecommerce-project-wosr.onrender.com/api";

const user_id = localStorage.getItem("user_id");

if(!user_id){
    window.location.href="login.html";
}

let cartItems = [];

function openCart() {
    cart.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    cart.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto";
}

function addToCart(id) {

    const user_id = localStorage.getItem("user_id");


    if(!user_id){
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }
    fetch(`${API}/cart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: user_id,
            product_id: id,
            quantity: 1
        })
    })
    .then(res => res.json())
    .then(updatedCart => {
        cartItems = updatedCart;   
        renderCart();
    })
    .catch(err => console.error("Error:", err));
}

function renderCart() {
    console.log("Cart items:", cartItems);
    const container = document.querySelector(".cart-items");
    container.innerHTML = "";
    if (cartItems.length === 0) {

        container.innerHTML = "<p class='empty-cart'>Your cart is empty</p>";

        document.querySelector(".cart-count").textContent = 0;
        document.querySelector(".cart-total").textContent = "Total: $0.00";

        return;

    }

    let totalItems = 0;
    let totalPrice = 0;

    cartItems.forEach(item => {
        totalItems += item.quantity;
        totalPrice += Number(item.price) * item.quantity;

        const element = document.createElement("div");
        element.className = "cart-item";

        element.innerHTML = `
            <img src="${item.image}" width="50">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="quantity-controls">
                    <button class="decrease-btn" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-btn" data-id="${item.id}">+</button>
                </div>
                <p>$${item.price}</p>
                <button class="remove-btn" data-id="${item.id}">Remove</button>
            </div>
        `;

        container.appendChild(element);
    });

    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            removeFromCart(id);
        });
    });

    document.querySelector(".cart-count").textContent = totalItems;
    document.querySelector(".cart-total").textContent = "Total: $" + totalPrice.toFixed(2);
    
}

function loadCart() {
    
    const user_id = localStorage.getItem("user_id");
    fetch(`${API}/cart/${user_id}`)
        .then(res => res.json())
        .then(data => {
            cartItems = data;
            renderCart();
        })
        .catch(err => console.error("Error loading cart:", err));
}

function removeFromCart(id) {
    
    const user_id = localStorage.getItem("user_id");
    fetch(`${API}/cart/${user_id}/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())   // convert response → JSON
    .then(updatedCart => {

        console.log("Updated cart:", updatedCart);

        cartItems = updatedCart;
        renderCart();

    })
    .catch(err => console.error("Delete error:", err));
}

function increaseQuantity(id) {

    const user_id = localStorage.getItem("user_id");

    fetch(`${API}/cart/increase/${user_id}/${id}`, {
        method: "PATCH"
    })
    .then(res => res.json())
    .then(updatedCart => {

        cartItems = updatedCart;
        renderCart();

    });

}

function decreaseQuantity(id) {

    const user_id = localStorage.getItem("user_id");

    fetch(`${API}/cart/decrease/${user_id}/${id}`, {
        method: "PATCH"
    })
    .then(res => res.json())
    .then(updatedCart => {

        cartItems = updatedCart;
        renderCart();

    });

}

function loadProducts() {

    fetch(`${API}/products`)
        .then(res => res.json())
        .then(products => {

            const container = document.querySelector(".products");
            container.innerHTML = "";

            products.forEach(product => {

                const card = document.createElement("div");
                card.className = "product-card";

                card.innerHTML = `
                    <img src="${product.image}">
                    <h3>${product.name}</h3>
                    <p>$${product.price}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        Add to Cart
                    </button>
                `;

                container.appendChild(card);

            });

        });

}

function clearCart() {

    const user_id = localStorage.getItem("user_id");

    fetch(`${API}/cart`, {
        method: "DELETE",
        body: JSON.stringify({ user_id: user_id }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(updatedCart => {

        cartItems = updatedCart;
        renderCart();

    })
    .catch(err => console.error("Clear cart error:", err));

}

function checkout() {
    const user_id = localStorage.getItem("user_id");
    fetch(`${API}/checkout`, {
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            user_id: user_id
        })
    })
    .then(res => res.json())
    .then(data => {

        console.log("Checkout response:", data);

        if (data.error) {
            alert(data.error);
            return;
        }

        alert(data.message);

        loadCart();   // refresh cart

    })
    .catch(err => {
        console.error("Checkout error:", err);
    });

}

function logout(){

    localStorage.removeItem("user_id");

    window.location.href = "login.html";

}

cartBtn.addEventListener("click", openCart);
closeBtn.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.querySelector(".checkout-btn").addEventListener("click", checkout);
document.querySelector(".products").addEventListener("click", (e) => {

    if (e.target.classList.contains("add-to-cart-btn")) {

        const id = e.target.dataset.id;
        addToCart(Number(id));

    }

});
document.querySelector(".clear-cart-btn").addEventListener("click", clearCart);

cartItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
        const id = e.target.dataset.id;
        console.log("Deleting:", id);
        removeFromCart(id);
    }

    if (e.target.classList.contains("increase-btn")) {

        const id = e.target.dataset.id;
        console.log("Increase:", id);
        increaseQuantity(id);

    }

    if (e.target.classList.contains("decrease-btn")) {

        const id = e.target.dataset.id;
        console.log("Decrease:", id);
        decreaseQuantity(id);

    }

});


loadProducts();
loadCart();

