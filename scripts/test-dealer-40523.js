const cheerio = require("cheerio");

async function testListing(id) {
  const url = `https://www.oneclickdrive.com/details/index/search-car-rentals-dubai/?id=${id}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log("--- Dealer Logo Search ---");
  $("img").each((i, el) => {
    const src = $(el).attr("src") || "";
    if (src.includes("/img/company/")) {
      console.log(`Found Logo: ${src}`);
      console.log(`Parent HTML: ${$.html($(el).parent())}`);
      console.log(`Grandparent HTML: ${$.html($(el).parent().parent())}`);
    }
  });
}

testListing("40523");
