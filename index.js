const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const axios = require("axios");
const geoip = require("geoip-lite");
const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for getting the real IP address behind a proxy
app.set("trust proxy", true);

app.get("/ip-lookup/:ip", async (req, res) => {
    console.log("req.ip : ", req.ip);
    const { ip } = req.params;
    console.log("q: ", ip);
    // Get the IP address of the request
    let ipAddress = ip;
    let ipv4 = "";
    let ipv6 = "";
    console.log("ipAddress: ", ipAddress);

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

    let geoData = geoip.lookup(ipAddress);
    console.log("geoData: ", geoData);
    let ipInfoData = {};

    let response = {
        ipv4: ipv4 || "", // Set ipv4 to empty string if not found
        ipv6: ipv6 || "", // Set ipv6 to empty string if not found
    };

    try {
        let res = await axios.get(
            `http://ip-api.com/json/${ipv4 ? ipv4 : ipv6}`
        );

        ipInfoData = res.data;
        console.log("ipInfoData: ", ipInfoData);
    } catch (error) {
        console.log("err in ip-info : ", err);
    }

    // Prepare response based on ipInfoData
    if (ipInfoData && ipInfoData?.status) {
        response = {
            ...response,
            country: ipInfoData.country || "",
            countryCode: ipInfoData.countryCode || "",
            region: ipInfoData.region || "",
            regionName: ipInfoData.regionName || "",
            city: ipInfoData.city || "",
            zip: ipInfoData.zip || "",
            latitude: ipInfoData.lat || "",
            longitude: ipInfoData.lon || "",
            timezone: ipInfoData.timezone || "",
            isp: ipInfoData.isp || "",
        };
    } else if (geoData) {
        // Fallback to geo lite package
        response = {
            ...response,
            city: geoData.city || "",
            region: geoData.region || "",
            country: geoData.country || "",
            latitude: geoData.ll ? geoData.ll[0] : "",
            longitude: geoData.ll ? geoData.ll[1] : "",
            timezone: geoData.timezone || "",
        };
    } else {
        // If no data available from either source
        response.geo = { error: "Location not found" };
    }

    res.json(response);
});

app.get("/check", async (req, res) => {
    let clientIp = req.ip;

    // Get the X-Forwarded-For header if available
    let xForwardedFor = req.headers["x-forwarded-for"];

    // Extract IPv4 and IPv6 addresses if available
    let ipv4 = "";
    let ipv6 = "";

    if (xForwardedFor) {
        // Split the X-Forwarded-For header value
        let ips = xForwardedFor.split(",");
        console.log("ips: ", ips);

        // Iterate through the IP addresses
        ips.forEach((ip) => {
            ip = ip.trim();
            if (ip.includes(":")) {
                ipv6 = ip; // Assuming it's an IPv6 address
            } else {
                ipv4 = ip; // Assuming it's an IPv4 address
            }
        });
    } else {
        // If X-Forwarded-For header is not present, use req.ip
        if (clientIp.includes(":")) {
            ipv6 = clientIp;
        } else {
            ipv4 = clientIp;
        }
    }

    // Respond with the IP addresses
    res.json({
        ipv4: ipv4,
        ipv6: ipv6,
        ips: ips,
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
