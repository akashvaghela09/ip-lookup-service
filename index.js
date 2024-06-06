const express = require("express");
const geoip = require("geoip-lite");
const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for getting the real IP address behind a proxy
app.set("trust proxy", true);

app.get("/api/location", (req, res) => {
    // Get the IP address of the request
    let ipAddress = req.ip;
    let ipv4 = "";
    let ipv6 = "";

    if (ipAddress === "::1" || ipAddress === "::ffff:127.0.0.1") {
        // For local testing, you can use a known public IP address
        ipAddress = "8.8.8.8"; // Google's public DNS for testing purposes
    } else if (ipAddress.startsWith("::ffff:")) {
        ipv4 = ipAddress.split(":").pop(); // Extract the IPv4 address
    } else if (ipAddress.includes(":")) {
        ipv6 = ipAddress; // This is an IPv6 address
    } else {
        ipv4 = ipAddress; // This is an IPv4 address
    }

    // Get geographical data for the IP address
    const geo = geoip.lookup(ipAddress);

    const response = {
        ipv4: ipv4,
        ipv6: ipv6,
        geo: {},
    };

    if (geo) {
        response.geo = {
            city: geo.city,
            region: geo.region,
            country: geo.country,
            latitude: geo.ll[0],
            longitude: geo.ll[1],
        };
        response.geo_complete = geo;
    } else {
        response.geo = { error: "Location not found" };
    }

    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
