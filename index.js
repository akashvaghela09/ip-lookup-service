require("dotenv").config();
const express = require("express");
const axios = require("axios");
const geoip = require("geoip-lite");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
let Country = require("country-state-city").Country;
let State = require("country-state-city").State;

app.set("trust proxy", true);
app.use(
    cors({
        origin: "*",
    })
);

app.get("/ip/:ipAddress", async (req, res) => {
    const { ipAddress } = req.params;
    let response = {};

    try {
        let apiResponse = await axios.post("https://api2.ip8.com/ip/info", {
            ip: [ipAddress],
        });
        let ip8Data = apiResponse.data.data[ipAddress];

        // Optional cleanup
        delete ip8Data.headers;
        delete ip8Data.useragent;
        delete ip8Data.isTorIp;
        delete ip8Data.ct;

        response = { ...ip8Data };
    } catch (error) {
        console.log("Failed for ip2.ip8:", error);

        // Use geoip-lite as fallback
        let geoData = geoip.lookup(ipAddress);
        if (geoData) {
            response = {
                geoip: {
                    city: geoData.city || null,
                    country:
                        Country.getCountryByCode(geoData?.country).name || null,
                    continent: geoData.timezone.split("/")[0] || null,
                    latitude: geoData.ll ? geoData.ll[0] : null,
                    longitude: geoData.ll ? geoData.ll[1] : null,
                    postalcode: geoData.postal || null,
                    region:
                        State.getStateByCodeAndCountry(
                            geoData?.region,
                            geoData?.country
                        ).name || null,
                    isocode: geoData.country || null,
                    timezone: geoData.timezone || null,
                },
                isp: {
                    autonomousSystemNumber: null,
                    autonomousSystemOrganization: null,
                    ipAddress: ipAddress,
                    network: null,
                    isp: null,
                    organization: null,
                },
            };
        } else {
            response.geoip = { error: "Location not found" };
        }
    }

    res.status(200).json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
