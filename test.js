//find url from string
const findUrl = (str) => {
  var url =
    /\b(https?:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/gi;
  return str.match(url);
};

const main = () => {
  const pesan =
    "tes coba nih link: https://shope.ee/asasasasa hadeh link2: https://shope.ee/xxxxxx";
  //find url in string
  const url = findUrl(pesan);
  const timpa = ["https://shope.ee/timpa1", "https://shope.ee/timpa2"];
  let tmp = pesan;
  url.forEach((el, idx) => {
    tmp = tmp.replace(el, timpa[idx]);
  });
  console.log(tmp);

  //check if string include in array
  const check = (str, arr) => {
    return arr.some((el) => el.includes(str));
  };
  console.log(check("https://shope.ee/timpa1", timpa));
};

main();
