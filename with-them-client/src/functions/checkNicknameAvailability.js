async function checkNicknameAvailability(nickname) {
    try {
        const response = await fetch('http://localhost:8080/api/nickname/check', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result.available; 
    } catch (error) {
        console.error('An error occurred:', error);
        throw error; 
    }
}

export default checkNicknameAvailability;
