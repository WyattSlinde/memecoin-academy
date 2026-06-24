/* ============================================================
   Memecoin Academy — interactivity
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Glossary data (single source of truth) ---------- */
  const GLOSSARY = {
    "memecoin": "A crypto token with no inherent product or utility — its value comes purely from attention, community, and speculation.",
    "market-cap": "Market Cap = token price × circulating supply. The headline 'size' of a coin. Small caps have more room to run but are far riskier.",
    "solana": "A fast, low-cost blockchain (~400ms blocks, sub-cent fees) where most memecoin trading happens.",
    "sol": "The native token of Solana, used to pay fees and to buy/sell memecoins.",
    "seed-phrase": "12–24 words that are the master key to your wallet. Anyone who has them controls your funds. Store offline; never share or type into a website.",
    "dex": "Decentralized Exchange — lets you swap tokens peer-to-contract with no middleman (e.g., Raydium, PumpSwap).",
    "liquidity": "The pool of funds available to trade against. High liquidity = stable price and easy exits; low liquidity = brutal slippage and possible inability to sell.",
    "amm": "Automated Market Maker — the formula a DEX uses to price swaps based on the ratio of tokens in a pool, instead of an order book.",
    "pumpfun": "The dominant Solana launchpad where anyone can create a memecoin in seconds. Coins start on a bonding curve.",
    "bonding-curve": "A hard-coded pricing formula: every buy pushes price up, every sell pushes it down. Used by pump.fun before a coin graduates.",
    "graduation": "When a coin's bonding curve reaches ~$69K market cap and ~$12K of liquidity migrates to a real DEX. Only ~1.2% of launches make it.",
    "slippage": "The max price change you'll tolerate between clicking and executing a trade. Too low fails on fast coins; too high lets bots skim from you.",
    "priority-fee": "An extra tip to Solana validators to process your transaction sooner — useful when racing to enter a launch.",
    "bribe": "An additional payment (Jito tip) to get your transaction into the fastest inclusion lane on Solana. Used by snipers.",
    "mev": "Maximal Extractable Value — profit bots extract by reordering/inserting transactions around yours (e.g., sandwich attacks). MEV protection routes around it.",
    "sandwich": "A bot buys right before your trade and sells right after, making you overpay and pocketing the difference.",
    "jito": "Infrastructure for bundling transactions so they land together in the same block, with a tip — the fast, MEV-protected lane Axiom uses.",
    "sniper": "A bot that buys a coin in its first block(s), before humans can react. Usually already in profit by the time you see the launch.",
    "bundle": "Buying a chunk of a coin in the very first block(s) of its launch — often insiders faking demand and holding supply.",
    "honeypot": "A scam token you can buy but not sell. Your bag is trapped forever. Defense: always make a tiny test trade first.",
    "burner": "A separate, low-value wallet used only for risky memecoin trading, so a hack or drain can't touch your main holdings.",
    "perps": "Perpetual futures — leveraged contracts that let you bet on price up or down without holding the token. Axiom integrates Hyperliquid for these.",
    "leverage": "Trading with borrowed size to amplify exposure. Multiplies both gains and losses; high leverage can liquidate you fast.",
    "liquidation": "When a leveraged position loses enough that it's force-closed and you lose the margin you put up.",
    "rug": "Rug pull — the dev removes liquidity or dumps their supply, crashing the price to ~zero instantly.",
    "copy-trading": "Automatically mirroring another wallet's trades. Sounds easy, but you're always a step behind — copying a fast pro even seconds late often loses money.",
    "smart-money": "Wallets with a track record of profitable trades. Traders watch clusters of them buying the same coin as a signal — though the best ones know they're being watched.",
    "pnl": "Profit and Loss — how much a wallet or trade has made or lost. Leaderboards rank traders by realized PnL.",
    "win-rate": "The share of a trader's trades that end in profit. A high win rate with tiny wins and rare huge losses can still lose money — and vice versa.",
    "ath": "All-Time High — the highest price a coin has ever reached. 'Buying the ATH' (top) is a classic way to become exit liquidity.",
    "exit-liquidity": "You. When someone needs buyers to sell into, the late buyers provide the 'liquidity' they exit through. If someone's hyping you to buy, you may be it.",
    "dca": "Dollar-Cost Averaging — splitting your entry (or exit) into several smaller trades across prices instead of one all-at-once order. Ladder orders automate this.",
    "ape": "To buy a coin impulsively and fast, usually with little research ('aping in'). High-risk by definition.",
    "bag": "Your holding of a token. 'Bag holder' = someone stuck holding a coin that has crashed.",
    "fomo": "Fear Of Missing Out — the emotional urge to buy because a coin is pumping. The feeling that makes people buy tops. Pros act on filters, not FOMO.",
    "moonbag": "A small portion of a position you keep after taking profits, in case the coin keeps running ('to the moon'). Lets you de-risk while staying in the game."
  };
  const GLOSSARY_TITLES = {
    "memecoin":"Memecoin","market-cap":"Market Cap","solana":"Solana","sol":"SOL","seed-phrase":"Seed Phrase",
    "dex":"DEX","liquidity":"Liquidity","amm":"AMM","pumpfun":"Pump.fun","bonding-curve":"Bonding Curve",
    "graduation":"Graduation","slippage":"Slippage","priority-fee":"Priority Fee","bribe":"Bribe / Jito Tip",
    "mev":"MEV","sandwich":"Sandwich Attack","jito":"Jito Bundles","sniper":"Sniper","bundle":"Bundle",
    "honeypot":"Honeypot","burner":"Burner Wallet","perps":"Perps","leverage":"Leverage","liquidation":"Liquidation","rug":"Rug Pull",
    "copy-trading":"Copy Trading","smart-money":"Smart Money","pnl":"PnL","win-rate":"Win Rate","ath":"ATH (All-Time High)",
    "exit-liquidity":"Exit Liquidity","dca":"DCA","ape":"Ape","bag":"Bag","fomo":"FOMO","moonbag":"Moonbag"
  };

  /* ---------- Build glossary list ---------- */
  const glossaryList = $("#glossary-list");
  if (glossaryList) {
    const keys = Object.keys(GLOSSARY).sort((a, b) =>
      GLOSSARY_TITLES[a].localeCompare(GLOSSARY_TITLES[b]));
    glossaryList.innerHTML = keys.map(k =>
      `<div class="g-item" id="g-${k}"><dt>${GLOSSARY_TITLES[k]}</dt><dd>${GLOSSARY[k]}</dd></div>`
    ).join("");
  }

  /* glossary search */
  const gFilter = $("#glossary-filter");
  const gEmpty = $("#glossary-empty");
  if (gFilter) {
    gFilter.addEventListener("input", () => {
      const q = gFilter.value.trim().toLowerCase();
      let shown = 0;
      $$(".g-item", glossaryList).forEach(item => {
        const match = item.textContent.toLowerCase().includes(q);
        item.style.display = match ? "" : "none";
        if (match) shown++;
      });
      gEmpty.hidden = shown > 0;
    });
  }

  /* ---------- Inline term tooltips ---------- */
  const pop = $("#term-pop");
  function showPop(el) {
    const key = el.dataset.term;
    if (!GLOSSARY[key]) return;
    pop.innerHTML = `<b>${GLOSSARY_TITLES[key] || key}</b>${GLOSSARY[key]}`;
    pop.hidden = false;
    const r = el.getBoundingClientRect();
    const top = r.bottom + window.scrollY + 8;
    let left = r.left + window.scrollX;
    pop.style.top = top + "px";
    pop.style.left = left + "px";
    // keep on-screen
    requestAnimationFrame(() => {
      const pr = pop.getBoundingClientRect();
      if (pr.right > window.innerWidth - 12) {
        pop.style.left = (window.innerWidth - pr.width - 12 + window.scrollX) + "px";
      }
    });
  }
  function hidePop() { pop.hidden = true; }
  $$("term[data-term]").forEach(el => {
    el.addEventListener("mouseenter", () => showPop(el));
    el.addEventListener("mouseleave", hidePop);
    el.addEventListener("click", () => {
      const t = $("#g-" + el.dataset.term);
      if (t) {
        if (gFilter) { gFilter.value = ""; gFilter.dispatchEvent(new Event("input")); }
        t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        t.classList.remove("target-flash"); void t.offsetWidth; t.classList.add("target-flash");
      }
    });
    el.setAttribute("tabindex", "0");
    el.addEventListener("focus", () => showPop(el));
    el.addEventListener("blur", hidePop);
  });

  /* ---------- Hero count-up ---------- */
  function animateCount(el) {
    const target = +el.dataset.count;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const dur = reduceMotion ? 0 : 1400;
    const start = performance.now();
    function fmt(n) {
      if (target >= 1000000) return (n / 1000000).toFixed(n < target ? 1 : 1) + "M";
      if (target >= 1000) return Math.round(n / 1000) + "K";
      return Math.round(n).toString();
    }
    function step(now) {
      const p = dur ? Math.min((now - start) / dur, 1) : 1;
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + fmt(target) + suffix;
    }
    requestAnimationFrame(step);
  }
  const heroObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$(".stat-num").forEach(el => heroObserver.observe(el));

  /* ---------- Bonding curve simulator ---------- */
  const canvas = $("#curve-canvas");
  const slider = $("#curve-slider");
  if (canvas && slider) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height, pad = 28;
    const GRAD_MCAP = 69000;
    const SUPPLY = 1e9; // 1B tokens (typical pump.fun supply)
    // price at a given % along the curve (quadratic-ish, steepening)
    const priceAt = pct => {
      const x = pct / 100;
      // base + quadratic growth so it steepens toward graduation
      return (0.0000004 + 0.00000006 * x + 0.00000007 * x * x);
    };
    const mcapAt = pct => Math.round(GRAD_MCAP * Math.pow(pct / 100, 1.55));

    const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
    function drawCurve(pct) {
      const gridCol = isLight() ? "rgba(100,116,139,.22)" : "rgba(38,50,74,.6)";
      const axisCol = isLight() ? "#5B6A82" : "#8595AD";
      const ringCol = isLight() ? "#FFFFFF" : "#0B0F1A";
      ctx.clearRect(0, 0, W, H);
      // grid
      ctx.strokeStyle = gridCol; ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad + (H - 2 * pad) * i / 4;
        ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
      }
      // graduation line
      ctx.strokeStyle = "rgba(34,211,138,.5)"; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(W - pad, pad); ctx.lineTo(W - pad, H - pad); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#22D38A"; ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = "right"; ctx.fillText("$69K GRAD", W - pad - 6, pad + 12);

      // curve path
      const xpix = p => pad + (W - 2 * pad) * (p / 100);
      const maxP = priceAt(100);
      const ypix = p => H - pad - (H - 2 * pad) * (priceAt(p) / maxP) * 0.92;

      // filled area up to pct
      ctx.beginPath();
      ctx.moveTo(xpix(0), H - pad);
      for (let p = 0; p <= pct; p += 1) ctx.lineTo(xpix(p), ypix(p));
      ctx.lineTo(xpix(pct), H - pad); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "rgba(245,158,11,.35)"); g.addColorStop(1, "rgba(245,158,11,0)");
      ctx.fillStyle = g; ctx.fill();

      // full curve line
      ctx.beginPath();
      for (let p = 0; p <= 100; p += 1) { const x = xpix(p), y = ypix(p); p === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = 2.5; ctx.stroke();

      // current point
      const cx = xpix(pct), cy = ypix(pct);
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#FBBF24"; ctx.fill();
      ctx.strokeStyle = ringCol; ctx.lineWidth = 2; ctx.stroke();

      // entry marker at 5%
      const ex = xpix(5), ey = ypix(5);
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#8B5CF6"; ctx.fill();
      ctx.fillStyle = "#A78BFA"; ctx.textAlign = "left"; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("your entry (5%)", ex + 8, ey - 6);

      // axes labels
      ctx.fillStyle = axisCol; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "left"; ctx.fillText("PRICE", pad, H - 8);
      ctx.textAlign = "right"; ctx.fillText("SUPPLY BOUGHT →", W - pad, H - 8);
    }

    function fmtPrice(p) { return "$" + p.toFixed(9); }
    function fmtMoney(n) {
      if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
      return "$" + n.toLocaleString();
    }
    function update() {
      const pct = +slider.value;
      $("#curve-pct").textContent = pct + "%";
      const price = priceAt(pct), mcap = mcapAt(pct);
      $("#ro-price").textContent = fmtPrice(price);
      $("#ro-mcap").textContent = fmtMoney(mcap);
      $("#ro-grad").textContent = pct >= 100 ? "GRADUATED 🎓".replace("🎓","") + "✓" : fmtMoney(Math.max(GRAD_MCAP - mcap, 0));
      const entryPrice = priceAt(5);
      const pnl = ((price - entryPrice) / entryPrice) * 100;
      const pnlEl = $("#ro-pnl");
      pnlEl.textContent = (pnl >= 0 ? "+" : "") + pnl.toFixed(0) + "%";
      pnlEl.className = pnl >= 0 ? "pos" : "neg";
      drawCurve(pct);
    }
    slider.addEventListener("input", update);
    update();
    window.addEventListener("resize", () => drawCurve(+slider.value));
    window.addEventListener("themechange", () => drawCurve(+slider.value));
  }

  /* ---------- Rug-check scorecard ---------- */
  const rugGrid = $("#rug-grid");
  if (rugGrid) {
    const fill = $("#rug-fill"), verdict = $("#rug-verdict");
    const boxes = $$('input[type=checkbox]', rugGrid);
    const maxScore = boxes.reduce((s, b) => s + (+b.dataset.w), 0);
    function updateRug() {
      const score = boxes.reduce((s, b) => s + (b.checked ? +b.dataset.w : 0), 0);
      const pct = Math.round((score / maxScore) * 100);
      fill.style.width = pct + "%";
      let msg, color;
      if (pct === 0) { msg = "Tick the boxes that are true →"; color = "var(--fg-soft)"; }
      else if (pct < 40) { msg = `⚠ ${pct}% — Major red flags. This is a coin-flip with the odds against you. Most experienced traders walk away here.`; color = "var(--red)"; }
      else if (pct < 70) { msg = `${pct}% — Mixed. Some safety, real risk remains. If you ape, size tiny and define your exit first.`; color = "var(--primary-2)"; }
      else if (pct < 100) { msg = `${pct}% — Relatively clean by memecoin standards. Still risky — "cleaner" never means "safe."`; color = "var(--green)"; }
      else { msg = `100% — Passes every basic check. Remember: a perfect score still can't stop a -90% from hype simply leaving. Manage your size.`; color = "var(--green)"; }
      verdict.textContent = msg.replace(/[⚠]/g, "! ").trim();
      verdict.style.color = color;
    }
    boxes.forEach(b => b.addEventListener("change", updateRug));
    updateRug();
  }

  /* ---------- Position-size & survival calculator ---------- */
  const bankrollEl = $("#bankroll");
  if (bankrollEl) {
    const riskSlider = $("#risk-slider"), streakSlider = $("#streak-slider");
    function fmt$(n) { return "$" + Math.round(n).toLocaleString(); }
    function updateSize() {
      const bank = Math.max(+bankrollEl.value || 0, 0);
      const risk = +riskSlider.value, streak = +streakSlider.value;
      $("#risk-out").textContent = risk + "%";
      $("#streak-out").textContent = streak;
      const pos = bank * risk / 100;
      $("#pos-size").textContent = fmt$(pos);
      // assume each loss = lose the risked position fully (worst-ish case for a memecoin)
      const after = bank * Math.pow(1 - risk / 100, streak);
      $("#after-streak").textContent = fmt$(after);
      const dd = ((after - bank) / bank) * 100;
      const ddEl = $("#drawdown");
      ddEl.textContent = dd.toFixed(1) + "%";
      ddEl.className = "";
      const note = $("#size-note");
      if (risk <= 3) note.innerHTML = `Risking <em>${risk}%</em> per trade, even a ${streak}-loss streak only costs <em>${Math.abs(dd).toFixed(0)}%</em> of your bankroll. You live to trade another day — this is the survivable zone.`;
      else if (risk <= 8) note.innerHTML = `At <em>${risk}%</em> risk, a ${streak}-loss streak takes <em>${Math.abs(dd).toFixed(0)}%</em>. Getting aggressive — a normal cold streak now seriously hurts.`;
      else note.innerHTML = `At <em>${risk}%</em> per trade, a ${streak}-loss streak vaporizes <em>${Math.abs(dd).toFixed(0)}%</em> of everything. In a market where most trades lose, this is how accounts go to zero. This is the danger zone.`;
    }
    [bankrollEl, riskSlider, streakSlider].forEach(el => el.addEventListener("input", updateSize));
    updateSize();
  }

  /* ---------- Pulse mock tooltips ---------- */
  const pulseTip = $("#pulse-tip");
  if (pulseTip) {
    const defaultTip = pulseTip.textContent;
    $$(".pulse-card").forEach(card => {
      const tip = card.dataset.tip;
      card.addEventListener("mouseenter", () => { pulseTip.textContent = tip; pulseTip.style.color = "var(--fg)"; });
      card.addEventListener("mouseleave", () => { pulseTip.textContent = defaultTip; pulseTip.style.color = ""; });
      card.setAttribute("tabindex", "0");
      card.addEventListener("focus", () => { pulseTip.textContent = tip; });
    });
  }

  /* ---------- Quiz ---------- */
  const QUIZ = [
    { q: "What gives a memecoin its value?", o: ["Company revenue and profits", "Attention, community, and speculation", "Government backing", "A fixed gold reserve"], a: 1, e: "Memecoins have no product or cash flow — value is pure supply/demand driven by attention." },
    { q: "On pump.fun, what happens to the price as people buy on the bonding curve?", o: ["It stays fixed", "It goes down", "It rises automatically", "It's set by an order book"], a: 2, e: "The bonding curve is a formula: every buy pushes price up, every sell pushes it down. No order book." },
    { q: "Roughly what market cap does a coin need to reach to 'graduate'?", o: ["$6,900", "$69,000", "$690,000", "$6.9M"], a: 1, e: "~$69K market cap triggers graduation, depositing ~$12K of liquidity into a real DEX." },
    { q: "What are Axiom's three Pulse columns, in order?", o: ["Buy / Hold / Sell", "New Pairs / Final Stretch / Migrated", "Cheap / Mid / Expensive", "Safe / Risky / Scam"], a: 1, e: "They mirror the lifecycle: freshly launched → nearing graduation → migrated to a real DEX." },
    { q: "What is a 'honeypot' token?", o: ["A coin with great rewards", "One you can buy but not sell", "A verified safe token", "A coin with locked liquidity"], a: 1, e: "Honeypots let you buy but block selling. Always make a tiny test trade to confirm you can exit." },
    { q: "Why make a small test trade before sizing up?", o: ["To save on fees", "To confirm you can actually sell (avoid honeypots)", "It's required by law", "To increase your rewards tier"], a: 1, e: "If you can't sell a tiny bag, you can't sell a big one. Always verify the exit first." },
    { q: "What is slippage?", o: ["A platform fee", "The max price change you'll accept on a trade", "The number of holders", "A type of order"], a: 1, e: "Too low and your trade fails on fast coins; too high and bots can skim from you." },
    { q: "A 'rug pull' is when…", o: ["The price slowly declines", "The dev removes liquidity or dumps, crashing it to ~zero", "Volume increases", "The coin graduates"], a: 1, e: "Defense: look for locked/burned liquidity, low dev holdings, and revoked mint authority." },
    { q: "Which risk approach keeps you in the game longest?", o: ["Going all-in on high-conviction plays", "Risking 1–2% of bankroll per trade", "Averaging down on losers", "Using maximum leverage"], a: 1, e: "Small, consistent sizing means a normal losing streak can't wipe you out. Survival first." },
    { q: "What does a 'sandwich attack' do?", o: ["Locks your liquidity", "A bot buys before and sells after your trade to skim profit", "Doubles your tokens", "Speeds up your transaction"], a: 1, e: "It's a form of MEV. Enabling MEV protection routes your trade to avoid it." },
    { q: "Researchers copied Cented's trades with a 10-second delay. The result was…", o: ["+300%", "Roughly break-even", "About -21%", "+50%"], a: 2, e: "Even copying a profitable pro slightly late lost money (~-21.3%). The edge is speed you don't have." },
    { q: "Why is following famous traders' wallets risky?", o: ["Their trades are secret", "You see their move after they've already profited", "They never make money", "It's illegal"], a: 1, e: "By the time a snipe shows on a leaderboard, the easy profit is gone — you'd be buying their exit." },
    { q: "What is 'survivorship bias' in memecoin trading?", o: ["A tax rule", "Only seeing the winners, never the thousands who blew up doing the same thing", "A type of order", "When a coin survives migration"], a: 1, e: "The $10M wallets are visible; the graveyard of identical wallets that went to zero is not." },
    { q: "The single most copyable habit from disciplined pros is…", o: ["Using maximum leverage", "Selling in stages / taking initial back", "Holding forever", "Buying the all-time high"], a: 1, e: "Scaling out — recover your stake early, take profit in chunks, let a moonbag ride. Nobody nails the exact top." },
    { q: "In the first-trade walkthrough, why place a tiny test SELL right after buying?", o: ["To pay less fees", "To confirm the token isn't a honeypot you can't exit", "To increase your win rate", "It's legally required"], a: 1, e: "If you can't sell a tiny bag, you can't sell a big one. Always verify the exit before sizing up." }
  ];
  const quizEl = $("#quiz");
  if (quizEl) {
    let answered = 0, correct = 0;
    quizEl.innerHTML = QUIZ.map((item, i) => `
      <div class="q" data-i="${i}">
        <div class="q-num">QUESTION ${String(i + 1).padStart(2, "0")} / ${String(QUIZ.length).padStart(2, "0")}</div>
        <div class="q-text">${item.q}</div>
        <div class="q-opts">
          ${item.o.map((opt, j) => `<button class="q-opt" data-j="${j}">${opt}<span class="mark"></span></button>`).join("")}
        </div>
        <div class="q-explain"></div>
      </div>`).join("");

    $$(".q", quizEl).forEach(qBlock => {
      const i = +qBlock.dataset.i;
      const opts = $$(".q-opt", qBlock);
      const explain = $(".q-explain", qBlock);
      opts.forEach(btn => {
        btn.addEventListener("click", () => {
          if (qBlock.dataset.done) return;
          qBlock.dataset.done = "1";
          const j = +btn.dataset.j;
          const right = QUIZ[i].a;
          answered++;
          if (j === right) { correct++; btn.classList.add("correct"); $(".mark", btn).textContent = "✓"; }
          else {
            btn.classList.add("wrong"); $(".mark", btn).textContent = "✗";
            opts[right].classList.add("correct"); $(".mark", opts[right]).textContent = "✓";
          }
          opts.forEach(o => o.disabled = true);
          explain.textContent = QUIZ[i].e;
          explain.classList.add("show");
          if (answered === QUIZ.length) showResult();
        });
      });
    });

    function showResult() {
      const res = $("#quiz-result");
      res.hidden = false;
      $("#quiz-score").textContent = correct + " / " + QUIZ.length;
      let msg;
      if (correct === QUIZ.length) msg = "Flawless. You understand the mechanics better than most people clicking 'Quick Buy' right now.";
      else if (correct >= 7) msg = "Solid grasp. Re-skim the chapters behind any you missed before risking real money.";
      else if (correct >= 4) msg = "Decent start — but go back through the guide. The gaps are exactly where the market takes money.";
      else msg = "Worth a full re-read. This stuff is genuinely counterintuitive; that's the point of learning it first.";
      $("#quiz-msg").textContent = msg;
      res.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    }

    $("#quiz-reset").addEventListener("click", () => {
      answered = 0; correct = 0;
      $("#quiz-result").hidden = true;
      $$(".q", quizEl).forEach(qBlock => {
        delete qBlock.dataset.done;
        $$(".q-opt", qBlock).forEach(o => { o.disabled = false; o.classList.remove("correct", "wrong"); $(".mark", o).textContent = ""; });
        $(".q-explain", qBlock).classList.remove("show");
      });
      quizEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  /* ---------- Nav: scrollspy, filter, mobile ---------- */
  const navLinks = $$(".nav-list a");
  const sections = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
      }
    });
  }, { rootMargin: "-20% 0px -70% 0px" });
  sections.forEach(s => spy.observe(s));

  // nav filter
  const navFilter = $("#nav-filter");
  if (navFilter) {
    navFilter.addEventListener("input", () => {
      const q = navFilter.value.trim().toLowerCase();
      $$(".nav-list li").forEach(li => {
        li.classList.toggle("hide", !li.textContent.toLowerCase().includes(q));
      });
    });
  }

  // mobile menu
  const sidebar = $("#sidebar"), toggle = $("#menu-toggle"), backdrop = $("#backdrop");
  function closeMenu() { sidebar.classList.remove("open"); backdrop.hidden = true; toggle.setAttribute("aria-expanded", "false"); }
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = sidebar.classList.toggle("open");
      backdrop.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });
    backdrop.addEventListener("click", closeMenu);
    navLinks.forEach(a => a.addEventListener("click", closeMenu));
  }

  /* ---------- Theme toggle ---------- */
  (function themeInit() {
    const root = document.documentElement;
    let saved;
    try { saved = localStorage.getItem("ma-theme"); } catch (e) {}
    if (saved) root.setAttribute("data-theme", saved);
    function setTheme(t) {
      root.setAttribute("data-theme", t);
      try { localStorage.setItem("ma-theme", t); } catch (e) {}
      window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
    }
    $$("[data-theme-toggle]").forEach(btn => {
      btn.addEventListener("click", () => {
        const cur = root.getAttribute("data-theme") === "light" ? "light" : "dark";
        setTheme(cur === "light" ? "dark" : "light");
      });
    });
  })();

  /* ---------- First-trade stepper ---------- */
  const STEPS = [
    { t: "Get SOL & a burner wallet", tag: "Prep", b: "Buy a small amount of SOL on a normal exchange (Coinbase, Kraken, etc.) and create a fresh wallet you'll use only for memecoins. Write the seed phrase on paper — never digital.", w: "A dedicated burner means a hack, drain, or bad signature can never touch your main savings. It's your blast shield." },
    { t: "Go to the REAL axiom.trade", tag: "Setup", b: "Type the URL yourself or use a bookmark. Ignore ads, Google sponsored links, and DMs. Connect or generate your wallet. Double-check the domain is exactly axiom.trade.", w: "Phishing clones that steal seed phrases are the #1 way people lose everything before they even trade. The fake site looks identical." },
    { t: "Make a tiny test deposit", tag: "Fund", b: "Send a small amount of SOL into your Axiom wallet first — not your whole stack. Confirm it arrives and the balance shows correctly.", w: "You're verifying the whole pipeline works with money you don't mind losing, before trusting it with more." },
    { t: "Configure your settings", tag: "Config", b: "Before trading, set sane defaults: enable MEV protection, set slippage appropriate to the coin (higher for brand-new, tighter for established), and a reasonable priority fee. Don't crank everything to max.", w: "Wrong settings = failed trades or getting sandwiched by bots. Getting this right once saves you on every trade after." },
    { t: "Find a coin & run the rug-check", tag: "Scout", b: "Open Pulse. Pick something and run the 60-second rug-check from chapter 07: mint revoked, liquidity locked/burned, holder distribution sane, volume rising, real community.", w: "Most coins fail basic checks. The discipline to skip 95% of them is the actual skill — FOMO is the enemy." },
    { t: "Place a TINY test buy", tag: "Buy", b: "Buy a coffee-sized amount. Watch the transaction land, confirm your token balance updates, and note the price you got vs. what you expected (that gap is slippage).", w: "You're learning the click-to-confirmed loop and what your settings actually do — with trivial money on the line." },
    { t: "Immediately test that you can SELL", tag: "Verify", b: "Sell a small piece of what you just bought. Confirm it goes through and SOL comes back. If you can't sell, you found a honeypot — and you found it cheaply.", w: "Buying is never the problem; exiting is. Proving the exit works is the single most important habit in this whole game." },
    { t: "Size your real entry + set an exit plan", tag: "Plan", b: "Only now consider a 'real' position — still tiny (1–2% of your bankroll, per chapter 10). Before you buy, write your plan: take-profit levels and a stop. Decide the exits first.", w: "Plans made before the trade are rational; decisions made mid-pump are emotional. Pre-commit so greed and fear can't drive." },
    { t: "Execute the plan — then walk away", tag: "Discipline", b: "Take your initial back at your first target. Trim into strength. Cut the loser at your stop without negotiating. Keep a small moonbag if you want. Then actually close the tab.", w: "Following a boring plan is what separates the survivors from the blow-ups. The exit you planned beats the exit you panic into." }
  ];
  const stepRail = $("#step-rail"), stepPanel = $("#step-panel");
  if (stepRail && stepPanel) {
    let cur = 0;
    const done = new Array(STEPS.length).fill(false);
    const prevBtn = $("#step-prev"), nextBtn = $("#step-next"), doneChk = $("#step-done"), fill = $("#step-fill");
    stepRail.innerHTML = STEPS.map((s, i) =>
      `<button data-i="${i}"><span class="rail-num">${i + 1}</span><span>${s.t}</span></button>`).join("");
    const railBtns = $$("button", stepRail);

    function render() {
      const s = STEPS[cur];
      stepPanel.innerHTML = `
        <span class="sp-tag">Step ${cur + 1} of ${STEPS.length} · ${s.tag}</span>
        <h4>${s.t}</h4>
        <p>${s.b}</p>
        <div class="sp-why"><b>Why this matters: </b>${s.w}</div>`;
      railBtns.forEach((b, i) => {
        b.classList.toggle("active", i === cur);
        b.classList.toggle("complete", done[i]);
      });
      doneChk.checked = done[cur];
      prevBtn.disabled = cur === 0;
      prevBtn.style.visibility = cur === 0 ? "hidden" : "visible";
      nextBtn.textContent = cur === STEPS.length - 1 ? "Finish ✓" : "Next →";
      const completed = done.filter(Boolean).length;
      fill.style.width = (completed / STEPS.length * 100) + "%";
    }
    railBtns.forEach(b => b.addEventListener("click", () => { cur = +b.dataset.i; render(); }));
    prevBtn.addEventListener("click", () => { if (cur > 0) { cur--; render(); } });
    nextBtn.addEventListener("click", () => {
      done[cur] = true;
      if (cur < STEPS.length - 1) cur++;
      render();
    });
    doneChk.addEventListener("change", () => { done[cur] = doneChk.checked; render(); });
    render();
  }

  /* ---------- Scroll progress bar ---------- */
  const prog = $("#scrollbar-progress");
  if (prog) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
        prog.style.width = Math.min(pct, 100) + "%";
        ticking = false;
      });
    }, { passive: true });
  }
})();
