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

  console.log("--- Listing Title ---");
  console.log($("title").text().trim());

  console.log("--- WhatsApp Links ---");
  $("a[href*='api.whatsapp.com/send']").each((i, el) => {
    console.log(`WA ${i}: ${$(el).attr('href')}`);
  });

  console.log("--- Company Images ---");
  $("img[src*='company']").each((i, el) => {
    console.log(`Img ${i}: src=${$(el).attr('src')}, onmouseover=${$(el).attr('onmouseover')}`);
  });
}

testListing("42758");
