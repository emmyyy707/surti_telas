async function main() {
  const res = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@surtitelas.com', password: 'Admin123!' }),
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
}

main();
