const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 5000;

// Set up trust proxy to get the real IP address behind a proxy
app.set("trust proxy", true);

app.get("/ip-lookup", async (req, res) => {
    // Get the IP address of the client
    let ipAddress = req.ip;
    let ipInfoData = {};

    try {
        const ipInfoResponse = await axios.get(
            `https://ipinfo.io/${ipAddress}?token=${process.env.IPINFO_TOKEN}`
        );
        ipInfoData = ipInfoResponse.data;
    } catch (error) {
        console.error("Error fetching data from ipinfo:", error);
    }

    let ipv4 = "";
    let ipv6 = "";

    try {
        const ipv4Response = await axios.get(`https://api.ipify.org`);
        ipv4 = ipv4Response.data;
    } catch (error) {
        console.error("Error fetching IPv4 address:", error);
    }

    try {
        const ipv6Response = await axios.get(`https://api6.ipify.org`);
        ipv6 = ipv6Response.data;
    } catch (error) {
        console.error("Error fetching IPv6 address:", error);
    }

    res.json({
        ipv4: ipv4,
        ipv6: ipv6,
        ipInfo: ipInfoData,
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
