// التطبيق الرئيسي - رفيق 0.4
class RafeeqApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.isDarkMode = false;
        this.currentCount = 0;
        this.isRecording = false;
        this.currentAudio = null;
        this.prayerTimes = {};
        this.qiblaDirection = 0;
        this.memorizedVerses = [];
        this.currentVerse = 1;
        this.currentSurah = 1;
        this.voiceNotes = [];
        this.arStream = null;
        this.deviceOrientation = 0;
        this.zakatRates = {
            nisab: 85, // نصاب الذهب بالجرام
            rate: 0.025 // 2.5%
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.updatePrayerTimes();
        this.loadQuranData();
        this.loadHadithData();
        this.loadAdhkarData();
        this.loadVoiceNotes();
        this.setupServiceWorker();
        this.detectLocation();
        this.setupDeviceMotion();
        this.loadCompetitionData();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        // Chat functionality
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Voice functionality
        document.getElementById('voice-btn').addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Quran controls
        document.getElementById('play-pause').addEventListener('click', () => {
            this.toggleAudioPlayback();
        });

        document.getElementById('next-page').addEventListener('click', () => {
            this.nextPage();
        });

        document.getElementById('prev-page').addEventListener('click', () => {
            this.prevPage();
        });

        // Tasbih counter
        document.getElementById('counter-btn').addEventListener('click', () => {
            this.incrementCounter();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetCounter();
        });

        // Memorization
        document.getElementById('record-btn').addEventListener('click', () => {
            this.toggleRecording();
        });

        document.getElementById('listen-btn').addEventListener('click', () => {
            this.playVerseAudio();
        });

        // Hadith search
        document.getElementById('hadith-search-btn').addEventListener('click', () => {
            this.searchHadith();
        });

        // Prayer location
        document.getElementById('location-btn').addEventListener('click', () => {
            this.detectLocation();
        });

        // Adhkar filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterAdhkar(e.target.dataset.filter);
            });
        });

        // Tasbih presets
        document.querySelectorAll('.tasbih-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTasbihText(e.target.dataset.dhikr);
            });
        });

        // Modal closes
        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeSettings();
        });

        // New features events
        this.bindNewFeatureEvents();
    }

    bindNewFeatureEvents() {
        // AR Qibla
        const startArBtn = document.getElementById('start-ar-btn');
        if (startArBtn) {
            startArBtn.addEventListener('click', () => {
                this.startARQibla();
            });
        }

        // Voice Notes
        const newNoteBtn = document.getElementById('new-note-btn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => {
                this.toggleRecordSection();
            });
        }

        const startRecordBtn = document.getElementById('start-record');
        if (startRecordBtn) {
            startRecordBtn.addEventListener('click', () => {
                this.startVoiceNote();
            });
        }

        const stopRecordBtn = document.getElementById('stop-record');
        if (stopRecordBtn) {
            stopRecordBtn.addEventListener('click', () => {
                this.stopVoiceNote();
            });
        }

        // Zakat Calculator
        const calculateZakatBtn = document.getElementById('calculate-zakat');
        if (calculateZakatBtn) {
            calculateZakatBtn.addEventListener('click', () => {
                this.calculateZakat();
            });
        }

        const payZakatBtn = document.getElementById('pay-zakat');
        if (payZakatBtn) {
            payZakatBtn.addEventListener('click', () => {
                this.processZakatPayment();
            });
        }

        // Competition
        const joinCompetitionBtn = document.getElementById('join-competition-btn');
        if (joinCompetitionBtn) {
            joinCompetitionBtn.addEventListener('click', () => {
                this.joinCompetition();
            });
        }
    }

    // Navigation
    switchSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.classList.add('fade-in');
        }

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'quran':
                this.loadQuranPage();
                break;
            case 'hadith':
                this.loadHadithList();
                break;
            case 'prayer':
                this.updatePrayerTimes();
                this.updateQibla();
                break;
            case 'adhkar':
                this.loadAdhkarList();
                break;
            case 'memorization':
                this.loadMemorizationProgress();
                break;
            case 'ar-qibla':
                this.loadARQibla();
                break;
            case 'voice-notes':
                this.loadVoiceNotes();
                break;
            case 'competitions':
                this.loadCompetitionData();
                break;
            case 'zakat':
                this.loadZakatCalculator();
                break;
        }
    }

    // AR Qibla Functionality
    async startARQibla() {
        try {
            this.arStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment' // الكاميرا الخلفية
                }
            });

            const video = document.getElementById('ar-video');
            const canvas = document.getElementById('ar-canvas');
            video.srcObject = this.arStream;
            video.style.display = 'block';

            this.drawQiblaDirection(canvas);

        } catch (error) {
            console.error('خطأ في تشغيل الكاميرا:', error);
            alert('تعذر تشغيل الكاميرا. تأكد من السماح بالوصول للكاميرا.');
        }
    }

    drawQiblaDirection(canvas) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw compass
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw qibla arrow
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((this.qiblaDirection + this.deviceOrientation) * Math.PI / 180);

        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(-10, -20);
        ctx.lineTo(10, -20);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Draw label
        ctx.fillStyle = '#28a745';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('اتجاه القبلة', centerX, centerY + 80);
    }

    loadARQibla() {
        // تحضير واجهة AR
        this.updateQiblaDisplay();
    }

    // Voice Notes Functionality
    toggleRecordSection() {
        const recordSection = document.getElementById('record-section');
        recordSection.style.display = recordSection.style.display === 'none' ? 'block' : 'none';
    }

    startVoiceNote() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('المتصفح لا يدعم تسجيل الصوت');
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.noteMediaRecorder = new MediaRecorder(stream);
                this.noteAudioChunks = [];
                this.noteStartTime = Date.now();

                this.noteMediaRecorder.ondataavailable = event => {
                    this.noteAudioChunks.push(event.data);
                };

                this.noteMediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.noteAudioChunks, { type: 'audio/wav' });
                    this.saveVoiceNote(audioBlob);
                };

                this.noteMediaRecorder.start();
                this.isNoteRecording = true;
                this.startRecordTimer();

                document.getElementById('start-record').disabled = true;
                document.getElementById('stop-record').disabled = false;
            })
            .catch(error => {
                console.error('خطأ في بدء التسجيل:', error);
                alert('تعذر بدء التسجيل. يرجى السماح بالوصول للميكروفون.');
            });
    }

    stopVoiceNote() {
        if (this.noteMediaRecorder && this.isNoteRecording) {
            this.noteMediaRecorder.stop();
            this.isNoteRecording = false;
            this.stopRecordTimer();

            // إيقاف جميع المسارات الصوتية
            this.noteMediaRecorder.stream.getTracks().forEach(track => track.stop());

            document.getElementById('start-record').disabled = false;
            document.getElementById('stop-record').disabled = true;
        }
    }

    startRecordTimer() {
        this.recordTimer = setInterval(() => {
            const elapsed = Date.now() - this.noteStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.querySelector('.record-timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopRecordTimer() {
        if (this.recordTimer) {
            clearInterval(this.recordTimer);
        }
    }

    saveVoiceNote(audioBlob) {
        const title = document.getElementById('note-title').value || 'مذكرة بدون عنوان';
        const note = {
            id: Date.now(),
            title: title,
            date: new Date().toLocaleDateString('ar-SA'),
            duration: Math.floor((Date.now() - this.noteStartTime) / 1000),
            audioData: audioBlob
        };

        this.voiceNotes.push(note);
        this.saveNotesToStorage();
        this.displayVoiceNotes();

        // Clear form
        document.getElementById('note-title').value = '';
        document.querySelector('.record-timer').textContent = '00:00';
        this.toggleRecordSection();

        // Show success message
        this.showNotification('تم حفظ المذكرة بنجاح', 'success');
    }

    loadVoiceNotes() {
        const saved = localStorage.getItem('voiceNotes');
        if (saved) {
            this.voiceNotes = JSON.parse(saved);
        }
        this.displayVoiceNotes();
    }

    displayVoiceNotes() {
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;

        notesList.innerHTML = '';

        if (this.voiceNotes.length === 0) {
            notesList.innerHTML = '<p class="text-center">لا توجد مذكرات محفوظة</p>';
            return;
        }

        this.voiceNotes.forEach(note => {
            const noteCard = this.createNoteCard(note);
            notesList.appendChild(noteCard);
        });
    }

    createNoteCard(note) {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <div class="note-header">
                <div class="note-title">${note.title}</div>
                <div class="note-date">${note.date}</div>
            </div>
            <div class="note-info">
                <span>المدة: ${note.duration} ثانية</span>
            </div>
            <div class="note-controls">
                <button class="btn-play-note" onclick="app.playVoiceNote(${note.id})">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn-delete-note" onclick="app.deleteVoiceNote(${note.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return card;
    }

    playVoiceNote(noteId) {
        const note = this.voiceNotes.find(n => n.id === noteId);
        if (note && note.audioData) {
            const audio = new Audio(URL.createObjectURL(note.audioData));
            audio.play();
        }
    }

    deleteVoiceNote(noteId) {
        if (confirm('هل تريد حذف هذه المذكرة؟')) {
            this.voiceNotes = this.voiceNotes.filter(note => note.id !== noteId);
            this.saveNotesToStorage();
            this.displayVoiceNotes();
            this.showNotification('تم حذف المذكرة', 'info');
        }
    }

    saveNotesToStorage() {
        // حفظ البيانات الأساسية فقط (بدون البلوب الصوتي لتوفير المساحة)
        const notesData = this.voiceNotes.map(note => ({
            id: note.id,
            title: note.title,
            date: note.date,
            duration: note.duration
        }));
        localStorage.setItem('voiceNotes', JSON.stringify(notesData));
    }

    // Zakat Calculator
    calculateZakat() {
        const cash = parseFloat(document.getElementById('cash-amount').value) || 0;
        const gold = parseFloat(document.getElementById('gold-amount').value) || 0;
        const silver = parseFloat(document.getElementById('silver-amount').value) || 0;
        const stocks = parseFloat(document.getElementById('stocks-amount').value) || 0;

        // أسعار تقريبية (في التطبيق الحقيقي ستُجلب من API)
        const goldPrice = 200; // ريال للجرام
        const silverPrice = 2.5; // ريال للجرام

        const totalWealth = cash + (gold * goldPrice) + (silver * silverPrice) + stocks;
        const nisabAmount = this.zakatRates.nisab * goldPrice;

        let zakatAmount = 0;
        if (totalWealth >= nisabAmount) {
            zakatAmount = totalWealth * this.zakatRates.rate;
        }

        this.displayZakatResult(zakatAmount, totalWealth, nisabAmount);
    }

    displayZakatResult(zakatAmount, totalWealth, nisabAmount) {
        const resultDiv = document.getElementById('zakat-result');
        resultDiv.style.display = 'block';

        const amountSpan = document.querySelector('.result-amount .amount');
        amountSpan.textContent = Math.round(zakatAmount).toLocaleString('ar-SA');

        if (zakatAmount === 0) {
            document.querySelector('.result-note').textContent = 
                `مالك (${Math.round(totalWealth).toLocaleString('ar-SA')} ريال) أقل من النصاب (${Math.round(nisabAmount).toLocaleString('ar-SA')} ريال)`;
            document.getElementById('pay-zakat').style.display = 'none';
        } else {
            document.querySelector('.result-note').textContent = 
                'هذا المبلغ واجب الزكاة عليك';
            document.getElementById('pay-zakat').style.display = 'flex';
        }

        resultDiv.classList.add('bounce-in');
    }

    processZakatPayment() {
        // في التطبيق الحقيقي سيتم التكامل مع بوابة دفع
        this.showNotification('جاري تحضير صفحة الدفع...', 'info');

        setTimeout(() => {
            alert('تم توجيهك لصفحة الدفع الآمنة. جزاك الله خيراً على أداء الزكاة!');
        }, 2000);
    }

    loadZakatCalculator() {
        // تحديث أسعار الذهب والفضة (في التطبيق الحقيقي من API)
        console.log('تم تحميل حاسبة الزكاة');
    }

    // Competition System
    loadCompetitionData() {
        this.competitionData = {
            current: {
                title: 'حفظ سورة يس',
                description: 'مسابقة أسبوعية لحفظ سورة يس كاملة',
                endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // بعد 3 أيام
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

    joinCompetition() {
        this.showNotification('تم تسجيلك في المسابقة! بالتوفيق', 'success');
        // في التطبيق الحقيقي سيتم التسجيل في قاعدة البيانات
    }

    // Device Motion for AR Tasbih
    setupDeviceMotion() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                this.deviceOrientation = event.alpha || 0;
                this.updateARElements();
            });
        }

        // Shake detection for tasbih
        if (window.DeviceMotionEvent) {
            let lastTime = 0;
            let lastX = 0, lastY = 0, lastZ = 0;

            window.addEventListener('devicemotion', (event) => {
                const acceleration = event.accelerationIncludingGravity;
                const curTime = Date.now();

                if ((curTime - lastTime) > 100) {
                    const diffTime = curTime - lastTime;
                    lastTime = curTime;

                    const x = acceleration.x;
                    const y = acceleration.y;
                    const z = acceleration.z;

                    const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

                    if (speed > 300) {
                        this.onDeviceShake();
                    }

                    lastX = x;
                    lastY = y;
                    lastZ = z;
                }
            });
        }
    }

    onDeviceShake() {
        // إذا كان المستخدم في صفحة الأذكار أو المسبحة
        if (this.currentSection === 'adhkar') {
            this.incrementCounter();
            this.vibrateDevice();
        }
    }

    vibrateDevice() {
        if (navigator.vibrate) {
            navigator.vibrate(100); // اهتزاز لمدة 100ms
        }
    }

    updateARElements() {
        // تحديث العناصر التي تستخدم الـ AR
        const canvas = document.getElementById('ar-canvas');
        if (canvas && this.currentSection === 'ar-qibla') {
            this.drawQiblaDirection(canvas);
        }
    }

    // Enhanced Chat/AI Assistant
    async processAIQuery(query) {
        this.showLoading();

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        let response = await this.generateEnhancedResponse(query);
        this.addMessageToChat(response, 'assistant');

        this.hideLoading();
    }

    async generateEnhancedResponse(query) {
        const lowerQuery = query.toLowerCase();

        // Enhanced responses with more Islamic knowledge
        if (lowerQuery.includes('زكاة')) {
            return `الزكاة ركن من أركان الإسلام الخمسة. يمكنك استخدام حاسبة الزكاة في التطبيق لحساب المبلغ المطلوب. النصاب الحالي للذهب هو ${this.zakatRates.nisab} جرام، والمعدل 2.5% من إجمالي المال. هل تريد الانتقال لحاسبة الزكاة؟`;
        }

        if (lowerQuery.includes('مسابقة') || lowerQuery.includes('تحدي')) {
            return `المسابقة الحالية هي "${this.competitionData.current.title}". يمكنك المشاركة والحصول على نقاط ومكافآت. موقعك الحالي في اللوحة هو المركز السابع بـ 720 نقطة. هل تريد الانضمام للمسابقة؟`;
        }

        if (lowerQuery.includes('مذكرة') || lowerQuery.includes('تسجيل')) {
            return `يمكنك تسجيل مذكراتك الصوتية الشخصية للتأملات والخواطر الإيمانية. هذه الميزة تساعدك في متابعة رحلتك الروحية. انتقل لقسم المذكرات الصوتية لبدء التسجيل.`;
        }

        if (lowerQuery.includes('واقع معزز') || lowerQuery.includes('ar')) {
            return `ميزة الواقع المعزز تتيح لك رؤية اتجاه القبلة مباشرة عبر كاميرا جهازك. فقط وجه الكاميرا نحو الأفق وسيظهر الاتجاه الصحيح. انتقل لقسم "AR القبلة" لتجربة هذه الميزة.`;
        }

        // استدعاء الدالة الأساسية للردود الأخرى
        return await this.generateResponse(query);
    }

    // Enhanced Tasbih with haptic feedback
    incrementCounter() {
        this.currentCount++;
        document.getElementById('count-number').textContent = this.currentCount;

        // تأثيرات بصرية محسنة
        const countElement = document.getElementById('count-number');
        countElement.style.transform = 'scale(1.2)';
        countElement.classList.add('glow');

        setTimeout(() => {
            countElement.style.transform = 'scale(1)';
            countElement.classList.remove('glow');
        }, 200);

        // اهتزاز خفيف
        this.vibrateDevice();

        // صوت تسبيح خفيف (اختياري)
        this.playTasbihSound();

        // حفظ العدد محلياً
        localStorage.setItem('tasbihCount', this.currentCount);

        // تنبيه عند الوصول لأرقام معينة
        if (this.currentCount % 33 === 0) {
            this.showCountAlert(this.currentCount);
        }
    }

    playTasbihSound() {
        // صوت خفيف للتسبيح
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.type = 'sine';

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Enhanced Prayer Times with notifications
    async updatePrayerTimes() {
        try {
            // في التطبيق الحقيقي سيتم استخدام API حقيقي
            const position = await this.getCurrentPosition();

            // محاكاة استدعاء API لأوقات الصلاة
            this.prayerTimes = await this.fetchPrayerTimes(position.lat, position.lng);

            this.updatePrayerDisplay();
            this.calculateNextPrayer();
            this.scheduleNotifications();

        } catch (error) {
            console.error('خطأ في تحديث أوقات الصلاة:', error);
            // استخدام أوقات افتراضية
            this.prayerTimes = {
                fajr: '04:45',
                sunrise: '06:15',
                dhuhr: '12:30',
                asr: '15:45',
                maghrib: '17:30',
                isha: '19:00'
            };
            this.updatePrayerDisplay();
            this.calculateNextPrayer();
        }
    }

    async fetchPrayerTimes(lat, lng) {
        // محاكاة API call - في التطبيق الحقيقي سيستخدم Aladhan API
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    fajr: '04:45',
                    sunrise: '06:15',
                    dhuhr: '12:30',
                    asr: '15:45',
                    maghrib: '17:30',
                    isha: '19:00'
                });
            }, 1000);
        });
    }

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }),
                error => reject(error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        });
    }

    scheduleNotifications() {
        if ('Notification' in window && Notification.permission === 'granted') {
            // جدولة التنبيهات لأوقات الصلاة
            Object.entries(this.prayerTimes).forEach(([prayer, time]) => {
                this.schedulePrayerNotification(prayer, time);
            });
        }
    }

    schedulePrayerNotification(prayer, time) {
        const now = new Date();
        const prayerTime = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        prayerTime.setHours(hours, minutes, 0, 0);

        if (prayerTime <= now) {
            prayerTime.setDate(prayerTime.getDate() + 1); // اليوم التالي
        }

        const timeDiff = prayerTime.getTime() - now.getTime();
        const prayerNames = {
            fajr: 'الفجر',
            dhuhr: 'الظهر',
            asr: 'العصر',
            maghrib: 'المغرب',
            isha: 'العشاء'
        };

        setTimeout(() => {
            new Notification(`حان وقت صلاة ${prayerNames[prayer]}`, {
                body: `الوقت الآن ${time}`,
                icon: 'icons/icon-192x192.png',
                badge: 'icons/icon-72x72.png'
            });
        }, timeDiff);
    }

    // Notification system
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Theme Management
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');

        const icon = document.querySelector('#theme-toggle i');
        icon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';

        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }

    // Settings
    openSettings() {
        document.getElementById('settings-modal').style.display = 'block';
    }

    closeSettings() {
        document.getElementById('settings-modal').style.display = 'none';
    }

    loadSettings() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.toggleTheme();
        }

        const fontSize = localStorage.getItem('fontSize') || '18';
        const fontSizeSlider = document.getElementById('font-size-slider');
        if (fontSizeSlider) {
            fontSizeSlider.value = fontSize;
            this.updateFontSize(fontSize);
        }

        // طلب إذن الإشعارات
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    updateFontSize(size) {
        document.documentElement.style.setProperty('--base-font-size', size + 'px');
        localStorage.setItem('fontSize', size);
    }

    // Chat/AI Assistant
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        this.addMessageToChat(message, 'user');
        input.value = '';

        // Simulate AI response
        await this.processAIQuery(message);
    }

    addMessageToChat(message, sender) {
        const chatContainer = document.getElementById('chat-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'assistant-message';
        messageDiv.textContent = message;

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async generateResponse(query) {
        // Simple keyword-based responses for demo
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('صلاة') || lowerQuery.includes('صلوات')) {
            return `أوقات الصلاة اليوم:\nالفجر: ${this.prayerTimes.fajr || '04:45'}\nالظهر: ${this.prayerTimes.dhuhr || '12:30'}\nالعصر: ${this.prayerTimes.asr || '15:45'}\nالمغرب: ${this.prayerTimes.maghrib || '17:30'}\nالعشاء: ${this.prayerTimes.isha || '19:00'}`;
        }

        if (lowerQuery.includes('قبلة')) {
            return `اتجاه القبلة من موقعك الحالي هو شمال شرق (${this.qiblaDirection}°). يمكنك استخدام البوصلة في قسم أوقات الصلاة أو ميزة الواقع المعزز للحصول على اتجاه دقيق.`;
        }

        if (lowerQuery.includes('حفظ') || lowerQuery.includes('مراجعة')) {
            return `لديك ${this.memorizedVerses.length} آية محفوظة. يُنصح بمراجعة 10-15 آية يومياً للحفاظ على الحفظ. يمكنك أيضاً المشاركة في المسابقات لتحفيز نفسك. هل تريد بدء جلسة مراجعة؟`;
        }

        if (lowerQuery.includes('ذكر') || lowerQuery.includes('أذكار')) {
            return `يمكنك الوصول لأذكار الصباح والمساء وأذكار النوم من قسم الأذكار. كما يمكنك استخدام المسبحة الرقمية أو المسبحة التفاعلية التي تعمل بهز الجهاز.`;
        }

        // Default response
        return 'أعتذر، لم أفهم سؤالك بوضوح. يمكنك سؤالي عن أوقات الصلاة، اتجاه القبلة، الأذكار، الزكاة، المسابقات، أو متابعة الحفظ. كيف يمكنني مساعدتك؟';
    }

    // Audio/Voice functionality
    toggleVoiceInput() {
        if (this.isRecording) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('المتصفح لا يدعم التعرف على الصوت');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ar-SA';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onstart = () => {
            this.isRecording = true;
            document.querySelector('#voice-btn i').className = 'fas fa-stop';
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input').value = transcript;
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            document.querySelector('#voice-btn i').className = 'fas fa-microphone';
        };

        this.recognition.start();
    }

    stopVoiceInput() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    // Quran functionality
    loadQuranData() {
        // Simplified Quran data - في التطبيق الحقيقي سيتم تحميل البيانات من API
        this.quranData = {
            1: {
                name: 'الفاتحة',
                verses: [
                    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                    'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                    'الرَّحْمَٰنِ الرَّحِيمِ',
                    'مَالِكِ يَوْمِ الدِّينِ',
                    'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
                    'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
                    'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ'
                ]
            }
        };
    }

    loadQuranPage() {
        const quranText = document.getElementById('quran-text');
        const surah = this.quranData[this.currentSurah];
        
        if (!surah) return;

        let html = '<div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>';
        
        surah.verses.forEach((verse, index) => {
            html += `
                <div class="verse" data-verse="${index + 1}">
                    <span class="verse-text">${verse}</span>
                    <span class="verse-number">﴿${this.toArabicNumbers(index + 1)}﴾</span>
                </div>
            `;
        });

        quranText.innerHTML = html;
    }

    toggleAudioPlayback() {
        const playBtn = document.getElementById('play-pause');
        const icon = playBtn.querySelector('i');
        
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
            icon.className = 'fas fa-play';
        } else {
            this.playCurrentSurah();
            icon.className = 'fas fa-pause';
        }
    }

    playCurrentSurah() {
        // في التطبيق الحقيقي سيتم تحميل الملف الصوتي من CDN
        const audioUrl = `audio/quran/${this.currentSurah}.mp3`;
        
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
        
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.play().catch(() => {
            // Fallback for demo - use text-to-speech
            const verseText = document.querySelector('.verse-text').textContent;
            this.speakText(verseText);
        });
        
        this.currentAudio.onended = () => {
            document.querySelector('#play-pause i').className = 'fas fa-play';
        };
    }

    nextPage() {
        // في التطبيق الحقيقي سيتم التنقل بين الصفحات
        this.currentSurah = Math.min(this.currentSurah + 1, 114);
        this.loadQuranPage();
        this.updatePageInfo();
    }

    prevPage() {
        this.currentSurah = Math.max(this.currentSurah - 1, 1);
        this.loadQuranPage();
        this.updatePageInfo();
    }

    updatePageInfo() {
        document.getElementById('page-info').textContent = `سورة ${this.currentSurah} من 114`;
    }

    // Hadith functionality
    loadHadithData() {
        this.hadithData = [
            {
                id: 1,
                text: 'عن عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله، ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه"',
                source: 'صحيح البخاري - كتاب الإيمان',
                grade: 'صحيح',
                book: 'bukhari'
            },
            {
                id: 2,
                text: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: "المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف، وفي كل خير"',
                source: 'صحيح مسلم - كتاب القدر',
                grade: 'صحيح',
                book: 'muslim'
            }
        ];
    }

    loadHadithList() {
        const resultsContainer = document.getElementById('hadith-results');
        resultsContainer.innerHTML = '';

        this.hadithData.forEach(hadith => {
            const hadithCard = this.createHadithCard(hadith);
            resultsContainer.appendChild(hadithCard);
        });
    }

    createHadithCard(hadith) {
        const card = document.createElement('div');
        card.className = 'hadith-card';
        card.innerHTML = `
            <div class="hadith-header">
                <span class="hadith-source">${hadith.source}</span>
                <span class="hadith-grade grade-sahih">${hadith.grade}</span>
            </div>
            <div class="hadith-text">${hadith.text}</div>
            <div class="hadith-footer">
                <button class="btn-bookmark" onclick="app.bookmarkHadith(${hadith.id})">
                    <i class="far fa-bookmark"></i>
                </button>
                <button class="btn-share" onclick="app.shareHadith(${hadith.id})">
                    <i class="fas fa-share"></i>
                </button>
                <button class="btn-audio" onclick="app.speakText('${hadith.text}')">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        return card;
    }

    searchHadith() {
        const query = document.getElementById('hadith-search').value.trim();
        if (!query) {
            this.loadHadithList();
            return;
        }

        const filteredHadith = this.hadithData.filter(hadith => 
            hadith.text.includes(query) || hadith.source.includes(query)
        );

        const resultsContainer = document.getElementById('hadith-results');
        resultsContainer.innerHTML = '';

        if (filteredHadith.length === 0) {
            resultsContainer.innerHTML = '<p class="text-center">لم يتم العثور على نتائج</p>';
            return;
        }

        filteredHadith.forEach(hadith => {
            const hadithCard = this.createHadithCard(hadith);
            resultsContainer.appendChild(hadithCard);
        });
    }

    bookmarkHadith(hadithId) {
        // إضافة للمفضلة
        const bookmarks = JSON.parse(localStorage.getItem('hadithBookmarks') || '[]');
        if (!bookmarks.includes(hadithId)) {
            bookmarks.push(hadithId);
            localStorage.setItem('hadithBookmarks', JSON.stringify(bookmarks));
        }
        this.showNotification('تم إضافة الحديث للمفضلة', 'success');
    }

    shareHadith(hadithId) {
        const hadith = this.hadithData.find(h => h.id === hadithId);
        if (navigator.share) {
            navigator.share({
                title: 'حديث شريف - رفيق',
                text: hadith.text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(hadith.text);
            this.showNotification('تم نسخ الحديث', 'success');
        }
    }

    // Prayer Times
    async updatePrayerTimes() {
        // في التطبيق الحقيقي سيتم حساب أوقات الصلاة بناءً على الموقع
        // Moved to the enhanced section above
        try {
            const position = await this.getCurrentPosition();
            this.prayerTimes = await this.fetchPrayerTimes(position.lat, position.lng);
            this.updatePrayerDisplay();
            this.calculateNextPrayer();
            this.scheduleNotifications();
        } catch (error) {
            console.error('خطأ في تحديث أوقات الصلاة:', error);
            this.prayerTimes = {
                fajr: '04:45',
                sunrise: '06:15',
                dhuhr: '12:30',
                asr: '15:45',
                maghrib: '17:30',
                isha: '19:00'
            };
            this.updatePrayerDisplay();
            this.calculateNextPrayer();
        }
    }

    updatePrayerDisplay() {
        const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const prayerCards = document.querySelectorAll('.prayer-time-card');
        
        prayerCards.forEach((card, index) => {
            if (prayers[index]) {
                const timeElement = card.querySelector('.prayer-time');
                if (timeElement) {
                    timeElement.textContent = this.prayerTimes[prayers[index]];
                }
            }
        });
    }

    calculateNextPrayer() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayers = [
            { name: 'الفجر', time: this.timeToMinutes(this.prayerTimes.fajr) },
            { name: 'الظهر', time: this.timeToMinutes(this.prayerTimes.dhuhr) },
            { name: 'العصر', time: this.timeToMinutes(this.prayerTimes.asr) },
            { name: 'المغرب', time: this.timeToMinutes(this.prayerTimes.maghrib) },
            { name: 'العشاء', time: this.timeToMinutes(this.prayerTimes.isha) }
        ];

        let nextPrayer = prayers.find(prayer => prayer.time > currentTime);
        if (!nextPrayer) {
            nextPrayer = prayers[0]; // الفجر في اليوم التالي
        }

        // تحديث عرض الصلاة القادمة في الدش بورد
        const nextPrayerElement = document.getElementById('next-prayer');
        if (nextPrayerElement) {
            nextPrayerElement.querySelector('.prayer-name').textContent = nextPrayer.name;
            nextPrayerElement.querySelector('.prayer-time').textContent = this.minutesToTime(nextPrayer.time);
            
            const remaining = nextPrayer.time - currentTime;
            const hours = Math.floor(remaining / 60);
            const minutes = remaining % 60;
            nextPrayerElement.querySelector('.time-remaining').textContent = 
                `باقي ${hours} ساعة و ${minutes} دقيقة`;
        }
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // Qibla Direction
    detectLocation() {
        if (!navigator.geolocation) {
            alert('المتصفح لا يدعم تحديد الموقع');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.calculateQibla(position.coords.latitude, position.coords.longitude);
                this.updatePrayerTimes();
            },
            (error) => {
                console.error('خطأ في تحديد الموقع:', error);
                alert('تعذر تحديد الموقع. يرجى السماح بالوصول للموقع.');
            }
        );
    }

    calculateQibla(lat, lng) {
        // إحداثيات الكعبة المشرفة
        const kabaLat = 21.4225;
        const kabaLng = 39.8262;
        
        const dLng = (kabaLng - lng) * Math.PI / 180;
        const lat1 = lat * Math.PI / 180;
        const lat2 = kabaLat * Math.PI / 180;
        
        const y = Math.sin(dLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
        
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360;
        
        this.qiblaDirection = Math.round(bearing);
        this.updateQiblaDisplay();
    }

    updateQiblaDisplay() {
        const compassArrow = document.querySelector('.compass-arrow');
        if (compassArrow) {
            compassArrow.style.transform = `translate(-50%, -50%) rotate(${this.qiblaDirection}deg)`;
        }
        
        const directionText = this.getDirectionText(this.qiblaDirection);
        const qiblaInfo = document.querySelector('.qibla-info p');
        if (qiblaInfo) {
            qiblaInfo.innerHTML = `الاتجاه: <strong>${directionText} (${this.qiblaDirection}°)</strong>`;
        }
    }

    getDirectionText(degree) {
        const directions = [
            'شمال', 'شمال شرق', 'شرق', 'جنوب شرق',
            'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'
        ];
        const index = Math.round(degree / 45) % 8;
        return directions[index];
    }

    updateQibla() {
        this.updateQiblaDisplay();
    }

    // Adhkar functionality
    loadAdhkarData() {
        this.adhkarData = {
            morning: [
                {
                    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
                    translation: 'أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له',
                    repeat: 'مرة واحدة'
                },
                {
                    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
                    translation: 'أعوذ بالله من الشيطان الرجيم',
                    repeat: 'ثلاث مرات'
                }
            ],
            evening: [
                {
                    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
                    translation: 'أمسينا وأمسى الملك لله، والحمد لله',
                    repeat: 'مرة واحدة'
                }
            ],
            sleep: [
                {
                    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
                    translation: 'باسمك اللهم أموت وأحيا',
                    repeat: 'مرة واحدة'
                }
            ],
            prayer: [
                {
                    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
                    translation: 'سبحان ربي العظيم',
                    repeat: 'ثلاث مرات'
                }
            ]
        };
    }

    loadAdhkarList() {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        this.filterAdhkar(activeFilter);
    }

    filterAdhkar(category) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${category}"]`).classList.add('active');

        // Load adhkar for the category
        const adhkarList = document.getElementById('adhkar-list');
        adhkarList.innerHTML = '';

        const adhkar = this.adhkarData[category] || [];
        adhkar.forEach(dhikr => {
            const dhikrCard = this.createDhikrCard(dhikr);
            adhkarList.appendChild(dhikrCard);
        });
    }

    createDhikrCard(dhikr) {
        const card = document.createElement('div');
        card.className = 'dhikr-card';
        card.innerHTML = `
            <div class="dhikr-arabic">${dhikr.arabic}</div>
            <div class="dhikr-translation">${dhikr.translation}</div>
            <div class="dhikr-repeat">
                <span>العدد: ${dhikr.repeat}</span>
                <button class="btn-audio" onclick="app.speakText('${dhikr.arabic}')">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        return card;
    }

    // Tasbih Counter
    incrementCounter() {
        this.currentCount++;
        document.getElementById('count-number').textContent = this.currentCount;
        
        // تأثيرات بصرية
        const countElement = document.getElementById('count-number');
        countElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            countElement.style.transform = 'scale(1)';
        }, 150);

        // حفظ العدد محلياً
        localStorage.setItem('tasbihCount', this.currentCount);
        
        // تنبيه عند الوصول لأرقام معينة
        if (this.currentCount % 33 === 0) {
            this.showCountAlert(this.currentCount);
        }
    }

    resetCounter() {
        this.currentCount = 0;
        document.getElementById('count-number').textContent = this.currentCount;
        localStorage.setItem('tasbihCount', this.currentCount);
        this.showNotification('تم إعادة تعيين المسبحة', 'info');
    }

    setTasbihText(dhikr) {
        // تحديث النص المعروض (يمكن إضافة عنصر لعرض النص الحالي)
        document.querySelectorAll('.tasbih-preset').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        this.showNotification(`تم اختيار: ${dhikr}`, 'success');
    }

    showCountAlert(count) {
        const message = `مبارك! لقد أتممت ${count} تسبيحة`;
        // يمكن استبدال alert بتنبيه أكثر أناقة
        this.showNotification(message, 'success');
        this.vibrateDevice();
    }

    // Memorization functionality
    loadMemorizationProgress() {
        // تحميل بيانات الحفظ من التخزين المحلي
        const savedProgress = JSON.parse(localStorage.getItem('memorizationProgress') || '{}');
        this.memorizedVerses = savedProgress.verses || [];
        
        this.updateMemorizationStats();
        this.loadCurrentVerse();
    }

    updateMemorizationStats() {
        const stats = {
            parts: Math.floor(this.memorizedVerses.length / 20), // تقريباً 20 آية لكل جزء
            verses: this.memorizedVerses.length,
            streak: this.calculateStreak()
        };

        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers[0]) statNumbers[0].textContent = stats.parts;
        if (statNumbers[1]) statNumbers[1].textContent = stats.verses;
        if (statNumbers[2]) statNumbers[2].textContent = stats.streak;
    }

    calculateStreak() {
        // حساب عدد الأيام المتتالية للمراجعة
        const sessions = JSON.parse(localStorage.getItem('memorizationSessions') || '[]');
        if (sessions.length === 0) return 0;

        let streak = 1;
        const today = new Date().toDateString();
        
        for (let i = sessions.length - 1; i > 0; i--) {
            const currentDate = new Date(sessions[i]).toDateString();
            const prevDate = new Date(sessions[i-1]).toDateString();
            
            const dayDiff = (new Date(currentDate) - new Date(prevDate)) / (1000 * 60 * 60 * 24);
            
            if (dayDiff === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    loadCurrentVerse() {
        // تحميل الآية الحالية للمراجعة
        const verseData = {
            arabic: 'وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنصِتُوا لَعَلَّكُمْ تُرْحَمُونَ',
            info: 'الأعراف - آية 204'
        };

        const memorizeText = document.getElementById('memorization-text');
        if (memorizeText) {
            memorizeText.innerHTML = `
                <div class="verse-to-memorize">
                    <div class="verse-arabic">${verseData.arabic}</div>
                    <div class="verse-info">${verseData.info}</div>
                </div>
            `;
        }
    }

    toggleRecording() {
        const recordBtn = document.getElementById('record-btn');
        const icon = recordBtn.querySelector('i');
        
        if (this.isRecording) {
            this.stopRecording();
            icon.className = 'fas fa-microphone';
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i> ابدأ التسجيل';
        } else {
            this.startRecording();
            icon.className = 'fas fa-stop';
            recordBtn.innerHTML = '<i class="fas fa-stop"></i> إيقاف التسجيل';
        }
    }

    startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('المتصفح لا يدعم تسجيل الصوت');
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];
                
                this.mediaRecorder.ondataavailable = event => {
                    this.audioChunks.push(event.data);
                };
                
                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    this.processRecording(audioBlob);
                };
                
                this.mediaRecorder.start();
                this.isRecording = true;
            })
            .catch(error => {
                console.error('خطأ في بدء التسجيل:', error);
                alert('تعذر بدء التسجيل. يرجى السماح بالوصول للميكروفون.');
            });
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // إيقاف جميع المسارات الصوتية
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }

    processRecording(audioBlob) {
        // في التطبيق الحقيقي سيتم إرسال الصوت لخدمة التجويد
        this.showLoading();
        
        setTimeout(() => {
            this.showTajweedFeedback();
            this.hideLoading();
        }, 2000);
    }

    showTajweedFeedback() {
        const feedbackElement = document.getElementById('tajweed-feedback');
        if (feedbackElement) {
            feedbackElement.style.display = 'block';
            feedbackElement.classList.add('fade-in');
        }
        
        // محاكاة نتائج التقييم
        const scores = {
            pronunciation: Math.floor(Math.random() * 20) + 80,
            madd: Math.floor(Math.random() * 20) + 75,
            ghunna: Math.floor(Math.random() * 20) + 70
        };
        
        this.updateFeedbackScores(scores);
    }

    updateFeedbackScores(scores) {
        const overallScore = Math.round((scores.pronunciation + scores.madd + scores.ghunna) / 3);
        
        const scoreElement = document.querySelector('.score');
        if (scoreElement) {
            scoreElement.textContent = `${overallScore}%`;
        }
        
        const scoreItems = document.querySelectorAll('.score-item');
        if (scoreItems[0]) scoreItems[0].querySelector('.score-value').textContent = this.getScoreText(scores.pronunciation);
        if (scoreItems[1]) scoreItems[1].querySelector('.score-value').textContent = this.getScoreText(scores.madd);
        if (scoreItems[2]) scoreItems[2].querySelector('.score-value').textContent = this.getScoreText(scores.ghunna);
    }

    getScoreText(score) {
        if (score >= 90) return 'ممتاز';
        if (score >= 80) return 'جيد جداً';
        if (score >= 70) return 'جيد';
        return 'يحتاج تحسين';
    }

    playVerseAudio() {
        // تشغيل صوت الآية للمقارنة
        const verseText = document.querySelector('.verse-arabic').textContent;
        this.speakText(verseText);
    }

    // Dashboard
    updateDashboard() {
        this.calculateNextPrayer();
        this.updateMemorizationProgress();
    }

    updateMemorizationProgress() {
        // Update progress in dashboard
        const progressFill = document.querySelector('.dashboard-card .progress-fill');
        if (progressFill) {
            const percentage = Math.min((this.memorizedVerses.length / 600) * 100, 100);
            progressFill.style.width = percentage + '%';
        }
    }

    // Utility functions
    speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    toArabicNumbers(num) {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return num.toString().split('').map(digit => arabicNumbers[parseInt(digit)]).join('');
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    // Service Worker for PWA
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
}

// Initialize the app
const app = new RafeeqApp();

// PWA Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // يمكن إضافة زر تثبيت التطبيق هنا
    console.log('PWA install prompt available');
});

// Update prayer times every minute
setInterval(() => {
    app.calculateNextPrayer();
}, 60000);

// Save tasbih count on page unload
window.addEventListener('beforeunload', () => {
    localStorage.setItem('tasbihCount', app.currentCount);
});

// Load saved tasbih count on page load
window.addEventListener('load', () => {
    const savedCount = localStorage.getItem('tasbihCount');
    if (savedCount) {
        app.currentCount = parseInt(savedCount);
        const countElement = document.getElementById('count-number');
        if (countElement) {
            countElement.textContent = app.currentCount;
        }
    }
});

// Enhanced PWA functionality
window.addEventListener('online', () => {
    app.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
});

window.addEventListener('offline', () => {
    app.showNotification('أنت تعمل في وضع عدم الاتصال', 'warning');
});
