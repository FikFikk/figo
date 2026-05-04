// 44 Indikator Teknikal + 16 SMC/Price Action + 21 Teori + 8 Jenis Chart
import type { ConceptCategoryDef } from './patternData'

const D = (title:string,body:string) => ({title,body})

export const advancedConceptCategories: ConceptCategoryDef[] = [
  // ═══ 5. INDIKATOR TEKNIKAL (44 indikator) ═══
  {title:'Indikator Teknikal',subtitle:'44 INDIKATOR — TREND, MOMENTUM, VOLUME, VOLATILITAS',open:false,concepts:[
    // -- Trend --
    {name:'SMA (Simple Moving Avg)',icon:'show_chart',desc:'Rata-rata harga N periode. Trend filter paling dasar. Golden/Death Cross.',detail:[D('Apa itu?','Rata-rata harga penutupan N hari terakhir. SMA 50 dan 200 paling populer.'),D('Golden/Death Cross','SMA50 potong atas SMA200 = Golden Cross (beli). Sebaliknya = Death Cross (jual).')]},
    {name:'EMA (Exponential MA)',icon:'show_chart',desc:'Lebih sensitif dari SMA. EMA 9/21/50/200 paling populer di trading.',detail:[D('Apa itu?','Memberi bobot lebih pada harga terbaru. Lebih responsif dari SMA untuk trading aktif.')]},
    {name:'WMA (Weighted MA)',icon:'show_chart',desc:'Memberi bobot lebih pada data terbaru. Lebih responsif dari SMA.',detail:[D('Apa itu?','Bobot linear: harga terbaru dapat bobot terbesar. Lebih smooth dari EMA.')]},
    {name:'HULL MA (HMA)',icon:'show_chart',desc:'Moving average hampir tanpa lag. Responsif namun smooth.',detail:[D('Apa itu?','Diciptakan Alan Hull. Menggunakan WMA ganda untuk eliminasi lag sambil tetap smooth.')]},
    {name:'TEMA (Triple EMA)',icon:'show_chart',desc:'Triple smoothed EMA. Sangat responsif, minim lag untuk scalping.',detail:[D('Apa itu?','Tiga lapisan smoothing EMA. Tercepat merespon perubahan harga. Cocok scalping.')]},
    {name:'DEMA (Double EMA)',icon:'show_chart',desc:'Double smoothed EMA. Lebih responsif dari EMA biasa.',detail:[D('Apa itu?','Dua lapisan smoothing. Kompromi antara EMA (responsif) dan SMA (smooth).')]},
    {name:'Bollinger Bands',icon:'density_medium',desc:'MA ± 2 standar deviasi. Squeeze = breakout, touch band = sinyal.',detail:[D('Apa itu?','3 garis: MA20 (tengah), atas (MA+2σ), bawah (MA-2σ). ~95% harga di dalam bands.'),D('Squeeze','Bands menyempit = volatilitas rendah, breakout besar akan datang.'),D('Bounce','Harga cenderung memantul ke MA20 setelah menyentuh band luar.')]},
    {name:'Ichimoku Kinko Hyo',icon:'cloud',desc:'5 komponen: Tenkan, Kijun, Senkou A&B, Chikou. Sistem lengkap.',detail:[D('Apa itu?','Sistem analisis lengkap dari Jepang. Melihat tren, support/resistance, dan momentum sekaligus.'),D('Kumo Cloud','Area antara Senkou A dan B. Harga di atas cloud = bullish, di bawah = bearish.')]},
    {name:'Parabolic SAR',icon:'motion_photos_on',desc:'Titik di atas/bawah candle. Titik berpindah sisi = sinyal balik tren.',detail:[D('Apa itu?','Titik-titik yang mengikuti harga. Di bawah candle = uptrend, di atas = downtrend. Saat berpindah sisi = sinyal.')]},
    {name:'ADX (Avg Directional)',icon:'trending_up',desc:'Mengukur kekuatan tren. ADX >25 = tren kuat. DI+/DI- untuk arah.',detail:[D('Cara Baca','ADX <20 = sideways. 20-25 = tren mulai. >25 = tren kuat. >50 = tren sangat kuat.'),D('DI+/DI-','DI+ > DI- = uptrend. DI- > DI+ = downtrend.')]},
    {name:'Supertrend',icon:'north_east',desc:'ATR-based trailing stop. Hijau = uptrend, merah = downtrend.',detail:[D('Apa itu?','Indikator tren berbasis ATR (volatilitas). Sangat simpel: hijau = beli, merah = jual.')]},
    {name:'Keltner Channel',icon:'density_medium',desc:'EMA ± ATR. Lebih smooth dari Bollinger. Squeeze combo populer.',detail:[D('Apa itu?','Mirip Bollinger tapi menggunakan ATR bukan standar deviasi. Lebih smooth. Bollinger squeeze + Keltner = sinyal breakout kuat.')]},
    {name:'Donchian Channel',icon:'density_medium',desc:'Highest high & lowest low N periode. Turtle traders menggunakan ini.',detail:[D('Apa itu?','Upper = highest high 20 hari. Lower = lowest low 20 hari. Breakout atas = beli, bawah = jual.')]},
    {name:'Alligator',icon:'pets',desc:'3 SMMA (jaw/teeth/lips). Saat bersilangan = pasar bergerak.',detail:[D('Apa itu?','Bill Williams. 3 MA: Jaw (13), Teeth (8), Lips (5). Saat terbuka lebar = tren aktif. Tertutup = pasar tidur.')]},
    {name:'Fractal',icon:'star_rate',desc:'5 candle dengan high/low tertinggi di tengah. Support/resistance.',detail:[D('Apa itu?','Bill Williams. 5 candle dimana candle tengah memiliki high tertinggi (bearish) atau low terendah (bullish). Level S/R otomatis.')]},
    // -- Momentum --
    {name:'RSI',icon:'speed',desc:'Oscillator 0-100. Overbought >70, Oversold <30. Divergensi penting.',detail:[D('Cara Baca','>70 = overbought. <30 = oversold. Divergence RSI vs harga = sinyal peringatan paling akurat.')]},
    {name:'MACD',icon:'stacked_line_chart',desc:'EMA 12-26 + signal line. Crossover & histogram sangat populer.',detail:[D('Cara Baca','MACD cross atas signal = bullish. Histogram positif→negatif = momentum berubah.')]},
    {name:'Stochastic Oscillator',icon:'speed',desc:'%K & %D. Crossover di overbought/oversold = sinyal.',detail:[D('Cara Baca','%K cross atas %D di bawah 20 = beli. Cross bawah di atas 80 = jual. Terbaik di sideways.')]},
    {name:'Stochastic RSI',icon:'speed',desc:'RSI dari RSI. Lebih sensitif. Sangat baik untuk timing entry.',detail:[D('Apa itu?','Stochastic diterapkan pada RSI. Lebih sensitif dari keduanya. Cocok untuk fine-tuning entry.')]},
    {name:'CCI',icon:'analytics',desc:'Deviasi harga dari rata-rata statistik. +100/-100 threshold.',detail:[D('Cara Baca','>+100 = overbought/tren naik kuat. <-100 = oversold/tren turun kuat.')]},
    {name:'Williams %R',icon:'speed',desc:'Mirip stochastic, skala -100 s/d 0. -80=oversold, -20=overbought.',detail:[D('Apa itu?','Mengukur di mana harga relatif terhadap range N periode. Cepat responsif.')]},
    {name:'Momentum Indicator',icon:'bolt',desc:'Selisih harga sekarang vs N periode lalu.',detail:[D('Apa itu?','Paling simpel: Harga sekarang - Harga N hari lalu. Positif = momentum naik. Negatif = turun.')]},
    {name:'ROC (Rate of Change)',icon:'percent',desc:'Persentase perubahan harga vs N periode lalu.',detail:[D('Apa itu?','Versi persentase dari Momentum. ((Harga sekarang / Harga N lalu) - 1) × 100.')]},
    {name:'TSI (True Strength)',icon:'speed',desc:'Double-smoothed momentum. Akurat tapi lambat.',detail:[D('Apa itu?','Momentum yang di-smooth dua kali. Mengurangi noise. Divergence-nya sangat efektif.')]},
    {name:'Ultimate Oscillator',icon:'tune',desc:'Gabungan 3 timeframe (7,14,28). Mengurangi sinyal palsu.',detail:[D('Apa itu?','Menggabungkan 3 periode. Kelebihan: sangat sedikit sinyal palsu. Kekurangan: lambat.')]},
    {name:'Awesome Oscillator',icon:'bar_chart',desc:'SMA 5 midpoint - SMA 34 midpoint. Zero-cross = sinyal.',detail:[D('Apa itu?','Bill Williams. Histogram yang menunjukkan momentum pasar. Crossing zero = perubahan tren.')]},
    {name:'DPO',icon:'trending_flat',desc:'Menghilangkan tren jangka panjang untuk melihat siklus pendek.',detail:[D('Apa itu?','De-Trended Price Oscillator. Mengisolasi siklus pendek dari tren utama.')]},
    {name:'KST (Know Sure Thing)',icon:'insights',desc:'Empat ROC di-smooth. Tren dan momentum jangka panjang.',detail:[D('Apa itu?','Martin Pring. 4 ROC di-smooth dan dijumlahkan. Identifikasi tren major.')]},
    // -- Volume --
    {name:'OBV (On-Balance Volume)',icon:'equalizer',desc:'Akumulasi volume. Naik saat hijau, turun saat merah.',detail:[D('Apa itu?','Volume ditambah pada hari naik, dikurangi pada hari turun. OBV naik sebelum harga = akumulasi.')]},
    {name:'VWAP',icon:'query_stats',desc:'Harga rata-rata berbobot volume. Benchmark institusi.',detail:[D('Apa itu?','Volume Weighted Average Price. Di atas VWAP = bullish, di bawah = bearish. Wajib untuk day trading.')]},
    {name:'Volume Profile',icon:'bar_chart',desc:'Distribusi volume per level harga. HVN = area S/R.',detail:[D('Apa itu?','Volume ditampilkan secara horizontal per level harga. High Volume Node = area S/R penting.')]},
    {name:'CMF (Chaikin Money Flow)',icon:'water_drop',desc:'Mengukur tekanan beli/jual dari volume.',detail:[D('Cara Baca','>0 = tekanan beli. <0 = tekanan jual. >+0.1 = beli kuat. <-0.1 = jual kuat.')]},
    {name:'MFI (Money Flow Index)',icon:'water_drop',desc:'RSI versi volume. Overbought >80, Oversold <20.',detail:[D('Apa itu?','RSI yang diperkuat volume. Lebih akurat dari RSI biasa karena mempertimbangkan uang masuk/keluar.')]},
    {name:'Force Index',icon:'bolt',desc:'Menggabungkan harga dan volume menjadi satu oscillator.',detail:[D('Apa itu?','Alexander Elder. Harga × Volume. Mengukur kekuatan sebenarnya dari pergerakan.')]},
    {name:'Klinger Volume Osc.',icon:'equalizer',desc:'Mengukur tren jangka panjang dari aliran volume.',detail:[D('Apa itu?','Volume oscillator jangka panjang. Crossover signal line = sinyal tren.')]},
    {name:'Chaikin Oscillator',icon:'equalizer',desc:'MACD dari Accumulation/Distribution line.',detail:[D('Apa itu?','MACD diterapkan pada A/D line. Mendeteksi perubahan arah aliran uang sebelum harga berubah.')]},
    // -- Volatilitas --
    {name:'ATR (Average True Range)',icon:'expand',desc:'Rata-rata volatilitas. Dasar stop loss dan position sizing.',detail:[D('Apa itu?','Rata-rata range harian (High-Low + gap). ATR tinggi = volatile. Basis menentukan stop loss.'),D('Position Sizing','Risk per trade ÷ ATR = jumlah lot. Makin besar ATR, makin kecil posisi.')]},
    {name:'Bollinger Band Width',icon:'unfold_more',desc:'Lebar Bollinger Bands. Squeeze rendah = breakout datang.',detail:[D('Apa itu?','Mengukur lebar bands secara numerik. Nilai terendah = squeeze = siap breakout besar.')]},
    {name:'Historical Volatility',icon:'timeline',desc:'Standar deviasi return historis. Risiko aktual asset.',detail:[D('Apa itu?','Mengukur seberapa besar pergerakan harga sesungguhnya. HV tinggi = asset berisiko tinggi.')]},
    {name:'Standard Deviation',icon:'straighten',desc:'Ukuran dispersi harga. Dasar dari Bollinger Bands.',detail:[D('Apa itu?','Statistik: seberapa jauh harga menyimpang dari rata-ratanya. Dasar perhitungan Bollinger Bands.')]},
    // -- Pivot --
    {name:'Pivot Points Classic',icon:'adjust',desc:'S1/S2/S3 dan R1/R2/R3 dari HLC kemarin. Level kunci harian.',detail:[D('Apa itu?','Dihitung dari High+Low+Close kemarin. Menghasilkan 7 level kunci. Digunakan trader institusi harian.')]},
    {name:'Camarilla Pivot',icon:'adjust',desc:'8 level (L1-L4, H1-H4). Presisi lebih tinggi.',detail:[D('Apa itu?','Variasi pivot point dengan 8 level. Presisi tinggi untuk intraday trading.')]},
    {name:'Woodie Pivot',icon:'adjust',desc:'Pivot dengan bobot lebih pada close. Populer di futures.',detail:[D('Apa itu?','Memberikan bobot ganda pada harga close. Lebih responsif terhadap sentimen terakhir.')]},
    {name:'Fibonacci Retracement',icon:'straighten',desc:'Level 23.6%, 38.2%, 50%, 61.8%, 78.6%. Area pullback.',detail:[D('Level Kunci','61.8% = "Golden Ratio" paling dipercaya. 50% sering jadi titik balik. Tembus 78.6% = tren gagal.'),D('Cara Pakai','Tarik dari titik awal tren ke akhir tren. Level yang muncul = area potensial support/resistance.')]},
  ]},

  // ═══ 6. PRICE ACTION / SMC (16 konsep) ═══
  {title:'Price Action & Smart Money (SMC)',subtitle:'16 KONSEP — STRATEGI BERBASIS AKSI HARGA & INSTITUSI',open:false,concepts:[
    {name:'Support & Resistance',icon:'horizontal_rule',desc:'Level harga yang berulang kali dihormati. Dasar semua analisis.',detail:[D('Support','"Lantai" harga. Buyer kuat di level ini. Semakin sering diuji, semakin kuat.'),D('Resistance','"Atap" harga. Seller kuat di level ini. Tembus → jadi support baru (role reversal).')]},
    {name:'Supply & Demand Zones',icon:'layers',desc:'Area konsentrasi order besar. Lebih luas dari S/R.',detail:[D('Apa itu?','Zona dimana order institusi besar terkonsentrasi. Berbeda dari S/R: zona punya lebar/kedalaman.')]},
    {name:'Order Blocks (SMC)',icon:'view_agenda',desc:'Candle terakhir berlawanan sebelum move besar.',detail:[D('Apa itu?','Candle bearish terakhir sebelum rally besar = Bullish OB. Candle bullish terakhir sebelum drop = Bearish OB. Area order institusi.')]},
    {name:'Fair Value Gap (FVG)',icon:'space_bar',desc:'Gap antara 3 candle (imbalance). Harga cenderung mengisi.',detail:[D('Apa itu?','Ketika candle 1 dan candle 3 tidak overlap — ada "gap" dimana tidak ada trading. Harga sering kembali mengisi gap ini.')]},
    {name:'Breaker Block',icon:'broken_image',desc:'Order block yang sudah diuji ulang dan break structure.',detail:[D('Apa itu?','OB yang gagal menahan harga. Setelah break, berubah fungsi menjadi level S/R baru (mirip role reversal).')]},
    {name:'Liquidity Zones',icon:'water',desc:'Area dengan banyak stop loss. Harga sweep ke sana.',detail:[D('Apa itu?','Di balik swing high/low ada stop loss banyak trader. Institusi sengaja "sweep" ke area ini untuk mengambil likuiditas sebelum berbalik arah.')]},
    {name:'Market Structure Shift',icon:'swap_vert',desc:'Perubahan struktur pasar dari bullish ke bearish atau sebaliknya.',detail:[D('Apa itu?','Saat rangkaian Higher High/Higher Low berubah menjadi Lower High/Lower Low. Tanda tren sudah berubah secara fundamental.')]},
    {name:'Change of Character',icon:'change_circle',desc:'Pertanda awal MSS. Break struktur minor sebelum tren berubah.',detail:[D('Apa itu?','Break minor pertama sebelum MSS terjadi. "Peringatan dini" bahwa tren mulai berubah.')]},
    {name:'Premium & Discount',icon:'sell',desc:'Premium = di atas 50% range (jual), Discount = di bawah 50% (beli).',detail:[D('Apa itu?','Bagi range menjadi 2: atas 50% = premium zone (ideal jual), bawah 50% = discount zone (ideal beli).')]},
    {name:'Mitigation Block',icon:'shield',desc:'Candle yang menetralkan order block sebelumnya.',detail:[D('Apa itu?','Saat harga kembali ke OB dan "menetralkan" order yang tersisa di sana. Area supply/demand baru terbentuk.')]},
    {name:'Rejection Block',icon:'block',desc:'Candle dengan ekor panjang menunjukkan penolakan kuat.',detail:[D('Apa itu?','Area dimana ekor candle menunjukkan rejection agresif. Menandai level kunci dimana ada penolakan harga yang kuat.')]},
    {name:'Imbalance / Gap',icon:'open_in_full',desc:'Area kosong tanpa trading. Harga cenderung kembali mengisi.',detail:[D('Apa itu?','Setiap celah harga (gap) = ada ketidakseimbangan. Pasar cenderung kembali ke area ini untuk "menyeimbangkan".')]},
    {name:'Inducement (IDM)',icon:'warning',desc:'Level palsu yang dibuat pasar untuk menarik trader retail sebelum reversal.',detail:[D('Apa itu?','Jebakan! Pasar buat level yang terlihat seperti breakout untuk menarik order retail, lalu langsung berbalik.')]},
    {name:'Power of 3 (AMD)',icon:'replay',desc:'Accumulation-Manipulation-Distribution. Siklus harian institusi.',detail:[D('Siklus','Asia = Akumulasi (range kecil). London = Manipulasi (fake move). NY = Distribusi (move sebenarnya).')]},
    {name:'Optimal Trade Entry',icon:'gps_fixed',desc:'Entry di zona 61.8-79% Fib retracement setelah MSS.',detail:[D('Apa itu?','Zona entry terbaik setelah konfirmasi MSS. Di 61.8-78.6% Fibonacci retracement dari swing yang menyebabkan MSS.')]},
    {name:'Kill Zones (ICT)',icon:'schedule',desc:'Periode waktu dengan volume institusi tertinggi.',detail:[D('Zona','Asia (19:00-00:00 EST), London (02:00-05:00), NY (07:00-10:00). Volume terbesar di sini.')]},
  ]},

  // ═══ 7. TEORI LANJUTAN (13 teori) ═══
  {title:'Teori & Metode Lanjutan',subtitle:'13 TEORI — KERANGKA BERPIKIR ANALISIS MENDALAM',open:false,concepts:[
    {name:'Elliott Wave Theory',icon:'waves',desc:'5 gelombang impuls + 3 gelombang koreksi. Siklus fraktal.',detail:[D('Apa itu?','Pasar bergerak dalam siklus: 5 gelombang searah tren (impuls) + 3 gelombang koreksi (ABC). Pola ini berulang di semua timeframe.'),D('Aturan','Wave 2 tidak boleh melampaui awal Wave 1. Wave 3 tidak boleh terpendek. Wave 4 tidak masuk wilayah Wave 1.')]},
    {name:'Wyckoff Method',icon:'account_balance',desc:'Accumulation-Markup-Distribution-Markdown. Siklus institusi.',detail:[D('4 Fase','Akumulasi (smart money beli diam-diam) → Markup (harga naik) → Distribusi (smart money jual) → Markdown (harga turun).')]},
    {name:'Dow Theory',icon:'architecture',desc:'6 prinsip dasar pasar. Fondasi semua analisis teknikal.',detail:[D('6 Prinsip','1. Pasar mendiskon segalanya. 2. 3 tren (primer, sekunder, minor). 3. Tren primer 3 fase. 4. Indeks harus saling konfirmasi. 5. Volume konfirmasi tren. 6. Tren berlanjut sampai ada sinyal reversal.')]},
    {name:'Gann Theory',icon:'architecture',desc:'Gann angles, square of 9, time-price relationship.',detail:[D('Apa itu?','W.D. Gann. Hubungan waktu dan harga. Gann angle 1x1 (45°) = keseimbangan. Kompleks dan kontroversial tapi pengikut setia.')]},
    {name:'Fibonacci Extension',icon:'straighten',desc:'Level 127.2%, 161.8%, 261.8%. Target harga setelah breakout.',detail:[D('Apa itu?','Setelah breakout, ke mana target harga? Fibonacci extension memberikan level target: 127.2%, 161.8%, 200%, 261.8%.')]},
    {name:'Fibonacci Fan',icon:'architecture',desc:'Garis diagonal dari swing point berdasarkan rasio Fibonacci.',detail:[D('Apa itu?','Garis-garis diagonal dari titik swing menggunakan sudut Fibonacci. Area support/resistance diagonal.')]},
    {name:'Fibonacci Time Zones',icon:'schedule',desc:'Proyeksi waktu berdasarkan angka Fibonacci.',detail:[D('Apa itu?','Garis vertikal di interval Fibonacci (1,2,3,5,8,13,21...). Prediksi KAPAN reversal mungkin terjadi.')]},
    {name:'Fibonacci Arc',icon:'trip_origin',desc:'Setengah lingkaran dari swing point. S/R bergerak.',detail:[D('Apa itu?','Arc (busur) dari swing point. Support/resistance yang bergerak seiring waktu.')]},
    {name:'Market Profile (TPO)',icon:'view_column',desc:'Distribusi waktu di setiap level harga.',detail:[D('Apa itu?','Time Price Opportunity. Berapa lama harga habiskan di setiap level. POC (Point of Control) = level harga paling aktif.')]},
    {name:'Volume Spread Analysis',icon:'analytics',desc:'Analisis volume + spread candle. Membaca smart money.',detail:[D('Apa itu?','Tom Williams. Analisis BERSAMA antara volume dan ukuran candle. Spread besar + volume kecil = smart money distribusi.')]},
    {name:'Tape Reading',icon:'receipt_long',desc:'Membaca aliran order secara real-time.',detail:[D('Apa itu?','Membaca order flow langsung. Melihat siapa beli/jual, seberapa besar, seberapa agresif. Teknik trader floor klasik.')]},
    {name:'Intermarket Analysis',icon:'public',desc:'Korelasi antar pasar: stocks, bonds, komoditas, forex.',detail:[D('Apa itu?','John Murphy. Bagaimana pasar saling mempengaruhi: Dollar naik → Komoditas turun. Yield naik → Stocks turun (biasanya).')]},
    {name:'Sector Rotation',icon:'sync',desc:'Rotasi sektor berdasarkan siklus ekonomi.',detail:[D('Apa itu?','Di setiap fase ekonomi, sektor berbeda outperform. Early cycle: konsumer. Mid: teknologi. Late: energi. Recession: defensif.')]},
  ]},

  // ═══ 8. JENIS CHART (8 jenis) ═══
  {title:'Jenis-Jenis Chart',subtitle:'8 JENIS — CARA BERBEDA MEMBACA PERGERAKAN HARGA',open:false,concepts:[
    {name:'Heikin Ashi',icon:'candlestick_chart',desc:'Candle yang dihaluskan. Mudah baca tren, filter noise.',detail:[D('Apa itu?','Candle modifikasi: Open = rata-rata candle sebelum, Close = rata-rata OHLC. Tren terlihat lebih jelas tapi ada lag.'),D('Tips','Jangan gunakan untuk entry/exit presisi. Gunakan untuk konfirmasi arah tren saja.')]},
    {name:'Renko Chart',icon:'grid_view',desc:'Kotak berdasarkan pergerakan harga, bukan waktu.',detail:[D('Apa itu?','Kotak baru dibuat HANYA jika harga bergerak N poin. Mengabaikan waktu total. Filter noise sempurna.')]},
    {name:'Point & Figure (P&F)',icon:'grid_on',desc:'X (naik) dan O (turun) tanpa waktu. Fokus murni harga.',detail:[D('Apa itu?','Kolom X untuk kenaikan, O untuk penurunan. Reversal column baru saat harga bergerak N box berlawanan. Tanpa dimensi waktu.')]},
    {name:'Kagi Chart',icon:'show_chart',desc:'Garis yang berubah arah saat harga reversal melampaui threshold.',detail:[D('Apa itu?','Garis tebal (yang) = bullish, tipis (yin) = bearish. Berubah ketika harga reversal melampaui threshold tertentu.')]},
    {name:'Three-Line Break',icon:'view_stream',desc:'Baris baru hanya jika harga melampaui 3 baris sebelumnya.',detail:[D('Apa itu?','Candle baru dibuat hanya jika harga close melampaui high/low dari 3 candle sebelumnya. Filter tren sangat efektif.')]},
    {name:'Candlevolume Chart',icon:'candlestick_chart',desc:'Width candle proporsional dengan volume.',detail:[D('Apa itu?','Candle biasa tapi lebarnya berbeda-beda sesuai volume. Volume tinggi = candle lebar. Visualisasi volume intuitif.')]},
    {name:'Range Bar Chart',icon:'view_week',desc:'Candle baru berdasarkan range tertentu, bukan waktu.',detail:[D('Apa itu?','Mirip Renko tapi menggunakan OHLC. Candle baru hanya jika range mencapai N poin. Menghilangkan noise waktu.')]},
    {name:'Tick Chart',icon:'timer',desc:'Candle baru per N transaksi. Sangat baik untuk scalping.',detail:[D('Apa itu?','Setiap N transaksi = 1 candle baru. Saat pasar aktif = candle cepat. Saat sepi = candle lambat. Ideal scalping intraday.')]},
  ]},
]
