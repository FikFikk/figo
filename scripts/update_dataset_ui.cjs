const fs = require('fs');
const path = require('path');

const srcDir = '/root/ObsidianVault/Kejawen/Dataset';
const vueFile = '/home/fikfikk/projects/node/figo/app/pages/tools/artikel.vue';

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));
let cards = [];

files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(srcDir, file), 'utf8'));
    const id = file.replace('.json', '');
    
    let desc = "-";
    if (data.arsip_pengetahuan && data.arsip_pengetahuan.length > 0) {
        let firstPenjabaran = data.arsip_pengetahuan[0].penjabaran_detail;
        if (firstPenjabaran) {
             desc = firstPenjabaran.replace(/\n/g, " ").replace(/'/g, "\\'");
             if(desc.length > 100) desc = desc.substring(0, 100) + "...";
        }
    }
    
    cards.push(`  {
    id: '${id}',
    judul: '${(data.buku_referensi || "-").replace(/'/g, "\\'")}',
    tokoh: '${(data.tokoh || "-").replace(/'/g, "\\'")}',
    kategori: '${(data.kategori_akademik || "-").replace(/'/g, "\\'")}',
    deskripsi: '${desc}',
    url: '/dataset/${file}',
    data: null
  }`);
});

const cardsStr = '[\n' + cards.join(',\n') + '\n]';

let vueContent = fs.readFileSync(vueFile, 'utf8');

const regex = /const documents = ref\(\[[\s\S]*?\]\)/;
if (regex.test(vueContent)) {
    vueContent = vueContent.replace(regex, `const documents = ref(${cardsStr})`);
    fs.writeFileSync(vueFile, vueContent, 'utf8');
    console.log("Vue file updated (documents array).");
} else {
    console.log("Could not find 'const documents = ref([' in " + vueFile);
}
