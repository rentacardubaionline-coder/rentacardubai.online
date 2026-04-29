const cheerio = require('cheerio');

async function main() {
  const res = await fetch("https://www.oneclickdrive.com/rent-lamborghini-huracan-evo-spyder");
  const html = await res.text();
  const $ = cheerio.load(html);

  $("*").each((_, el) => {
      const text = $(el).children().length === 0 ? $(el).text().trim() : '';
      if (text.toLowerCase().includes('doors')) {
          console.log("Element with Doors:", el.tagName, $(el).parent().html());
      }
      if (text.toLowerCase().includes('seats')) {
          console.log("Element with Seats:", el.tagName, $(el).parent().html());
      }
  });
}

main();
