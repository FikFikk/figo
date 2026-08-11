const fs = require('fs');
const vueFile = '/home/fikfikk/projects/node/figo/app/pages/tools/artikel.vue';
const content = fs.readFileSync(vueFile, 'utf8');

const regex = /const documents = ref\(\[([\s\S]*?)\]\)/;
const match = content.match(regex);
if (match) {
    console.log("Array documents item count: " + match[1].split('id: ').length);
}
