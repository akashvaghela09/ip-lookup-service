const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 5000;

// Set up trust proxy to get the real IP address behind a proxy
app.set("trust proxy", true);

app.get("/ip-lookup", async (req, res) => {
    let clientIpAddress =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    console.log("clientIpAddress: ", clientIpAddress);
    let ipInfoData = {};
    let ipv4 = "";
    let ipv6 = "";

    try {
        // Fetch IP information from ipinfo.io
        const ipInfoResponse = await axios.get(
            `https://ipinfo.io/${clientIpAddress}?token=${process.env.IPINFO_TOKEN}`
        );
        ipInfoData = ipInfoResponse.data;
    } catch (error) {
        console.error("Error fetching data from ipinfo:", error);
    }

    try {
        // Fetch IPv4 address
        const ipv4Response = await axios.get("https://api.ipify.org");
        console.log("ipv4Response: ", ipv4Response);
        ipv4 = ipv4Response.data;
    } catch (error) {
        console.error("Error fetching IPv4 address:", error);
    }

    try {
        // Fetch IPv6 address
        const ipv6Response = await axios.get("https://api6.ipify.org");
        console.log("ipv6Response: ", ipv6Response);
        ipv6 = ipv6Response.data;
    } catch (error) {
        console.error("Error fetching IPv6 address:", error);
    }

    res.json({
        clientIpAddress: clientIpAddress,
        ipv4: ipv4,
        ipv6: ipv6,
        ipInfo: ipInfoData,
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
