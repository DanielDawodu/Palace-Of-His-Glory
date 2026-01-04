
// import axios from 'axios'; // Removed to use native fetch

async function testCreateEvent() {
    try {
        // Login
        const loginRes = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Daniel',
                password: 'Daniel@123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);

        const cookie = loginRes.headers.get('set-cookie');
        if (!cookie) console.warn('No cookie received, proceeding anyway (might fail if auth required)');

        // Create Event
        const res = await fetch('http://localhost:3000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(cookie ? { 'Cookie': cookie } : {})
            },
            body: JSON.stringify({
                title: "Test Event",
                description: "Test Description",
                date: new Date().toISOString(),
                imageUrl: "https://example.com/image.jpg",
                videoUrl: ""
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Create event failed: ${res.status} ${errText}`);
        }

        const data = await res.json();
        console.log('Success:', data);
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

testCreateEvent();
