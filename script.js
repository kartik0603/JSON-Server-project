document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000';
    const productList = document.getElementById('product-list');
    const cartList = document.getElementById('cart-list');
    const checkoutButton = document.getElementById('checkout-button');
  
    // Function to check if user is logged in
    const isUserLoggedIn = () => {
      return localStorage.getItem('user') !== null;
    };
  
    // Redirect to login page if not logged in
    if (!isUserLoggedIn() && window.location.pathname !== '/signup.html' && window.location.pathname !== '/login.html') {
      window.location.href = 'signup.html';
    }
  
    // Fetch and display products
    if (productList) {
      fetch(`${apiUrl}/products`)
        .then(response => response.json())
        .then(products => {
          productList.innerHTML = products.map(product => `
            <div>
              <img src="${product.img}" alt="${product.name}">
              <h3>${product.name}</h3>
              <p>Price: $${product.price}</p>
              <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
          `).join('');
        });
    }
  
    // Handle sign up
    if (document.getElementById('signup-form')) {
      document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
  
        fetch(`${apiUrl}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(user => {
          alert('Sign up successful! Please log in.');
          window.location.href = 'login.html';
        });
      });
    }
  
    // Handle login
    if (document.getElementById('login-form')) {
      document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
  
        fetch(`${apiUrl}/users`)
          .then(response => response.json())
          .then(users => {
            const user = users.find(user => user.email === email && user.password === password);
            if (user) {
              alert('Login successful!');
              localStorage.setItem('user', JSON.stringify(user));
              window.location.href = 'index.html';
            } else {
              alert('Invalid email or password');
            }
          });
      });
    }
  
    // Handle add to cart
    window.addToCart = (productId) => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('You need to log in first.');
        window.location.href = 'login.html';
        return;
      }
  
      fetch(`${apiUrl}/products/${productId}`)
        .then(response => response.json())
        .then(product => {
          fetch(`${apiUrl}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...product, userId: user.id })
          })
          .then(response => response.json())
          .then(cartItem => {
            alert(`${cartItem.name} added to cart!`);
          });
        });
    };
  
    // Fetch and display cart items
    if (cartList) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('You need to log in first.');
        window.location.href = 'login.html';
        return;
      }
  
      fetch(`${apiUrl}/cart?userId=${user.id}`)
        .then(response => response.json())
        .then(cartItems => {
          cartList.innerHTML = cartItems.map(item => `
            <div>
              <img src="${item.img}" alt="${item.name}">
              <h3>${item.name}</h3>
              <p>Price: $${item.price}</p>
            </div>
          `).join('');
        });
    }
  
    // Handle checkout
    if (checkoutButton) {
      checkoutButton.addEventListener('click', () => {
        const user = JSON.parse(localStorage.getItem('user'));
        fetch(`${apiUrl}/cart?userId=${user.id}`)
          .then(response => response.json())
          .then(cartItems => {
            Promise.all(cartItems.map(item => {
              return fetch(`${apiUrl}/cart/${item.id}`, {
                method: 'DELETE'
              });
            }))
            .then(() => {
              alert('Checkout successful!');
              cartList.innerHTML = '';
            });
          });
      });
    }
  });
  