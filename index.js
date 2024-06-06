const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const axios = require("axios");
const geoip = require("geoip-lite");
const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for getting the real IP address behind a proxy
app.set("trust proxy", true);

app.get("/ip-lookup", async (req, res) => {
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

    let geoData = geoip.lookup(ipAddress);
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
    if (ipInfoData && ipInfoData?.success) {
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
        console.log("set geo data ", geo);
    } else {
        // If no data available from either source
        response.geo = { error: "Location not found" };
    }

    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
