const { gql, GraphQLClient, request } = require("graphql-request");
const { createHash } = require("crypto");
const moment = require("moment");
const { json } = require("express");
const { Console } = require("console");
require("dotenv").config();

function hash(string) {
  return createHash("sha256").update(string).digest("hex");
}

const requestGrapQl = async () => {
  var d1 = new Date();
  d1.toUTCString();
  const endpoint = "https://open-api.affiliate.shopee.co.id/graphql";

  const AppId = process.env.APP_ID;
  const Secret = process.env.SECRET_KEY;
  const Timestamp = moment().unix();
  const Payload = {
    query:
      "mutation generateShortLink($input: ShortLinkInput!){\n  generateShortLink(input: $input){\n    shortLink\n  }\n}",
    variables: {
      input: {
        originUrl:
          "https://shopee.co.id/Guardian-Essential-Facial-Soft-Tissue-200S-i.186214521.17447526084?sp_atk=94768bbd-5c1c-4b54-b6f0-e7ef8f3edfc9&xptdk=94768bbd-5c1c-4b54-b6f0-e7ef8f3edfc9",
        subIds: ["s1", "s2", "s3", "s4", "s5"],
      },
    },
    operationName: "generateShortLink",
  };
  const Signature = hash(AppId + Timestamp + JSON.stringify(Payload) + Secret);

  const data = await request({
    url: endpoint,
    document: Payload.query,
    variables: Payload.variables,
    requestHeaders: {
      authorization: `SHA256 Credential=${AppId},Timestamp=${Timestamp},Signature=${Signature}`,
    },
  })
    .then((data) => data)
    .catch((error) => console.error(error));

  if (data) {
    console.log("Shortlink nya pak: " + data?.generateShortLink?.shortLink);
  }
};

const main = () => {
  // requestGrapQl();
  console.log(process.env.MY_GROUP);
};

//get Current Epoch Unix Timestamp
const getCurrentEpochTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

main();
