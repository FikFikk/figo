const fetchIg = async () => {
    const url = 'https://www.instagram.com/reel/DUvfa9Tgezd/';
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
    });

    const html = await res.text();
    
    // HTML Decode function
    const decodeHtml = (str) => {
        return str.replace(/&#([0-9]{1,3});/gi, (match, num) => String.fromCharCode(parseInt(num)))
                  .replace(/&quot;/g, '"')
                  .replace(/&amp;/g, '&');
    };

    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || 
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const ogVideoMatch = html.match(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i) || 
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video["']/i);
    
    console.log('og:video metadata:', ogVideoMatch ? decodeHtml(ogVideoMatch[1]) : 'Tidak terdeteksi');
    console.log('og:image metadata:', ogImageMatch ? decodeHtml(ogImageMatch[1]) : 'Tidak terdeteksi');

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    console.log('Title tag:', titleMatch ? decodeHtml(titleMatch[1]) : 'Tidak ada title');
};
fetchIg();
