import {
  Award,
  BookOpenCheck,
  CalendarCheck,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  GraduationCap,
  MapPinned,
  MessageCircle,
  Phone,
  Route,
  ShieldCheck,
  CircleGauge,
  Sparkles,
} from "lucide-react";
import BookingForm from "./components/BookingForm";
import { formatCny, lessonPackages } from "@/lib/pricing";

const coachPhone = process.env.NEXT_PUBLIC_COACH_PHONE || "";
const coachWechat = process.env.NEXT_PUBLIC_COACH_WECHAT || "";
const coachWechatQr = process.env.NEXT_PUBLIC_COACH_WECHAT_QR || "";

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-media" aria-hidden="true">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=82"
          />
          <div className="hero-scrim" />
        </div>
        <header className="topbar">
          <a className="brand" href="#top">
            <CircleGauge size={22} />
            沈阳计时陪练
          </a>
          <nav aria-label="页面导航">
            <a href="#pricing">价格</a>
            <a href="#handbook">手册</a>
            <a href="#booking">预约</a>
            <a href="#contact">联系</a>
          </nav>
        </header>

        <div className="hero-content">
          <div className="hero-copy">
            <span className="eyebrow">沈阳市内一对一实路陪练</span>
            <h1>沈阳安全驾驶计时陪练</h1>
            <p>
              可选择自己带车，也可使用教练沃尔沃S90 T8。适合新手驾驶人、
              拿证后很少开车的人、长时间未独立开车的人、刚买车或准备买车的人。
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#booking">
                <CalendarCheck size={19} />
                立即预约
              </a>
              <a className="button secondary" href="#pricing">
                <CreditCard size={19} />
                查看价格
              </a>
              <a className="button secondary" href="#handbook">
                <BookOpenCheck size={19} />
                查看手册
              </a>
            </div>
          </div>

          <div className="hero-facts" aria-label="教练优势">
            <div>
              <strong>30年</strong>
              <span>驾龄沉淀</span>
            </div>
            <div>
              <strong>100万+</strong>
              <span>安全行驶公里</span>
            </div>
            <div>
              <strong>硕士</strong>
              <span>讲师证背景</span>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-band">
        <div className="content-grid compact">
          <FeaturePill icon={<ShieldCheck size={20} />} text="上车前确认驾驶证" />
          <FeaturePill icon={<Route size={20} />} text="按通勤路线定制训练" />
          <FeaturePill icon={<BookOpenCheck size={20} />} text="首次送安全驾驶手册" />
          <FeaturePill icon={<CarFront size={20} />} text="可选沃尔沃S90 T8" />
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="section-heading">
          <span className="eyebrow dark">定价建议已匹配沈阳市场</span>
          <h2>价格透明，2小时起订</h2>
          <p>
            沈阳普通陪练常见区间约为每小时几十元到百元以上。本服务按高资历教练和高端车型定位，
            不做低价噱头，重点交付安全、耐心和可复盘的实路训练。
          </p>
        </div>
        <div className="pricing-grid">
          {lessonPackages.map((item) => (
            <article className="price-card" key={item.id}>
              <span className="package-badge">{item.badge}</span>
              <h3 className="price-card-title">
                {item.title}
                {item.id.endsWith("_trial") ? (
                  <span className="trial-price-note">仅首次价格</span>
                ) : null}
              </h3>
              <div className="price-line">
                <strong>{formatCny(item.price)}</strong>
                <span>{item.unit}</span>
              </div>
              <p>{item.description}</p>
              <ul>
                {item.features.map((feature) => (
                  <li key={feature}>
                    <CheckCircle2 size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="pricing-note">
          <Clock3 size={18} />
          夜路、早晚高峰、冰雪路面加 ¥30/小时；高速或长途按 ¥238/小时或单独报价。
          自带车油费、停车费、过路费由学员承担。
        </div>
      </section>

      <section className="section muted" id="booking">
        <div className="booking-layout">
          <div className="booking-copy">
            <span className="eyebrow dark">预约后人工确认</span>
            <h2>先提交意向，再确认档期付款</h2>
            <p>
              单教练服务不做自动抢档。你提交预约后，教练会确认路线、天气、训练目标和时间可行性，
              首次预约赠送安全驾驶技巧手册，确认档期后再发送微信支付链接或二维码。
            </p>
            <div className="steps">
              <Step icon={<CalendarCheck size={20} />} title="提交预约" text="选择车型、套餐、日期、地点和练习目标。" />
              <Step icon={<Phone size={20} />} title="教练确认" text="电话或微信核对基础、路线和注意事项。" />
              <Step icon={<CreditCard size={20} />} title="微信支付" text="档期确认后生成 H5 支付链接或扫码付款。" />
              <Step icon={<CircleGauge size={20} />} title="按时训练" text="上车前出示驾驶证，课后做问题复盘。" />
            </div>
          </div>
          <BookingForm />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="eyebrow dark">训练内容</span>
          <h2>不是绕圈，是解决真实上路问题</h2>
        </div>
        <div className="training-grid">
          <TrainingItem icon={<MapPinned size={22} />} title="通勤路线" text="小区出入、单位路线、学校医院商场周边，按真实用车场景练。" />
          <TrainingItem icon={<Route size={22} />} title="城市道路" text="起步、跟车、变道、路口观察、让行、掉头，按步骤建立稳定习惯。" />
          <TrainingItem icon={<CarFront size={22} />} title="停车入库" text="地下车库、侧方、倒库、窄路会车、刷卡机和坡道细节。" />
          <TrainingItem icon={<ShieldCheck size={22} />} title="安全习惯" text="保持车距、提前打灯、观察盲区、平稳制动，不急刹、不抢行。" />
        </div>
      </section>

      <section className="section muted" id="handbook">
        <div className="section-heading">
          <span className="eyebrow dark">首次预约赠送</span>
          <h2>新手安全驾驶技巧手册</h2>
          <p>
            手册用于课后复习和日常提醒，内容围绕真实上路常见场景整理。
            练车时会结合学员基础，把要点落实到观察、判断和操作动作上。
          </p>
        </div>
        <div className="handbook-grid">
          <HandbookItem title="上车前检查" text="座椅、后视镜、安全带、灯光、雨刷、轮胎、导航，先把基础状态调整好。" />
          <HandbookItem title="城市道路" text="起步、跟车、变道、路口观察、让行、掉头，按固定观察顺序练。" />
          <HandbookItem title="停车练习" text="倒车入库、侧方停车、商场地库、小区窄路，训练车身位置感。" />
          <HandbookItem title="特殊场景" text="夜间、雨雪、早晚高峰、快速路、高速入口，先稳车速再处理路线。" />
          <HandbookItem title="安全习惯" text="保持车距、提前打灯、观察盲区、不急刹、不抢行，减少临时反应。" />
          <HandbookItem title="应急处理" text="车辆故障、轻微剐蹭、临时停车，正确使用危险报警灯和警示标志。" />
        </div>
        <a className="button primary handbook-link" href="/handbook">
          <BookOpenCheck size={19} />
          打开完整手册
        </a>
      </section>

      <section className="section credentials">
        <div className="credential-copy">
          <span className="eyebrow dark">教练优势</span>
          <h2>把经验讲清楚，也把动作带稳定</h2>
          <p>
            30年驾龄和超过100万公里道路经验，用讲师式表达拆解驾驶动作。
            对新手驾驶人，重点是建立稳定习惯；对有基础学员，重点是修正观察和决策方式。
          </p>
        </div>
        <div className="credential-grid">
          <Credential icon={<Award size={22} />} title="长驾龄" text="长期真实道路经验，能快速判断学员问题来源。" />
          <Credential icon={<GraduationCap size={22} />} title="硕士背景" text="表达清晰，能把复杂路况拆成可执行动作。" />
          <Credential icon={<Sparkles size={22} />} title="讲师证" text="更适合一对一耐心教学、复盘和动作纠偏。" />
          <Credential icon={<ShieldCheck size={22} />} title="安全优先" text="不追求刺激路线，先建立稳定、合规、可持续的驾驶习惯。" />
        </div>
      </section>

      <section className="section muted" id="contact">
        <div className="contact-layout">
          <div>
            <span className="eyebrow dark">联系教练</span>
            <h2>先说明基础，再安排合适路线</h2>
            <p>
              预约时建议写清楚是否刚取得驾驶证、平时开车频率、是否有自己的车、最想解决的问题。
              真实车辆照片、微信二维码和联系方式可在部署前替换。
            </p>
          </div>
          <div className="contact-panel">
            <a className="contact-row" href={coachPhone ? `tel:${coachPhone}` : "#booking"}>
              <Phone size={21} />
              <span>
                <strong>电话咨询</strong>
                <small>{coachPhone || "电话待提供，暂先提交预约"}</small>
              </span>
            </a>
            <div className="contact-row">
              <MessageCircle size={21} />
              <span>
                <strong>微信联系</strong>
                <small>{coachWechat || "微信号待提供"}</small>
              </span>
            </div>
            {coachWechatQr ? (
              <img className="wechat-qr" alt="教练微信二维码" src={coachWechatQr} />
            ) : (
              <div className="qr-placeholder">微信二维码待上传</div>
            )}
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="section-heading">
          <span className="eyebrow dark">常见问题</span>
          <h2>预约前需要知道的事</h2>
        </div>
        <div className="faq-grid">
          <Faq question="没有驾驶证可以练吗？" answer="不可以。本服务仅面向已取得驾驶证的学员，上车前需要携带并出示驾驶证。" />
          <Faq question="为什么付款前要人工确认？" answer="需要先确认教练档期、天气、路线难度、车辆情况和训练目标，避免付款后无法安排。" />
          <Faq question="可以临时改时间吗？" answer="24小时前可免费改期；恶劣天气、车辆故障或交通管制等情况可协商改期或退款。" />
          <Faq question="用自己的车可以吗？" answer="可以。自带车更贴近日常用车，但没有副刹车，通常建议先评估基础，再安排合适路线。" />
        </div>
      </section>

      <footer className="footer">
        <span>沈阳计时陪练预约</span>
        <a href="/coach">教练管理</a>
      </footer>

      <div className="bottom-actions" aria-label="快捷操作">
        <a href={coachPhone ? `tel:${coachPhone}` : "#booking"}>
          <Phone size={18} />
          电话咨询
        </a>
        <a href="#contact">
          <MessageCircle size={18} />
          加微信
        </a>
        <a className="highlight" href="#booking">
          <CalendarCheck size={18} />
          立即预约
        </a>
      </div>
    </main>
  );
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="feature-pill">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function Step({
  icon,
  text,
  title
}: {
  icon: React.ReactNode;
  text: string;
  title: string;
}) {
  return (
    <div className="step-item">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function TrainingItem({
  icon,
  text,
  title
}: {
  icon: React.ReactNode;
  text: string;
  title: string;
}) {
  return (
    <article className="training-item">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function HandbookItem({ text, title }: { text: string; title: string }) {
  return (
    <article className="handbook-item">
      <BookOpenCheck size={22} />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Credential({
  icon,
  text,
  title
}: {
  icon: React.ReactNode;
  text: string;
  title: string;
}) {
  return (
    <article className="credential-item">
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Faq({ answer, question }: { answer: string; question: string }) {
  return (
    <details className="faq-item">
      <summary>{question}</summary>
      <p>{answer}</p>
    </details>
  );
}
