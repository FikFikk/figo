<template>
  <div class="min-h-screen pt-24 pb-20 overflow-x-hidden transition-colors" :class="isDark ? 'bg-neutral-950 text-white' : 'bg-slate-50 text-slate-900'">
    <div class="px-6 md:px-8 max-w-4xl mx-auto space-y-8">
      
      <!-- TABS -->
      <CalendarTabs />

      <!-- TITLE -->
      <div>
        <h2 class="text-2xl font-bold font-headline mb-2">Dokumentasi Kejawen & Tasawuf Jawa</h2>
        <p class="opacity-60 text-sm">Arsip spiritualitas Nusantara: Wahyu Panca Gaib dan Syahadat Sejati, lengkap dengan penjabaran makna filosofis.</p>
        
        <div class="mt-4 p-4 rounded-xl border text-sm opacity-80" :class="isDark ? 'bg-amber-900/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'">
          <strong>Catatan:</strong> Tulisan ini didokumentasikan murni sebagai pelestarian sejarah spiritualitas Nusantara (Sastra Jawa Kuno, <i>Kapribaden</i>, dan <i>Manunggaling Kawula Gusti</i>). Fokus pada pemaknaan agar filosofi luhurnya dapat dipahami akal awam.
        </div>
      </div>

      <!-- WAHYU PANCA GAIB -->
      <div class="rounded-3xl p-6 md:p-8 border shadow-sm transition-all" :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100'">
        
        <div class="mb-6">
          <h3 class="font-bold text-2xl text-primary-500">Wahyu Panca Gaib (Ajaran Kapribaden)</h3>
          <p class="mt-2 text-sm opacity-80 leading-relaxed">
            Diwejangkan oleh <strong>Romo Herucokro Semono</strong> (13 November 1955), kelima peranti gaib ini merupakan tahapan laku penyucian jiwa (menurunkan Ego/Aku) untuk menyelaraskan kehendak diri dengan <i>Gusti Ingkang Moho Suci</i>.
          </p>
        </div>

        <div class="space-y-6">
          <!-- 1. KUNCI -->
          <div class="p-5 rounded-2xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'">
            <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
              <span class="bg-primary-500/20 text-primary-600 dark:text-primary-400 w-8 h-8 flex items-center justify-center rounded-lg text-sm">1</span> 
              Kunci <span class="font-normal opacity-60 text-sm ml-1">(Pembersih Wadah & Dosa)</span>
            </h4>
            
            <div class="p-5 rounded-xl mb-5 font-serif border border-l-4 shadow-inner text-[15px] leading-relaxed" :class="isDark ? 'bg-black/30 border-white/5 border-l-white/40' : 'bg-white border-slate-100 border-l-slate-400'">
              <p class="italic">"Gusti Ingkang Moho Suci, kulo nyuwun pangapuro dumateng Gusti Ingkang Moho Suci. Sirullah, Dzatullah, Sifatullah. Kulo sejatine satriyo / wanito. Nyuwun wicaksono, nyuwun panguwoso, kangge tumindhake satrio sejati. Kulo nyuwun kangge nyirnakake tumindak ingkang luput."</p>
            </div>
            
            <h5 class="text-sm font-bold uppercase tracking-widest opacity-60 mb-3">Bedah Arti per Kalimat</h5>
            <ul class="text-sm opacity-90 space-y-3">
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Gusti Ingkang Moho Suci, kulo nyuwun pangapuro..."</strong><br> Pengutaraan kerendahan hati hamba yang memohon ampunan mutlak (Fase Taubat mutlak).</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Sirullah, Dzatullah, Sifatullah."</strong><br> Menyadari kerahasiaan, Zat, dan Sifat Tuhan sesungguhnya dititipkan dan bersemayam memancarkan Nur Ilahi dalam diri hamba.</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Kulo sejatine satriyo/wanito."</strong><br> 'Aku adalah kesatria'. Bukan dalam arti memegang pedang, di sini bermakna pejuang batin (Jihad Akbar melawan nafsu diri).</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Nyuwun wicaksono, nyuwun panguwoso..."</strong><br> Memohon hikmah (wicaksono) dan kuasa-kendali diri (panguwoso) agar terwujud tindak laku kesatria suci.</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Kulo nyuwun kangge nyirnakake tumindak ingkang luput."</strong><br> Supaya kendali dan kuasa itu difungsikan murni untuk <i>memusnahkan</i> segala perilaku buruk & ego hamba (pembersihan total).</li>
            </ul>
          </div>

          <!-- 2. ASMO -->
          <div class="p-5 rounded-2xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'">
            <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
              <span class="bg-primary-500/20 text-primary-600 dark:text-primary-400 w-8 h-8 flex items-center justify-center rounded-lg text-sm">2</span> 
              Asmo <span class="font-normal opacity-60 text-sm ml-1">(Identitas Rohani Sejati)</span>
            </h4>
            <div class="p-5 rounded-xl mb-5 border border-l-4 shadow-inner" :class="isDark ? 'bg-black/30 border-white/5 border-l-white/40' : 'bg-white border-slate-100 border-l-slate-400'">
              <div class="grid grid-cols-2 gap-4 text-sm text-center">
                <div>
                  <div class="opacity-60 text-xs mb-1 uppercase tracking-widest font-bold">Pria</div>
                  <div class="font-mono text-lg text-primary-500 font-bold">Konto Warno<br><span class="text-xs text-slate-500 font-sans">atau</span><br>Konto Rupo</div>
                </div>
                <div>
                  <div class="opacity-60 text-xs mb-1 uppercase tracking-widest font-bold">Wanita</div>
                  <div class="font-mono text-lg text-primary-500 font-bold">Kanthi Warni<br><span class="text-xs text-slate-500 font-sans">atau</span><br>Kanthi Rupi</div>
                </div>
              </div>
            </div>
            
            <h5 class="text-sm font-bold uppercase tracking-widest opacity-60 mb-2">Makna Laku</h5>
            <p class="text-sm opacity-90 leading-relaxed mb-2"><i>Asmo</i> (Nama) di sini bukanlah nama akta lahir, melainkan nama kedudukan Sukma (Roh). Secara kultural diberikan ('diwejang') oleh sesepuh melalui jalan ganjil/pengundian.</p>
            <p class="text-sm opacity-90 leading-relaxed">Secara harfiah memiliki makna Kawan / Menyertai (<i>Konto / Kanthi</i>) dan Esensi Wujud (<i>Warno / Rupo</i>), menyimbolkan roh murni yang mendampingi tubuh lahir manusia di dunia.</p>
          </div>

          <!-- 3. MIJIL -->
          <div class="p-5 rounded-2xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'">
            <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
              <span class="bg-primary-500/20 text-primary-600 dark:text-primary-400 w-8 h-8 flex items-center justify-center rounded-lg text-sm">3</span> 
              Mijil <span class="font-normal opacity-60 text-sm ml-1">(Serah Terima Kehendak)</span>
            </h4>
            
            <div class="p-5 rounded-xl mb-5 font-serif border border-l-4 shadow-inner text-[15px] leading-relaxed" :class="isDark ? 'bg-black/30 border-white/5 border-l-white/40' : 'bg-white border-slate-100 border-l-slate-400'">
              <p class="italic">"(Sebut Asmo), jeneng siro mijilo, panjenengan Ingsun kagungan karso, raganiro arso..." <span class="text-sm font-sans not-italic block mt-2 opacity-60">[Isi niyat murni. Misal: "...arso makarya" (bekerja), "...arso mlampah" (berjalan)].</span></p>
              <br>
              <p class="italic text-sm"><span class="font-sans not-italic font-bold">Inisiasi Khusus/Pertama (Tarian Suci):</span><br> "...raganiro arso mbekso beksaniro pribadi."</p>
            </div>
            
            <h5 class="text-sm font-bold uppercase tracking-widest opacity-60 mb-3">Bedah Arti per Kalimat</h5>
            <ul class="text-sm opacity-90 space-y-3">
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Jeneng siro mijilo..."</strong><br> "Bangkitlah wahai diri/roh." Memantik kesadaran jiwa. Diucapkan batin (dirapal) tiap mau memulai kegiatan harian.</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Panjenengan Ingsun kagungan karso..."</strong><br> "...karena Aku Sejati/Tuhan memegang kendali atas Kehendak (Karso)."</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Raganiro arso..."</strong><br> "...raga ini sekadar menjalankan kehendak [sebut kegiatan]." Menegaskan bahwa raga digerakkan bimbingan Tuhan, bukan syahwat fisik semata.</li>
            </ul>
          </div>

          <!-- 4. SINGKIR -->
          <div class="p-5 rounded-2xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'">
            <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
              <span class="bg-primary-500/20 text-primary-600 dark:text-primary-400 w-8 h-8 flex items-center justify-center rounded-lg text-sm">4</span> 
              Singkir <span class="font-normal opacity-60 text-sm ml-1">(Perisai Penyingkir Energi Negatif/Ego)</span>
            </h4>
            
            <div class="p-5 rounded-xl mb-5 font-serif border border-l-4 shadow-inner text-[15px] leading-relaxed" :class="isDark ? 'bg-black/30 border-white/5 border-l-white/40' : 'bg-white border-slate-100 border-l-slate-400'">
              <p class="italic">"Gusti Ingkang Moho Suci, kulo nyuwun pangapuro dumateng Gusti Ingkang Moho Suci. Sirollah, Datollah, Sipatollah. Kulo sejatine satriyo / wanito. Hananiro-hananingsun, Wujudiro-wujudingsun. Siro sirno mati dening satriyo sejati. Ketiban iduku putih sirno layu dening (Sebut Asmo)."</p>
            </div>
            
            <h5 class="text-sm font-bold uppercase tracking-widest opacity-60 mb-3">Bedah Arti Pamungkas Singkir</h5>
            <ul class="text-sm opacity-90 space-y-3">
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Hananiro-hananingsun, Wujudiro-wujudingsun."</strong><br> "Keberadaanmu adalah keberadaanku, wujudmu adalah wujudku." Menyadari seluruh esensi yang kasat/gaib pun berasal dari Satu Pemelihara, meredam emosi kemarahan menjadi welas asih.</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Siro sirno mati dening satriyo sejati."</strong><br> Engkau (entitas / niat buruk gaib / ego angkara) langsung sirna di depan Sang Petarung Jiwa yang murni.</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Ketiban iduku putih sirno layu..."</strong><br> "Tertimpa ludah mutihku, melayu hancurlah engkau." Idu Putih (Ludah Mutih) melambangkan <i>Sabda Pandita Ratu</i> (Kehendak absolut / Kun Fayakun). Segala bentuk parasit dimensi gaib dan angkara ego niscaya gugur tersapu pendar nama Sukma (Asmo).</li>
            </ul>
          </div>

          <!-- 5. PAWELING -->
          <div class="p-5 rounded-2xl border" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'">
            <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
              <span class="bg-primary-500/20 text-primary-600 dark:text-primary-400 w-8 h-8 flex items-center justify-center rounded-lg text-sm">5</span> 
              Paweling <span class="font-normal opacity-60 text-sm ml-1">(Sandi Pengingat Jalur Keseimbangan)</span>
            </h4>
            
            <div class="p-5 rounded-xl mb-5 font-serif border border-l-4 shadow-inner text-[15px] leading-relaxed" :class="isDark ? 'bg-black/30 border-white/5 border-l-white/40' : 'bg-white border-slate-100 border-l-slate-400'">
              <p class="italic">"Siji-siji, loro-loro, telu-telonono;<br>Siji sekti, loro dadi, telu pandito;<br>Siji Wahyu, loro grahito, telu rejeki."</p>
            </div>

            <h5 class="text-sm font-bold uppercase tracking-widest opacity-60 mb-3">Bedah Arti per Kalimat</h5>
            <ul class="text-sm opacity-90 space-y-3">
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Siji-siji, loro-loro, telu-telonono."</strong><br> Satu per satu, berdua ditekuni, perkuat kali ketiganya. Menekankan ketekunan menjalankan laku tanpa jeda.</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Siji sekti, loro dadi, telu pandito."</strong><br> (1) Kukuh spiritualnya, (2) terwujud dunia materinya, (3) matang dan suci pelayanannya bagai Pendeta. Harmonisasi bumi & langit.</li>
              <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Siji Wahyu, loro grahito, telu rejeki."</strong><br> Utamakan mencari Wahyu Ilahi, bersihkan insting spiritual (Grahito) untuk merasakan kehendaknya—bila dua itu dipupuk, (3) Rezeki materi jasmaniyah alamiah akan menaungi dengan sendirinya.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- SYAHADAT PANETEP -->
      <div class="rounded-3xl p-6 md:p-8 border shadow-sm transition-all" :class="isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100'">
        <div class="mb-6">
          <h3 class="font-bold text-2xl text-primary-500">Syahadat Panetep (Syahadat Sejati Batin)</h3>
          <p class="mt-2 text-sm opacity-80 leading-relaxed">
            Suluk warisan Wali Songo (Siti Jenar) guna meraih puncak persatuan jiwa Hamba dan Khalik <i>(Manunggaling Kawula Gusti / Fana')</i>. Bukan untuk membongkar Syariat agama, namun penggenap Makrifah batin.
          </p>
        </div>

        <div class="p-6 rounded-3xl mb-6 font-serif border border-l-4 shadow-inner text-lg leading-loose" :class="isDark ? 'bg-black/30 border-white/5 border-l-white/40' : 'bg-slate-50 border-slate-100 border-l-slate-400'">
          <p class="italic text-center font-bold mb-4 opacity-80 border-b pb-4" :class="isDark ? 'border-white/10' : 'border-slate-200'">"Syahadat panetep panatagama.<br>Kang jumeneng Roh Idhofi, kang ana telenging ati, kang dadi pancering urip iku.<br>...Gusti, sun ingsun, ya ingsun kang dumadi."</p>
          
          <ul class="text-sm font-sans space-y-4 text-left not-italic font-normal">
            <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"Syahadat panetep panatagama..."</strong><br> <span class="opacity-80">Kesucian saksi batin, pengukuh dasar/landasan utama dalam tatanan (panata) agama ciptaan-Nya.</span></li>
            <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"...Kang jumeneng Roh Idhofi,"</strong><br> <span class="opacity-80">Ruh Idhafi adalah Nafas Murni dari sang Ilahi yang bertahta (Jumeneng). Menyadari hakikat kehidupan raga ditopang Roh murni, bukan milik keakuan gumpalan daging.</span></li>
            <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"...kang ana telenging ati, kang dadi pancering urip iku,"</strong><br> <span class="opacity-80">Berdiam di pusat relung hati yang paling sunyi. Dan Roh itulah satu-satunya tiang (Pancer) pemancar nyawa kehidupan raga biologis sang manusia.</span></li>
            <li><strong :class="isDark ? 'text-primary-400' : 'text-primary-700'">"...Gusti, sun ingsun, ya ingsun kang dumadi."</strong><br> <span class="opacity-80">Meleburnya batas Ego. "Ya Tuhan, karena Niat (Sun)-ku adalah Niat-Mu (Ingsun), maka kehendak-Mu jualah yang sesungguhnya mewujud." Lebur tanpa jarak, menjadikan Hamba sekadar Wayang, dan Tuhanlah Sang Dalang Agungnya.</span></li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import CalendarTabs from '~/components/calendar/CalendarTabs.vue'

const { isDark } = useColorMode()

useSeoMeta({
  title: 'Panca Gaib & Kejawen — FiGo',
  description: 'Dokumentasi detail Wahyu Panca Gaib (Kunci, Asmo, Mijil, Singkir, Paweling) Kapribaden beserta terjemahan makna Syahadat Panetep (Suluk Makrifat Jawa).',
})
</script>
