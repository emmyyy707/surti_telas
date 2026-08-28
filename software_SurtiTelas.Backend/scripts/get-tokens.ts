import axios from 'axios';

async function getToken() {
  const base = 'http://localhost:3000/api/v1';

  // Try admin login
  try {
    const adminRes = await axios.post(`${base}/auth/login`, {
      email: 'admintest@surtitelas.com',
      password: 'SurtiTelas2025*',
    });
    console.log('ADMIN_TOKEN:', adminRes.data.token || adminRes.data.data?.token);
    return;
  } catch (e: any) {
    console.log('Admin login failed:', e.response?.data?.message || e.message);
  }

  // Try client login
  try {
    const clientRes = await axios.post(`${base}/auth/login`, {
      email: 'prueba-customorderitemid@surtitelas.com',
      password: 'SurtiTelas2025*',
    });
    console.log('CLIENT_TOKEN:', clientRes.data.token || clientRes.data.data?.token);
  } catch (e: any) {
    console.log('Client login failed:', e.response?.data?.message || e.message);
  }
}

getToken();
