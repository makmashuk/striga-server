const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
// const corsOptions = {
//   origin: "*",
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };
// Define the base URL for the Striga API
//NOT RECOMMENDED !! USE ENV VALUE
const API_BASE_URL = "https://www.sandbox.striga.com/api/v1";
const APPLICATION_ID = "59e5a3ba-96f8-476a-9b76-c4e91626a95e";
const SANDBOX_API_KEY = "JRTmZc80K5mQTZUPW2gqWqvwy38rGmMTiaNVIvCb0jI=";
const SANDBOX_API_SECRET = "D1h8BVZ9g5u6dVRekb4vM2Dj8YiMycgZjJQ3SEDzY4A=";
const SANDBOX_UI_SECRET = "W5RNGINiuHEm98umgA+6LIbKUO65bw5Kccv7/4CEDNc=";

// Create a new Express app
const app = express();
app.use(bodyParser.json());
app.use(cors("*"));

const generateAuthorizationHeader = (req) => {
  const time = Date.now().toString();
  const path = req.path;
  const method = req.method;
  const body = req.body;
  const bodyString = JSON.stringify(body);

  const hmac = crypto.createHmac("sha256", SANDBOX_API_SECRET);

  hmac.update(time);
  hmac.update(method);
  hmac.update(path);

  const contentHash = crypto.createHash("md5");
  contentHash.update(bodyString);

  hmac.update(contentHash.digest("hex"));
  const hmac_key = `HMAC ${time}:${hmac.digest("hex")}`;
  return hmac_key;
};

app.all("/*", async (req, res) => {
  try {
    const apiUrl = API_BASE_URL + req.url;
    console.log(res.body);
    const authorizationHeader = generateAuthorizationHeader(req);
    const response = await axios({
      url: apiUrl,
      method: req.method,
      headers: {
        "api-key": SANDBOX_API_KEY,
        authorization: authorizationHeader,
        "Content-Type": "application/json",
      },
      data: req.body,
    });
    console.log(response);
    const responseData = {
      status: response?.status,
      data: response?.data,
    };
    res.send(responseData);
  } catch (error) {
    console.log(error);
    res.send(error.response.data);
    res.end();
  }
});

// Start the server
const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
