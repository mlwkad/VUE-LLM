<template>
    <div class="login-panel">
        <div class="panel-header">
            <img src="../../assets/img/logo.svg" class="logo-icon">
            <h2>{{ isLogin ? '登录' : '注册' }}右转</h2>
        </div>

        <div class="close-btn" @click="router.back()">
            <img :src="closeIcon" alt="关闭" class="close-icon">
        </div>
        <!-- 切换登录/注册 -->
        <div class="toggle-container">
            <div class="toggle-buttons">
                <button :class="['toggle-btn', isLogin ? 'active' : '']" @click="isLogin = true">登录</button>
                <button :class="['toggle-btn', !isLogin ? 'active' : '']" @click="isLogin = false">注册</button>
            </div>
        </div>

        <!-- 登录表单 -->
        <div v-if="isLogin" class="form-container">
            <div class="form-group">
                <label>用户名</label>
                <input type="text" v-model="loginForm.username" placeholder="请输入用户名" />
            </div>
            <div class="form-group">
                <label>密码</label>
                <input type="password" v-model="loginForm.password" placeholder="请输入密码" />
            </div>
            <div class="form-options">
                <div class="remember-me">
                    <input type="checkbox" id="remember" v-model="loginForm.remember">
                    <label for="remember">记住我</label>
                </div>
                <div class="forgot-password">忘记密码?</div>
            </div>
            <button class="submit-btn" @click="handleLogin">登录</button>

            <div class="third-party-login">
                <p>其他登录方式</p>
                <div class="third-party-icons">
                    <img src="../../assets/img/share.svg" alt="微信" class="third-party-icon">
                    <img src="../../assets/img/share1.svg" alt="QQ" class="third-party-icon">
                </div>
            </div>
        </div>

        <!-- 注册表单 -->
        <div v-else class="form-container">
            <div class="form-group">
                <label>用户名</label>
                <input type="text" v-model="registerForm.username" placeholder="请输入用户名" />
            </div>
            <div class="form-group">
                <label>账号</label>
                <input type="text" v-model="registerForm.phone" placeholder="请输入手机号" />
            </div>
            <div class="form-group">
                <label>密码</label>
                <input type="password" v-model="registerForm.password" placeholder="请输入密码" />
            </div>
            <div class="form-group">
                <label>确认密码</label>
                <input type="password" v-model="registerForm.confirmPassword" placeholder="请再次输入密码" />
            </div>
            <div class="form-options">
                <div class="agreement">
                    <input type="checkbox" id="agree" v-model="registerForm.agreement">
                    <label for="agree">我已阅读并同意<span class="highlight">服务协议</span>和<span
                            class="highlight">隐私政策</span></label>
                </div>
            </div>
            <button class="submit-btn" @click="handleRegister">注册</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import closeIcon from '../../assets/img/关闭.svg'

const router = useRouter()
const isLogin = ref(true)

// 登录表单
const loginForm = ref({
    username: '',
    password: '',
    remember: false
})

// 注册表单
const registerForm = ref({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreement: false
})

// 登录处理
const handleLogin = () => {
    if (!loginForm.value.username || !loginForm.value.password) {
        alert('请填写完整信息')
        return
    }
    // 模拟登录成功
    alert('登录成功')
    router.push('/')
}

// 注册处理
const handleRegister = () => {
    if (!registerForm.value.username || !registerForm.value.phone ||
        !registerForm.value.password ||
        !registerForm.value.confirmPassword) {
        alert('请填写完整信息')
        return
    }

    if (registerForm.value.password !== registerForm.value.confirmPassword) {
        alert('两次输入的密码不一致')
        return
    }

    if (!registerForm.value.agreement) {
        alert('请阅读并同意服务协议和隐私政策')
        return
    }

    // 模拟注册成功
    alert('注册成功')
    isLogin.value = true
}
</script>

<style lang="less" scoped>
@import '../../assets/styles.less';
@import '../../assets/property.less';

.login-panel {
    background-color: var(--bg-color);
    border-radius: 16px;
    box-shadow: 0 0 10px 0 var(--shadow-color);
    width: 380px;
    padding: 30px;
    margin: auto;
    position: relative;

    .panel-header {
        text-align: center;
        margin-bottom: 24px;

        .logo-icon {
            width: 40px;
            height: 40px;
            margin-bottom: 10px;
        }

        h2 {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color);
            margin: 0;
        }
    }

    .close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;

        .close-icon {
            width: 20px;
            height: 20px;
            transition: all 0.3s ease;

            &:hover {
                transform: scale(1.1);
            }
        }
    }

    .toggle-container {
        margin-bottom: 20px;

        .toggle-buttons {
            display: flex;
            background-color: var(--hover-bg);
            border-radius: 8px;
            overflow: hidden;

            .toggle-btn {
                flex: 1;
                padding: 10px;
                border: none;
                background: none;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                color: var(--text-secondary);

                &.active {
                    background-color: var(--ai-msg-border);
                    color: white;
                    font-weight: 500;
                }
            }
        }
    }

    .form-container {
        .form-group {
            margin-bottom: 16px;

            label {
                display: block;
                font-size: 14px;
                color: var(--text-color);
                margin-bottom: 6px;
                font-weight: 500;
            }

            input {
                width: 100%;
                padding: 10px 12px;
                border-radius: 8px;
                border: 1px solid var(--border-color);
                background-color: var(--input-bg);
                color: var(--input-text);
                font-size: 14px;

                &:focus {
                    outline: none;
                    border-color: var(--ai-msg-border);
                }
            }

            &.verification {
                .verification-input {
                    display: flex;
                    gap: 10px;

                    input {
                        flex: 1;
                    }

                    .code-btn {
                        padding: 0 12px;
                        border: none;
                        border-radius: 8px;
                        background-color: var(--ai-msg-border);
                        color: white;
                        font-size: 14px;
                        cursor: pointer;
                        white-space: nowrap;

                        &:hover {
                            opacity: 0.9;
                        }
                    }
                }
            }
        }

        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            font-size: 14px;

            .remember-me,
            .agreement {
                display: flex;
                align-items: center;
                gap: 5px;
                color: var(--text-secondary);

                input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    accent-color: var(--ai-msg-border);
                }

                .highlight {
                    color: var(--ai-msg-border);
                    cursor: pointer;
                }
            }

            .forgot-password {
                color: var(--ai-msg-border);
                cursor: pointer;
            }
        }

        .submit-btn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            background-color: var(--ai-msg-border);
            color: white;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
                opacity: 0.9;
            }
        }

        .third-party-login {
            margin-top: 24px;
            text-align: center;

            p {
                color: var(--text-secondary);
                font-size: 14px;
                margin-bottom: 12px;
                position: relative;

                &:before,
                &:after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    width: 60px;
                    height: 1px;
                    background-color: var(--border-color);
                }

                &:before {
                    left: 40px;
                }

                &:after {
                    right: 40px;
                }
            }

            .third-party-icons {
                display: flex;
                justify-content: center;
                gap: 20px;

                .third-party-icon {
                    width: 30px;
                    height: 30px;
                    padding: 6px;
                    border-radius: 50%;
                    background-color: var(--hover-bg);
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:hover {
                        background-color: var(--border-color);
                    }
                }
            }
        }
    }
}
</style>
