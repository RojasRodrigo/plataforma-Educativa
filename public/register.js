document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
    const msgEl = document.getElementById('message');
  
    if (data.success) {
      msgEl.style.color = 'green';
      msgEl.textContent = '¡Usuario registrado! Redirigiendo...';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      msgEl.style.color = 'red';
      msgEl.textContent = data.message;
    }
  });
  