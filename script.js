// ---------------------
// 刀装マスター
// ---------------------
const equipMaster = {
  "短刀": ["軽歩兵","重歩兵","投石兵","弓兵","銃兵"],
  "脇差": ["軽歩兵","重歩兵","投石兵","弓兵","盾兵"],
  "打刀": ["軽歩兵","重歩兵","軽騎兵","投石兵","盾兵"],
  "太刀": ["軽歩兵","重歩兵","軽騎兵","重騎兵","盾兵"],
  "大太刀": ["軽歩兵","重歩兵","軽騎兵","重騎兵","精鋭兵","盾兵"],
  "槍": ["軽歩兵","重歩兵","槍兵"],
  "薙刀": ["軽歩兵","重歩兵","槍兵"],
  "剣": ["軽歩兵","重歩兵","精鋭兵","弓兵","銃兵","盾兵"]
};

// ---------------------
// URLパラメータからID取得
// ---------------------
const urlParams = new URLSearchParams(window.location.search);
const toukenId = parseInt(urlParams.get("id") || 0);

// ---------------------
// ページ読み込み時処理
// ---------------------
document.addEventListener("DOMContentLoaded", () => {
  fetch('./data/touken.json')
    .then(res => res.json())
    .then(dataArr => {
      const data = dataArr.find(d => d.id === toukenId) || dataArr[0];

      fillBasicInfo(data);
      fillStatusTable(data);
      fillAcquisitionTable(data);
      fillCategoryTable(data);
      fillLinkTable(data);

      loadSerifu(data.id);
    });
});

// ---------------------
// 基本情報
// ---------------------
function fillBasicInfo(data) {
  const basic = document.getElementById('basic-info');
  basic.innerHTML = `
    <tr><th colspan="7" class="section-header">${data.id}番</th></tr>
    <tr>
      <td class="image-cell" rowspan="7">
        <img src="${data.image || ''}" alt="刀剣画像">
      </td>
      <td class="label">名前</td>
      <td class="value" colspan="2">${data.name || ""}<br>（${data.reading || ""}）</td>
    </tr>
    <tr><td class="label">刀種</td><td class="value">${data.type || ""}</td></tr>
    <tr><td class="label">刀派</td><td class="value">${data.school || ""}</td></tr>
    <tr><td class="label">作成時期</td><td class="value">${data.era || ""}</td></tr>
    <tr><td class="label">声優</td><td class="value">${data.cv || ""}</td></tr>
    <tr><td class="label">刀装</td><td class="value">${equipMaster[data.type]?.join('、') || ""}</td></tr>
  `;
}

// ---------------------
// ステータス表
// ---------------------
function fillStatusTable(data) {
  const status = document.getElementById('status-table');
  const statusLabels = {
    hp: "生存",
    attack: "打撃",
    defense: "統率",
    mobility: "機動",
    power: "衝力",
    scout: "偵察",
    conceal: "隠蔽",
    critical: "必殺"
  };
  let total = Object.keys(statusLabels).reduce((sum, k) => sum + (data.stats?.[k] || 0), 0);

  let statusHTML = `<tr><th colspan="4" class="section-header">ステータス</th></tr>`;
  statusHTML += `<tr><td colspan="4" class="graph-cell">
                   <img src="${data.stats?.graph || ''}" alt="グラフ">
                 </td></tr>`;
  statusHTML += `<tr><td class="label">総合</td><td class="value" colspan="3">${total}</td></tr>`;

  const statKeys = Object.keys(statusLabels);
  for (let i = 0; i < statKeys.length; i += 2) {
    statusHTML += `<tr>
      <td class="label">${statusLabels[statKeys[i]]}</td>
      <td class="value">${data.stats?.[statKeys[i]] || ""}</td>`;
    if (statKeys[i + 1]) {
      statusHTML += `<td class="label">${statusLabels[statKeys[i + 1]]}</td>
                     <td class="value">${data.stats?.[statKeys[i + 1]] || ""}</td>`;
    } else {
      statusHTML += `<td></td><td></td>`;
    }
    statusHTML += `</tr>`;
  }
  statusHTML += `<tr><td class="label">範囲</td><td class="value">${data.range || ""}</td>
                 <td class="label">スロット</td><td class="value">3</td></tr>`;
  status.innerHTML = statusHTML;
}

// ---------------------
// 入手方法
// ---------------------
function fillAcquisitionTable(data) {
  const acquisition = document.getElementById('acquisition-table');
  let acqHTML = `<tr><th class="section-header" colspan="2">入手方法</th></tr>`;
  acqHTML += `<tr><td class="label">実装日</td><td class="value">${data.release_date || ""}</td></tr>`;
  for (let key in data.obtain || {}) {
    acqHTML += `<tr><td class="label">${key}</td>
                <td class="value">${Array.isArray(data.obtain[key]) ? data.obtain[key].join('、') : ""}</td></tr>`;
  }
  acquisition.innerHTML = acqHTML;
}

// ---------------------
// 区分
// ---------------------
function fillCategoryTable(data) {
  const category = document.getElementById('category-table');
  let catHTML = `<tr><th class="section-header" colspan="2">区分</th></tr>`;
  catHTML += `<tr><td class="label">現況</td><td class="value">${data.location?.status || ""}</td></tr>`;
  catHTML += `<tr><td class="label">所蔵先</td><td class="value">${data.location?.place || ""}</td></tr>`;
  catHTML += `<tr><td class="label">備考</td><td class="value">${data.location?.note || ""}</td></tr>`;
  catHTML += `<tr><td class="label">文化財区分</td><td class="value">${data.cultural_property?.designation || ""} (${data.cultural_property?.since || ""})</td></tr>`;
  catHTML += `<tr><td class="label">所有者</td><td class="value">${data.master || ""}</td></tr>`;
  category.innerHTML = catHTML;
}

