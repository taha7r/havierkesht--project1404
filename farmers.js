(function() {
    'use strict';

    const API_BASE_URL = 'https://edu-api.havirkesht.ir';
    
    // تابع تبدیل اعداد به فارسی
    const toFarsi = (n) => (n === undefined || n === null) ? '---' : n.toString().replace(/\d/g, x => ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'][x]);

    async function init() {
        const token = localStorage.getItem('access_token');
        
        // اگر توکن نبود به صفحه لاگین برو
        if (!token) { 
            window.location.replace('index.html'); 
            return; 
        }

        try {
            const response = await fetch(`${API_BASE_URL}/farmer/?page=1&size=50`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'accept': 'application/json' 
                }
            });

            // مدیریت خطای انقضای توکن
            if (response.status === 401) {
                alert("نشست شما به پایان رسیده است. لطفاً دوباره وارد شوید 🔑");
                localStorage.clear();
                window.location.replace('index.html');
                return;
            }

            if (!response.ok) throw new Error("خطا در دریافت لیست");

            const data = await response.json();
            const items = data.items || [];
            
            renderTable(items);

        } catch (e) {
            // نمایش خطا با Alert
            alert("⚠️ خطا در بارگذاری لیست کشاورزان! لطفا اینترنت خود را چک کنید.");
            console.error("Error loading farmers:", e);
            
            const tbody = document.getElementById('farmersTableBody');
            if(tbody) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">خطا در بارگذاری داده‌ها</td></tr>';
            }
        }
    }

    function renderTable(list) {
        const tbody = document.getElementById('farmersTableBody');
        if (!tbody) return;

        if (!list || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">هیچ داده‌ای یافت نشد.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(f => `
            <tr>
                <td style="font-weight: bold; color: #2c3e50;">${f.full_name || '---'}</td>
                <td>${toFarsi(f.national_id)}</td>
                <td>${toFarsi(f.phone_number)}</td>
                <td>${f.father_name || '---'}</td>
                <td><span class="status-badge" style="background:#d1ecf1; color:#0c5460; padding:4px 8px; border-radius:5px; font-size:12px;">${toFarsi(f.created_at)}</span></td>
            </tr>
        `).join('');
    }

    // دکمه خروج با تاییدیه
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            if (confirm("آیا مطمئن هستید که می‌خواهید از سامانه خارج شوید؟")) {
                localStorage.clear();
                window.location.replace('index.html');
            }
        };
    }

    window.onload = init;
})();