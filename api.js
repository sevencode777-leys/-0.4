
// ملف التكامل مع APIs الخارجية - رفيق 0.4

class RafeeqAPI {
    constructor() {
        this.baseURL = 'https://api.rafeeq.app';
        this.aladhanAPI = 'https://api.aladhan.com/v1';
        this.quranAPI = 'https://api.quran.com/api/v4';
        this.hadithAPI = 'https://api.hadith.gading.dev';
    }

    // Prayer Times API
    async getPrayerTimes(latitude, longitude, method = 4) {
        try {
            const response = await fetch(
                `${this.aladhanAPI}/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch prayer times');
            }
            
            const data = await response.json();
            return {
                fajr: data.data.timings.Fajr,
                dhuhr: data.data.timings.Dhuhr,
                asr: data.data.timings.Asr,
                maghrib: data.data.timings.Maghrib,
                isha: data.data.timings.Isha,
                sunrise: data.data.timings.Sunrise
            };
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            throw error;
        }
    }

    // Qibla Direction API
    async getQiblaDirection(latitude, longitude) {
        try {
            const response = await fetch(
                `${this.aladhanAPI}/qibla/${latitude}/${longitude}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch qibla direction');
            }
            
            const data = await response.json();
            return data.data.direction;
        } catch (error) {
            console.error('Error fetching qibla direction:', error);
            throw error;
        }
    }

    // Quran API
    async getChapter(chapterNumber, language = 'ar') {
        try {
            const response = await fetch(
                `${this.quranAPI}/chapters/${chapterNumber}/verses?language=${language}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch chapter');
            }
            
            const data = await response.json();
            return data.verses;
        } catch (error) {
            console.error('Error fetching chapter:', error);
            throw error;
        }
    }

    // Hadith API
    async getHadithByBook(bookSlug, hadithNumber) {
        try {
            const response = await fetch(
                `${this.hadithAPI}/books/${bookSlug}/${hadithNumber}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch hadith');
            }
            
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching hadith:', error);
            throw error;
        }
    }

    // Search Hadith
    async searchHadith(query, book = '') {
        try {
            const params = new URLSearchParams({
                q: query,
                book: book
            });
            
            const response = await fetch(
                `${this.hadithAPI}/hadiths?${params.toString()}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to search hadith');
            }
            
            const data = await response.json();
            return data.data.hadiths;
        } catch (error) {
            console.error('Error searching hadith:', error);
            throw error;
        }
    }

    // Gold/Silver Prices for Zakat
    async getMetalPrices() {
        try {
            // استخدام API مجاني لأسعار المعادن
            const response = await fetch(
                'https://api.metals.live/v1/spot'
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch metal prices');
            }
            
            const data = await response.json();
            return {
                gold: data.gold, // دولار للأونصة
                silver: data.silver
            };
        } catch (error) {
            console.error('Error fetching metal prices:', error);
            // أسعار افتراضية بالريال السعودي
            return {
                gold: 200, // ريال للجرام
                silver: 2.5
            };
        }
    }

    // Competition API
    async getCompetitionData() {
        try {
            const response = await fetch(`${this.baseURL}/competitions/current`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch competition data');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching competition data:', error);
            // بيانات افتراضية للمحاكاة
            return {
                current: {
                    title: 'حفظ سورة يس',
                    description: 'مسابقة أسبوعية لحفظ سورة يس كاملة',
                    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                    participants: 1247,
                    userProgress: 45
                },
                leaderboard: [
                    { name: 'محمد الأحمد', score: 950, rank: 1 },
                    { name: 'فاطمة السيد', score: 890, rank: 2 },
                    { name: 'أحمد علي', score: 850, rank: 3 },
                    { name: 'زينب محمود', score: 820, rank: 4 },
                    { name: 'يوسف الحسن', score: 780, rank: 5 },
                    { name: 'مريم عبدالله', score: 750, rank: 6 },
                    { name: 'أنت', score: 720, rank: 7, isCurrentUser: true }
                ]
            };
        }
    }

    // Audio Streaming for Quran
    getAudioUrl(surahNumber, reciter = 'mishary') {
        const reciters = {
            mishary: 'https://server8.mp3quran.net/ahmad_nu3man',
            sudais: 'https://server7.mp3quran.net/s_sudais',
            minshawi: 'https://server10.mp3quran.net/minsh'
        };
        
        const baseURL = reciters[reciter] || reciters.mishary;
        const paddedNumber = surahNumber.toString().padStart(3, '0');
        
        return `${baseURL}/${paddedNumber}.mp3`;
    }

    // Offline Data Storage
    async cacheEssentialData() {
        try {
            // تخزين البيانات الأساسية للعمل أوفلاين
            const essentialData = {
                adhkar: await this.getAdhkarData(),
                basicSurahs: await this.getBasicSurahs(),
                essentialHadith: await this.getEssentialHadith()
            };
            
            localStorage.setItem('essentialData', JSON.stringify(essentialData));
            return true;
        } catch (error) {
            console.error('Error caching essential data:', error);
            return false;
        }
    }

    async getAdhkarData() {
        // جلب بيانات الأذكار
        return {
            morning: [
                {
                    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                    translation: 'أصبحنا وأصبح الملك لله رب العالمين',
                    repeat: 'مرة واحدة',
                    benefit: 'يحفظ من الشر'
                }
                // المزيد من الأذكار...
            ]
        };
    }

    async getBasicSurahs() {
        // جلب السور الأساسية
        return [
            { number: 1, name: 'الفاتحة', verses: 7 },
            { number: 2, name: 'البقرة', verses: 286 },
            { number: 36, name: 'يس', verses: 83 },
            { number: 67, name: 'الملك', verses: 30 },
            { number: 112, name: 'الإخلاص', verses: 4 },
            { number: 113, name: 'الفلق', verses: 5 },
            { number: 114, name: 'الناس', verses: 6 }
        ];
    }

    async getEssentialHadith() {
        // جلب الأحاديث الأساسية
        return [
            {
                text: 'إنما الأعمال بالنيات...',
                source: 'صحيح البخاري',
                grade: 'صحيح'
            }
        ];
    }
}

// تصدير الفئة للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RafeeqAPI;
} else {
    window.RafeeqAPI = RafeeqAPI;
}</new_str>