// ---------------------
// リンクテーブル
// ---------------------
function fillLinkTable(data) {
  const linkBody = document.getElementById('link-body');
  if (!linkBody) return;

  const stages = Object.entries(data.link || {})
    .filter(([_, url]) => url)
    .sort(([aName, aUrl], [bName, bUrl]) => {
      const aId = parseInt(aUrl.match(/id=(\d+)/)[1]);
      const bId = parseInt(bUrl.match(/id=(\d+)/)[1]);
      return aId - bId;
    })
    .map(([stageName, url]) => {
      let lv = null;
      if (stageName.startsWith("特")) {
        lv = data.rare <= 2 ? 20 : 25;
        if (stageName === "特二") lv = 50;
        if (stageName === "特三") lv = 75;
      }
      const stageText = data.name.includes(stageName) ? "" : ` ${stageName}`;
      const linkText = `${data.name}${stageText}`;
      const lvText = lv ? ` (Lv.${lv})` : "";
      return `<a href="${url}">${linkText}</a>${lvText}`;
    });

  linkBody.innerHTML = `<tr><td class="value" colspan="2">${stages.join(" → ")}</td></tr>`;
}

// ---------------------
// セリフ読み込み
// ---------------------
   const data = await res.json();

    // dataが配列で、各要素が { id: n, "セリフ": { ... } } の形をしている前提
    const serifuObj = Array.isArray(data) ? data.find(item => item.id === id) : (data[id] || null);
    if (!serifuObj) {
      console.warn(`ID ${id} のオブジェクトが見つかりません`);
      return;
    }
    const serifu = serifuObj["セリフ"] || serifuObj["セリフ一覧"] || serifuObj; // 安全対策

    // 既存のセルをクリア（任意）
    clearSerifuCells();
    function toggleRowVisibility(cell, value) {
      const tr = cell.closest("tr");
      if (!tr) return;
      const isEmpty = value == null || String(value).trim() === "";
      tr.style.display = isEmpty ? "none" : "";
    }

    // 再帰的にオブジェクトを走査して id と一致する要素に代入する
    function applyValues(obj) {
      for (const [key, val] of Object.entries(obj)) {
        if (val && typeof val === "object" && !Array.isArray(val)) {
          // ネストしているオブジェクトは深掘り
          applyValues(val);
          continue;
        }

        // val は文字列か null か配列（配列は特殊処理）
        if (Array.isArray(val)) {
          // 配列の場合、 id に "_1", "_2" のように結合しているケースを試す
          for (let i = 0; i < val.length; i++) {
            const attemptIds = [
              `${key}_${i+1}`,   // ex: honmaru_1 が JSON では ["a","b"] で来る場合
              `${key}${i+1}`,    // ex: honmaru1
              key                // まずは素の key を試す
            ];
            let placed = false;
            for (const aid of attemptIds) {
              const el = document.getElementById(aid);
              if (el) {
                el.textContent = val[i] ?? "";
                toggleRowVisibility(el, val[i]);
                placed = true;
                break;
              }
            }
            if (!placed) {
              console.warn(`配列要素を挿入できませんでした: ${key}[${i}] -> 該当するセルが見つかりません`);
            }
          }
          continue;
        }

        // 単一値（文字列 or null）
// 単一値（文字列 or null）
const el = document.getElementById(key);
if (el) {
  if (val === null) {
    // 🔽 追加ここから：nullなら親<tr>を非表示
    const tr = el.closest("tr");
    if (tr) tr.style.display = "none";
    continue; // これで以降処理をスキップ
    // 🔼 追加ここまで
  }
  el.textContent = val ?? ""; // null でなければ普通に表示（"" はOK）
} else {
  console.warn(`セルが見つかりません: id="${key}" value="${val}"`);
}

      }
    }

    applyValues(serifu);
    console.log("セリフ反映完了:", serifuObj);

  } catch (err) {
    console.error("セリフ読み込みに失敗しました:", err);
  }
}

// 既存の td[id] を初期化したいときに便利
function clearSerifuCells() {
  // table 内のすべての id を持つセルを対象にする（必要に応じてセレクタを絞ってください）
  const tbody = document.getElementById("serifu-body");
  if (!tbody) return;
  // セルは <td id="..."> の形で存在すると仮定
  const idCells = tbody.querySelectorAll("td[id]");
  idCells.forEach(td => td.textContent = "");
}

// ページ読み込み時の自動実行（例）
document.addEventListener("DOMContentLoaded", () => {
  loadSerifu(0); // 例: ID 0 を読み込む
});

// ---------------------
// セリフ開閉
// ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("serifu-body");
  const serifuTable = document.getElementById("serifu-table");
  const header = serifuTable.querySelector(".serifu-header");
  let open = false;
  tbody.style.display = "none";
  header.textContent = "セリフ一覧 ▲";
  header.style.cursor = "pointer";
  header.addEventListener("click", () => {
    open = !open;
    tbody.style.display = open ? "table-row-group" : "none";
    header.textContent = open ? "セリフ一覧 ▼" : "セリフ一覧 ▲";
  });
});
