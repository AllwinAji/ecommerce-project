function login(){

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("https://ecommerce-project-wosr.onrender.com/api/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:email,
            password:password
        })
    })
    .then(res=>res.json())
    .then(data=>{

        if(data.error){
            alert(data.error);
            return;
        }

        localStorage.setItem("user_id",data.user_id);

        alert("Login successful");

        window.location.href="index.html";

    });

}
