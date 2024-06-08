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
    console.log("req.ip : ", req.ip);
    // const { ip } = req.params;
    let clientIp = req.ip;

    // Get the X-Forwarded-For header if available
    let xForwardedFor = req.headers["x-forwarded-for"];

    // Extract IPv4 and IPv6 addresses if available
    let ipv4 = "";
    let ipv6 = "";
    let ipList = [];

    if (xForwardedFor) {
        // Split the X-Forwarded-For header value
        ipList = xForwardedFor.split(",");
        console.log("ips: ", ipList);
        // Iterate through the IP addresses
        ipList.forEach((ip) => {
            ip = ip.trim();
            if (ip.includes(":")) {
                ipv6 = ip; // Assuming it's an IPv6 address
            }
        });
    }

    if (clientIp.includes(":")) {
        ipv6 = clientIp;
    } else {
        ipv4 = clientIp;
    }


    let geoData = geoip.lookup(clientIp);
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
    if (ipInfoData && ipInfoData?.status === "success") {
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
            org: ipInfoData.org || "",
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
