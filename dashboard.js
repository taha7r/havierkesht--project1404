(function() {
    'use strict';

    const API_BASE_URL = 'https://edu-api.havirkesht.ir';
    const CROP_YEAR_ID = 13;

    const formatMoney = (num) => new Intl.NumberFormat('fa-IR').format(num || 0);
    const toFarsi = (n) => (n === undefined || n === null) ? '۰' : n.toString().replace(/\d/g, x => ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'][x]);

    async function init() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.replace('index.html');
            return;
        }
        
        getReportData(token);
    }

    async function getReportData(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/report-full/?crop_year_id=${CROP_YEAR_ID}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.status === 401) {
                alert("نشست شما به پایان رسیده است. لطفاً دوباره وارد شوید 🔑");
                localStorage.clear();
                window.location.replace('index.html');
                return;
            }

            if (!response.ok) throw new Error("خطا در پاسخ سرور");

            const data = await response.json();

            // پر کردن کارت‌ها (نام تابع به updateUI تغییر یافت تا با تعریف پایین هماهنگ شود)
            updateUI('contractorBalance', data.current_contractor_remaining_balance);
            updateUI('approvedInvoices', data.contractor_fee);
            updateUI('finalInvoices', data.total_farmers_debt);
            updateUI('farmerPayments', data.total_farmers_receivable);
            updateUI('contractorPayments', data.farmers_remaining_settlement);
            updateUI('dueCheques', data.total_delivered_tonnage, false); // نمایش به عنوان عدد غیر واحد پول (تن)
            updateUI('clearedCheques', data.overall_contractor_status);
            updateUI('seedProfit', data.contractor_seed_profit);
            updateUI('pesticideProfit', data.contractor_pesticide_profit);
            
            const farmCount = document.getElementById('totalFarmers');
            if(farmCount) {
                farmCount.innerHTML = `${toFarsi(data.farmers_commitment_count)} <small>نفر</small>`;
            }

        } catch (err) {
            alert("⚠️ خطا در دریافت اطلاعات داشبورد! لطفا اتصال اینترنت خود را چک کنید.");
            console.error("❌ خطای گزارش:", err);
        }
    }

    // تابعی برای به‌روزرسانی اعداد در داشبورد
    function updateUI(id, value, isCurrency = true) {
        const element = document.getElementById(id);
        if (!element) return;

        // ۱. بررسی منفی بودن عدد برای تغییر رنگ
        if (value < 0) {
            element.classList.add('text-danger');
        } else {
            element.classList.remove('text-danger');
        }

        // ۲. فرمت‌بندی عدد (جداکننده هزارگان و تبدیل به فارسی)
        let formattedValue = toFarsi((value || 0).toLocaleString('en-US'));
        
        // ۳. مدیریت نمایش علامت منفی
        if (value < 0) {
            // اگر عدد منفی بود، علامت منفی انگلیسی را با کاراکتر مناسب جایگزین می‌کنیم
            formattedValue = formattedValue.replace('-', '') + '-';
        }

        // ۴. نمایش نهایی
        const unit = isCurrency ? ' <small>تومان</small>' : ''; 
        element.innerHTML = formattedValue + unit;
    }

    // دکمه خروج با تاییدیه
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm("آیا می‌خواهید از سامانه خارج شوید؟")) {
                localStorage.clear();
                window.location.replace('index.html');
            }
        };
    }

    window.onload = init;
})();