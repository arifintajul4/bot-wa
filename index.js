const axios = require("axios");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

const findUrl = (str) => {
  var url =
    /\b(https?:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/gi;
  return str.match(url);
};

const shortLink = (url) => {
  return axios
    .post(
      "https://affiliate.shopee.co.id/api/v1/link/gen_by_custom",
      {
        original_url: url,
        advanced: {},
      },
      {
        headers: {
          cookie:
            "SPC_F=8DFTVxZ3c8L4iepZ1tmla4uYuY6f7u7T; G_ENABLED_IDPS=google; SPC_CLIENTID=OERGVFZ4WjNjOEw0espcjskjqvwayqzn; _gcl_au=1.1.330198968.1656919150; _ga=GA1.1.1556328701.1649137665; _med=affiliates; SPC_ST=.bUhobGVYT2xJZEw0aEFvNEK/IegN4iGuu+7GH0tl9dQoq2IGfDtKhhm6IHzw41xtam9zHoFaTEFlelCLOVyKZIdULyyKt/fn7DhjjBU4vczylQYDqn3QhmJiEP3YUmO3uUyEVxbMQXLRbWWry34syGvcpzSsdQOgzRBw79Z2RplI9El3eT6rlLw1rMTmib84M6IjwPS8VV0g1kS6j+Sbkg==; _ga_KK6LLGGZNQ=GS1.1.1657719509.8.0.1657719509.0; SPC_U=45394488; SPC_R_T_ID=bVuqt7xA8UUBHG3Kzw+QELWIb4YjoMsXNLVwr0uCvp/ge5RTQ4n/7k+duer798xAqTmg4r8WLQtJMoEH74TbMmilKI8tOTluWvnLcZNGv/s=; SPC_R_T_IV=2nD/W9ME+4ZDadfljFfG6w==; SPC_T_ID=bVuqt7xA8UUBHG3Kzw+QELWIb4YjoMsXNLVwr0uCvp/ge5RTQ4n/7k+duer798xAqTmg4r8WLQtJMoEH74TbMmilKI8tOTluWvnLcZNGv/s=; SPC_T_IV=2nD/W9ME+4ZDadfljFfG6w==; SPC_SI=qRm8YgAAAAAyMXFQVndaT9+TsAIAAAAAclo0SzVDZzc=; _csrf=tdNy3ZIa2K9DSoNGlz22bUEe; cto_bundle=fmoX7F9Xa2tncHJwN3hzaTN2c1RQb3I3U3g4T0ZaTnFUdSUyQm9pUEtzbm1qRUZNcSUyQmlLeSUyRm5BaVUlMkZIeEhtQ3ltQU5FZFdFUDVhcVRQM3FBOU92UGQ2b0t3OUI1eWVqR25XczA0RjZlOWFQRVQ0RmJLY1ZUaHNUa0dnNGNpNTNla1JCcUxNclhENFdPQ1h4biUyQlVlSm84dHlPdmtnJTNEJTNE; _ga_SW6D8G0HXK=GS1.1.1658048394.143.1.1658048412.42; language=en-id; SPC_EC=S1l4ZFdIMmJwMldqNGI3a6P00AsYh3bSn8Lx449vOCd07SFZ3+9S68x5lnWuONqraYafHueEcUMWzywWI0ch7qIKD2rdJuqlidPiwYCfAFBt2jLlE2eGV6QAtG/V3Uxc0ogD25lM51BgnxfqkPXXapgrEq9sziEINa6f2H8fzPE=",
        },
      }
    )
    .then(function (response) {
      return Promise.resolve(response.data);
    })
    .catch(function (error) {
      return Promise.reject(error.data);
    });
};

const handleShortLink = async (link) => {
  const requests = link.map((el) => shortLink(el));
  const response = await Promise.all(requests);
  return response;
};

const ShopeeAfiliate = async (chat, message) => {
  if (
    message.body.includes("https://shope.ee") &&
    chat.id._serialized !== "120363025283080815@g.us"
  ) {
    const url = findUrl(message.body);
    if (url.length) {
      const newShortLink = await handleShortLink(url);
      if (newShortLink.length) {
        let newMessage = message.body;
        url.forEach((el, idx) => {
          newMessage = newMessage.replace(
            el,
            newShortLink[idx].data.short_link
          );
        });
        if (message.hasMedia) {
          const media = await message.downloadMedia();
          client.sendMessage("120363038251545515@g.us", media, {
            caption: newMessage,
          });
        } else {
          client.sendMessage("120363038251545515@g.us", newMessage);
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
