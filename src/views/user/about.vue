<template>
    <div class="about-panel">
        <div class="close-btn" @click="router.back()">
            <img :src="closeIcon" alt="关闭" class="close-icon">
        </div>

        <div class="about-header">
            <img src="../../assets/img/logo.svg" class="logo-icon">
            <h2>关于右转</h2>
            <div class="version">版本 1.0.0</div>
        </div>

        <div class="about-content">
            <div class="section">
                <h3>产品介绍</h3>
                <p>右转是一款基于大语言模型的智能对话助手，致力于为用户提供高效、准确的信息检索和问题解答服务。无论是日常对话、知识问答还是创意写作，右转都能为您提供专业的智能助手服务。</p>
            </div>

            <div class="section">
                <h3>核心功能</h3>
                <div class="feature-list">
                    <div class="feature-item">
                        <img :src="onlineIcon" class="feature-icon">
                        <div class="feature-text">
                            <div class="feature-title">联网搜索</div>
                            <div class="feature-desc">实时获取互联网最新信息</div>
                        </div>
                    </div>
                    <div class="feature-item">
                        <img :src="chatIcon" class="feature-icon">
                        <div class="feature-text">
                            <div class="feature-title">智能对话</div>
                            <div class="feature-desc">自然流畅的交流体验</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>技术支持</h3>
                <p>基于先进的大语言模型技术，右转不断优化自身能力，为用户提供更加智能、高效的服务体验。</p>
            </div>

            <div class="copyright">
                © 2022-2026 右转
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import closeIcon from '../../assets/img/关闭.svg'
import onlineIcon from '../../assets/img/online.svg'
import chatIcon from '../../assets/img/对话.svg'

const router = useRouter()
</script>

<style lang="less" scoped>
@import '../../assets/styles.less';
@import '../../assets/property.less';

.about-panel {
    position: relative;
    background-color: var(--bg-color);
    border-radius: 16px;
    box-shadow: 0 0 10px 0 var(--shadow-color);
    width: 380px;
    padding: 30px;
    margin: auto;

    .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
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

    .about-header {
        text-align: center;
        margin-bottom: 10px;

        .logo-icon {
            width: 60px;
            height: 60px;
            margin-bottom: 10px;
        }

        h2 {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-color);
            margin: 10px 0 5px;
        }

        .version {
            font-size: 14px;
            color: var(--text-secondary);
        }
    }

    .about-content {
        .section {
            margin-bottom: 25px;

            h3 {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-color);
                margin-bottom: 10px;
                position: relative;
                padding-left: 12px;

                &:before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 18px;
                    background-color: var(--ai-msg-border);
                    border-radius: 2px;
                }
            }

            p {
                font-size: 14px;
                line-height: 1.6;
                color: var(--text-color);
                margin: 0;
            }

            &.links {
                display: flex;
                justify-content: space-around;
                margin-top: 30px;

                .link-item {
                    color: var(--ai-msg-border);
                    text-decoration: none;
                    font-size: 14px;
                    transition: all 0.3s ease;

                    &:hover {
                        opacity: 0.8;
                        text-decoration: underline;
                    }
                }
            }
        }

        .feature-list {
            display: flex;
            flex-direction: column;
            gap: 15px;

            .feature-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 10px;
                border-radius: 8px;
                transition: all 0.3s ease;

                &:hover {
                    background-color: var(--hover-bg);
                }

                .feature-icon {
                    width: 30px;
                    height: 30px;
                    padding: 6px;
                    border-radius: 12px;
                    background-color: var(--hover-bg);
                }

                .feature-text {
                    .feature-title {
                        font-size: 16px;
                        font-weight: 500;
                        color: var(--text-color);
                    }

                    .feature-desc {
                        font-size: 12px;
                        color: var(--text-secondary);
                        margin-top: 2px;
                    }
                }
            }
        }

        .copyright {
            text-align: center;
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 30px;
        }
    }
}
</style>
