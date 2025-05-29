
async function fetchUserName() {
  const authToken = localStorage.getItem('authToken'); 

  if (!authToken) {
    console.error('No authentication token found. User must be logged in.');
    return null;
  }

  try {
    const response = await fetch('/api/user/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` 
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch user name:', response.status, errorData.message);
      if (response.status === 401) {
         console.log('Authentication failed, logging out...');
      }
      return null;
    }

    const responseData = await response.json();

    if (responseData.success) {
      const userName = responseData.data.name;
      console.log('Fetched user name:', userName);

      const userNameElement = document.getElementById('userNameDisplay');
      if (userNameElement) {
        userNameElement.textContent = `Welcome, ${userName}!`;
      }

      return userName;
    } else {
      console.error('Backend reported success: false', responseData.message);
      return null;
    }

  } catch (error) {
    console.error('Network or unexpected error:', error);
    return null;
  }
}
