const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

let visitorLogs = [];

app.use(express.json());
app.use(express.static('public')); // Assuming your HTML and CSS files are in the 'public' directory

// Track visitor information
app.post('/track-visit', async (req, res) => {
    // Get the visitor IP address from the x-forwarded-for header
    const visitorIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipAddress = visitorIP.split(',')[0]; // Take the first IP if multiple

    // Use an external API to get location details based on IP
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const locationData = await response.json();

    // Push visitor info to logs
    visitorLogs.push({
        ip: ipAddress,
        city: locationData.city || 'Unknown',
        region: locationData.region || 'Unknown',
        country: locationData.country || 'Unknown',
        isp: locationData.org || 'Unknown',
        timestamp: new Date().toLocaleString() // Format timestamp
    });

    res.status(200).send('Tracked');
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Admin Page</title>
            <link rel="stylesheet" href="styles.css">
        </head>
        <body>
            <h1>Visitor Logs</h1>
            <table>
                <tr>
                    <th>IP Address</th>
                    <th>City</th>
                    <th>Region</th>
                    <th>Country</th>
                    <th>ISP</th>
                    <th>Timestamp</th>
                </tr>
                ${visitorLogs.map(visitor => `
                    <tr>
                        <td>${visitor.ip}</td>
                        <td>${visitor.city}</td>
                        <td>${visitor.region}</td>
                        <td>${visitor.country}</td>
                        <td>${visitor.isp}</td>
                        <td>${visitor.timestamp}</td>
                    </tr>
                `).join('')}
            </table>
        </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
