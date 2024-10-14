const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let visitors = [];

// Endpoint to register a visitor
app.post('/register', async function(req, res) {
    const { username } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Fetch ISP and location information
    try {
        const ipResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const ipData = await ipResponse.json();
        
        const isp = ipData.isp || 'Unknown';
        const location = `${ipData.city}, ${ipData.regionName}, ${ipData.country}` || 'Unknown';

        visitors.push({ username, ip, isp, location });
        res.status(200).json({ message: 'Registered successfully!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing registration' });
    }
});

// New endpoint to track visits
app.post('/track-visit', async function(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Fetch ISP and location information
    try {
        const ipResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const ipData = await ipResponse.json();
        
        const isp = ipData.isp || 'Unknown';
        const location = `${ipData.city}, ${ipData.regionName}, ${ipData.country}` || 'Unknown';

        // Check if the visitor is already recorded
        const existingVisitor = visitors.find(visitor => visitor.ip === ip);
        if (!existingVisitor) {
            visitors.push({ username: 'Guest', ip, isp, location }); // Mark as a guest
        }
        res.status(200).json({ message: 'Visit recorded successfully!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing visit' });
    }
});

// Endpoint to get visitor data
app.get('/admin', function(req, res) {
    res.json(visitors);
});

app.listen(PORT, function() {
    console.log(`Server is running on http://localhost:${PORT}`);
});
