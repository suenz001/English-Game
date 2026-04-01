// ===== 帳號驗證 UI =====
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from './firebase-config.js';
import { onUserChange, syncLocalToCloud } from './cloud-save.js';

const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2500, background: '#2d1b4e', color: '#fff' });

export function initAuthUI() {
    const bar = document.getElementById('user-bar');
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');

    let isFirstCheck = true;
    // 監聽狀態
    onUserChange(user => {
        if (user) {
            loginBtn.classList.add('hidden');
            userInfo.classList.remove('hidden');
            userEmail.textContent = user.email;
        } else {
            loginBtn.classList.remove('hidden');
            userInfo.classList.add('hidden');
            // 本地清除由 cloud-save.js 統一處理
        }
        isFirstCheck = false;
    });

    // 登入按鈕
    loginBtn.addEventListener('click', showAuthModal);

    // 登出
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        Toast.fire({ icon: 'info', title: '已登出' });
    });
}

function showAuthModal() {
    Swal.fire({
        title: '🔐 登入 / 註冊',
        html: `
        <div style="text-align:left;font-size:14px">
            <div style="margin-bottom:12px">
                <label style="color:#a78bba;font-size:12px">📧 電子信箱</label>
                <input id="swal-email" type="email" class="swal2-input" placeholder="your@email.com" style="background:#1a0a2e;color:#fff;border:1px solid #9b59b6">
            </div>
            <div style="margin-bottom:12px">
                <label style="color:#a78bba;font-size:12px">🔑 密碼（至少6位）</label>
                <input id="swal-password" type="password" class="swal2-input" placeholder="••••••" style="background:#1a0a2e;color:#fff;border:1px solid #9b59b6">
            </div>
            <div style="text-align:center;margin-top:8px">
                <a id="swal-forgot" href="#" style="color:#4dabf7;font-size:12px">忘記密碼？</a>
            </div>
        </div>`,
        background: '#2d1b4e',
        color: '#fff',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '登入',
        denyButtonText: '註冊新帳號',
        cancelButtonText: '取消',
        confirmButtonColor: '#9b59b6',
        denyButtonColor: '#2ecc71',
        didOpen: () => {
            document.getElementById('swal-forgot').addEventListener('click', async (e) => {
                e.preventDefault();
                const email = document.getElementById('swal-email').value.trim();
                if (!email) { Toast.fire({ icon: 'warning', title: '請先輸入信箱' }); return; }
                try {
                    await sendPasswordResetEmail(auth, email);
                    Toast.fire({ icon: 'success', title: '重設密碼信已寄出！' });
                } catch { Toast.fire({ icon: 'error', title: '寄送失敗，請確認信箱' }); }
            });
        },
        preConfirm: () => {
            return {
                email: document.getElementById('swal-email').value.trim(),
                password: document.getElementById('swal-password').value,
                action: 'login'
            };
        },
        preDeny: () => {
            return {
                email: document.getElementById('swal-email').value.trim(),
                password: document.getElementById('swal-password').value,
                action: 'register'
            };
        }
    }).then(async (result) => {
        if (!result.value && !result.isDenied) return;
        const data = result.value || result.isDenied;
        if (!data || !data.email || !data.password) {
            Toast.fire({ icon: 'warning', title: '請填寫信箱和密碼' }); return;
        }

        try {
            if (data.action === 'register') {
                await createUserWithEmailAndPassword(auth, data.email, data.password);
                await syncLocalToCloud();
                Toast.fire({ icon: 'success', title: '🎉 註冊成功！資料已同步雲端' });
            } else {
                await signInWithEmailAndPassword(auth, data.email, data.password);
                Toast.fire({ icon: 'success', title: '✅ 登入成功！' });
            }
        } catch (err) {
            const msg = {
                'auth/email-already-in-use': '此信箱已被註冊',
                'auth/invalid-email': '信箱格式不正確',
                'auth/weak-password': '密碼至少需要6位',
                'auth/user-not-found': '找不到此帳號',
                'auth/wrong-password': '密碼錯誤',
                'auth/invalid-credential': '帳號或密碼錯誤',
            }[err.code] || err.message;
            Toast.fire({ icon: 'error', title: msg });
        }
    });
}
