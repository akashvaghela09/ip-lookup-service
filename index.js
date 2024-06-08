const express = require("express");
const axios = require("axios");
const geoip = require("geoip-lite");
const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", true);

app.get("/ip-lookup", async (req, res) => {
    let clientIp = req.ip;
    let xForwardedFor = req.headers["x-forwarded-for"];
    let ipv4 = "";
    let ipv6 = "";
    let ipList = [];

    if (xForwardedFor) {
        ipList = xForwardedFor.split(",");
        ipList.forEach((ip) => {
            ip = ip.trim();
            if (ip.includes(":")) {
                ipv6 = ip;
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
        ipv4: ipv4 || "",
        ipv6: ipv6 || "",
    };

    try {
        let res = await axios.get(
            `http://ip-api.com/json/${ipv4 ? ipv4 : ipv6}`
        );
        ipInfoData = res.data;
    } catch (error) {
        console.log("error in ip-info : ", error);
    }

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
        response.geo = { error: "Location not found" };
    }

    res.json(response);
});

app.get("/ip8", async (req, res) => {
    try {
        const response = await axios.post("https://api2.ip8.com/ip/info", {
            clientIP: "43.249.228.84",
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/ip4", async (req, res) => {
    try {
        const clientIP = req.ip;
        console.log("ipv4 clientIP: ", clientIP);
        const response = await axios.post("https://ip4.ip8.com/", {
            clientIP,
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/ip6", async (req, res) => {
    try {
        const clientIP = req.ip;
        console.log("ipv6 clientIP: ", clientIP);
        const response = await axios.post("https://ip6.ip8.com/", {
            clientIP,
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
