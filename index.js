const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { request } = require("graphql-request");
const { createHash } = require("crypto");
const fs = require("fs");
const moment = require("moment");
require("dotenv").config();

// Use the saved values
const client = new Client({
  authStrategy: new LocalAuth(),
});

function hash(string) {
  return createHash("sha256").update(string).digest("hex");
}

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Client is ready!");
  const data = await client.getChats();
  if (data) {
    // console.log(data);
    fs.writeFile("contacts.json", JSON.stringify(data), function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
});

const findUrl = (str) => {
  var url =
    /\b(https?:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/gi;
  return str.match(url);
};

const shortLink = (url) => {
  const endpoint = "https://open-api.affiliate.shopee.co.id/graphql";

  const AppId = process.env.APP_ID;
  const Secret = process.env.SECRET_KEY;
  const Timestamp = moment().unix();
  const Payload = {
    query:
      "mutation generateShortLink($input: ShortLinkInput!){\n  generateShortLink(input: $input){\n    shortLink\n  }\n}",
    variables: {
      input: {
        originUrl: url,
        subIds: ["s1", "s2", "s3", "s4", "s5"],
      },
    },
    operationName: "generateShortLink",
  };
  const Signature = hash(AppId + Timestamp + JSON.stringify(Payload) + Secret);

  return request({
    url: endpoint,
    document: Payload.query,
    variables: Payload.variables,
    requestHeaders: {
      authorization: `SHA256 Credential=${AppId},Timestamp=${Timestamp},Signature=${Signature}`,
    },
  })
    .then((data) => Promise.resolve(data.generateShortLink.shortLink))
    .catch((error) => Promise.reject(error));
};

const handleShortLink = async (link) => {
  const requests = link.map((el) => shortLink(el));
  const response = await Promise.all(requests);
  return response;
};

const ShopeeAfiliate = async (chat, message) => {
  const TARGET_GROUP = JSON.parse(process.env.TARGET_GROUP);
  if (
    message.body.includes("https://shope.ee") &&
    TARGET_GROUP.indexOf(chat.id._serialized) > -1
  ) {
    const url = findUrl(message.body);
    if (url.length) {
      const newShortLink = await handleShortLink(url);
      if (newShortLink.length) {
        let newMessage = message.body;
        url.forEach((el, idx) => {
          newMessage = newMessage.replace(el, newShortLink[idx]);
        });
        const MY_GROUP = JSON.parse(process.env.MY_GROUP);
        if (message.hasMedia) {
          const media = await message.downloadMedia();
          if (media) {
            MY_GROUP.map((el) =>
              client.sendMessage(el, media, { caption: newMessage })
            );
          }
        } else {
          MY_GROUP.map((el) => client.sendMessage(el, newMessage));
        }
      }
    }
  }
};

const PersonalUse = (chat, message) => {
  if (!chat.isGroup) {
    if (
      message.body === "!ping" ||
      message.body === "ping" ||
      message.body === "Ping"
    ) {
      message.reply("pong");
    }
    if (message.body === "p" || message.body === "P") {
      message.reply("p p p sopan kah begitu?");
    }
  }
};

client.on("message", async (message) => {
  const chat = await message.getChat();
  ShopeeAfiliate(chat, message);
  PersonalUse(chat, message);
});

client.initialize();
