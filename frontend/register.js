function register() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("https://ecommerce-project-wosr.onrender.com/api/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })

    })
    .then(res => res.json())
    .then(data => {

        if (data.error) {

            alert(data.error);
            return;

        }
        if(!name || !email || !password){
            alert("Please fill all fields");
            return;
        }

        localStorage.setItem("user_id", data.user_id);
        alert("Registration successful!");

        window.location.href = "login.html";

    })
    .catch(err => {

        console.error(err);
        alert("Registration failed");

    });

}
