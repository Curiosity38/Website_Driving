import {
  BookOpenCheck,
  CalendarCheck,
  CarFront,
  CheckCircle2,
  Clock3,
  Route,
  ShieldCheck,
  TriangleAlert
} from "lucide-react";

const quickChecks = [
  "座椅距离合适，右脚能自然完成刹车和油门切换。",
  "左右后视镜和车内后视镜调整到能观察车身侧后方。",
  "全员系好安全带，确认车门、灯光、雨刷、除雾、导航状态。",
  "观察轮胎、胎压提示、油量或电量，雨雪天提前清理玻璃和传感器。"
];

const handbookSections = [
  {
    icon: <Route size={22} />,
    title: "城市道路",
    points: [
      "起步前先观察左右后方和行人、非机动车，再平稳进入车流。",
      "跟车时不要只盯前车尾灯，要同时看前车前方的车流变化。",
      "路口提前减速，观察信号灯、行人、非机动车和右转盲区。",
      "掉头前确认标志标线和对向车速，留足转弯半径。"
    ]
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "安全习惯",
    points: [
      "变道先看后视镜，提前打灯，再看盲区，确认车速差后小角度并线。",
      "普通路况至少保持约3秒跟车距离，雨雪、夜间和跟随大车时继续加大距离。",
      "遇到不确定情况先稳住车速，不急刹、不抢行、不连续变道。",
      "开车过程中不手持电话，不看视频，不疲劳驾驶。"
    ]
  },
  {
    icon: <CarFront size={22} />,
    title: "停车练习",
    points: [
      "倒车时低速控制，后视镜、倒车影像和车身位置感一起使用。",
      "地下车库先观察坡道、弯道、行人和柱子，不贴边抢行。",
      "侧方停车重点看车身与路边距离，方向盘回正后再微调。",
      "小区窄路会车先减速，必要时停车让行，不用速度解决空间问题。"
    ]
  },
  {
    icon: <Clock3 size={22} />,
    title: "特殊场景",
    points: [
      "夜间先确保灯光正确，控制车速，避免被远光灯影响时急打方向。",
      "雨雪路面减少急加速、急刹和急转向，保持更长距离。",
      "早晚高峰提前规划车道，错过路口先继续前行，不临时压线变道。",
      "快速路和高速入口重点判断车速差，进入主路前完成充分观察。"
    ]
  },
  {
    icon: <TriangleAlert size={22} />,
    title: "应急处理",
    points: [
      "车辆故障或轻微事故后，优先确保人员安全，再处理车辆和沟通。",
      "临时停车或车辆异常时开启危险报警闪光灯。",
      "需要在道路上停车处理时，按要求设置警示标志，人员撤到安全区域。",
      "遇到复杂纠纷时保留现场信息，按实际情况报警或联系保险。"
    ]
  }
];

export default function HandbookPage() {
  return (
    <main className="handbook-page">
      <section className="handbook-shell">
        <div className="handbook-hero">
          <div>
            <span className="eyebrow dark">首次预约赠送电子版</span>
            <h1>新手安全驾驶技巧手册</h1>
            <p>
              这份手册用于课后复习和日常提醒。内容围绕沈阳城市道路、停车、雨雪夜间、
              快速路入口和临时应急等常见场景整理，配合一对一陪练使用。
            </p>
          </div>
          <a className="button secondary compact-button" href="/">
            返回预约页
          </a>
        </div>

        <section className="handbook-panel">
          <div className="handbook-panel-heading">
            <BookOpenCheck size={24} />
            <h2>上车前3分钟检查</h2>
          </div>
          <ul className="handbook-checklist">
            {quickChecks.map((item) => (
              <li key={item}>
                <CheckCircle2 size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="handbook-detail-grid">
          {handbookSections.map((section) => (
            <article className="handbook-detail-card" key={section.title}>
              <span className="handbook-detail-icon">{section.icon}</span>
              <h2>{section.title}</h2>
              <ul>
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="handbook-panel">
          <div className="handbook-panel-heading">
            <CalendarCheck size={24} />
            <h2>建议练习顺序</h2>
          </div>
          <ol className="handbook-steps">
            <li>先在低车流路段熟悉车辆、刹车脚感、转向幅度和观察顺序。</li>
            <li>再练小区出入、右转、掉头、变道、路口让行和常用通勤路线。</li>
            <li>最后练停车、早晚高峰、快速路入口、夜间或雨雪等专项场景。</li>
          </ol>
          <p className="handbook-note">
            手册不替代实车训练，也不承诺固定课时后达到某一结果。每次训练会根据驾驶基础、
            路况和天气调整路线，以安全和合规为先。
          </p>
        </section>
      </section>
    </main>
  );
}
