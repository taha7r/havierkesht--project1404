document.getElementById('loginBtn').onclick = async () => {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();

    if (!u || !p) {
        alert("لطفاً نام کاربری و رمز عبور را وارد کنید ⚠️");
        return;
    }

    try {
        const btn = document.getElementById('loginBtn');
        btn.innerText = "در حال بررسی...";
        btn.disabled = true;

        const formData = new URLSearchParams();
        formData.append('username', u);
        formData.append('password', p);
        formData.append('grant_type', 'password'); // استاندارد OAuth2

        const res = await fetch('https://edu-api.havirkesht.ir/token', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: formData.toString()
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('access_token', data.access_token);
            window.location.replace('dashboard.html');
        } else {
            const errorResult = await res.json();
            // اگر سرور پیام خاصی فرستاده باشد، همان را نمایش می‌دهیم
            alert(errorResult.detail || "نام کاربری یا رمز عبور اشتباه است ❌");
            btn.innerText = "ورود به سیستم";
            btn.disabled = false;
        }
    } catch (e) {
        alert("خطا در اتصال به سرور! 🌐");
        const btn = document.getElementById('loginBtn');
        btn.innerText = "ورود به سیستم";
        btn.disabled = false;
    }
};