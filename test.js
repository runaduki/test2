// 刀装
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

// URLパラメータからid取得
const urlParams = new URLSearchParams(window.location.search);
const toukenId = parseInt(urlParams.get("id") || 0);

document.addEventListener("DOMContentLoaded", () => {
  fetch('./data/touken.json')
    .then(res => res.json())
    .then(dataArr => {
      const data = dataArr.find(d => d.id === toukenId) || dataArr[0];

      // 基本情報
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

      // ステータス
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

      // 入手方法
      const acquisition = document.getElementById('acquisition-table');
      let acqHTML = `<tr><th class="section-header" colspan="2">入手方法</th></tr>`;
      acqHTML += `<tr><td class="label">実装日</td><td class="value">${data.release_date || ""}</td></tr>`;
      for (let key in data.obtain || {}) {
        acqHTML += `<tr><td class="label">${key}</td>
                    <td class="value">${Array.isArray(data.obtain[key]) ? data.obtain[key].join('、') : ""}</td></tr>`;
      }
      acquisition.innerHTML = acqHTML;

      // 区分
      const category = document.getElementById('category-table');
      let catHTML = `<tr><th class="section-header" colspan="2">区分</th></tr>`;
      catHTML += `<tr><td class="label">現況</td><td class="value">${data.location?.status || ""}</td></tr>`;
      catHTML += `<tr><td class="label">所蔵先</td><td class="value">${data.location?.place || ""}</td></tr>`;
      catHTML += `<tr><td class="label">備考</td><td class="value">${data.location?.note || ""}</td></tr>`;
      catHTML += `<tr><td class="label">文化財区分</td><td class="value">${data.cultural_property?.designation || ""} (${data.cultural_property?.since || ""})</td></tr>`;
      catHTML += `<tr><td class="label">所有者</td><td class="value">${data.master || ""}</td></tr>`;
      category.innerHTML = catHTML;

// リンク表示部分
const linkBody = document.getElementById('link-body');

if (linkBody) {
  // URLがあるものだけ取得してID順に並べる
  const stages = Object.entries(data.link)
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

      // 名前にstageNameが含まれる場合は重複させない
      const stageText = data.name.includes(stageName) ? "" : ` ${stageName}`;
      const linkText = `${data.name}${stageText}`;
      const lvText = lv ? ` (Lv.${lv})` : "";

      return `<a href="${url}">${linkText}</a>${lvText}`;
    });

  // 矢印でつなぐ
  linkBody.innerHTML = `<tr><td class="value" colspan="2">${stages.join(" → ")}</td></tr>`;
}







      // セリフ読み込み
      loadSerifu(data.id);
    });
});

// ---------------------
// セリフ読み込み関数
// ---------------------
async function loadSerifu(id) {

  const mainTbody = document.getElementById("serifu-body"); // ←これを先に！
  mainTbody.innerHTML = "";

  const res = await fetch("../data/serifu.json");
  const data = await res.json();
  const serifu = data[id];

  for (const [category, lines] of Object.entries(serifu)) {
    // カテゴリ見出しを tr で作る
    const catRow = document.createElement("tr");
    const catCell = document.createElement("th");
    catCell.colSpan = 2;
    catCell.className = "category-header";
    catCell.textContent = category;
    catRow.appendChild(catCell);
    mainTbody.appendChild(catRow);

    // 乱舞まとめ
    const merged = mergeRanbuKeys(lines);

    // buildTable の出力も全部 mainTbody に入れる
    buildTable(merged, mainTbody);
  }
}




// 「乱舞2」「乱舞2(出陣)」をまとめる
function mergeRanbuKeys(lines) {
  const merged = {};
  for (const [key, val] of Object.entries(lines)) {
    const baseKey = key.match(/^乱舞\d+/)?.[0] || key;
    if (!merged[baseKey]) merged[baseKey] = {};
    const subKey = key === baseKey ? "　" : key.replace(baseKey, "").replace(/[()]/g, "");
    merged[baseKey][subKey || "　"] = val;
  }
  return merged;
}

// 未実装・未判明表示
function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return '<span class="no-voice"></span>'; // 未実装
  }
  if (value === "？") {
    return '<span class="unknown-voice">？</span>'; // 未判明
  }
  return value;
}

// テーブル生成
function buildTable(obj, tbody, parentKey = "") {
  if (typeof obj === "string") {
    const tr = document.createElement("tr");
    if (parentKey) {
      const tdKey = document.createElement("td");
      tdKey.className = "label";
      tdKey.textContent = parentKey;
      tr.appendChild(tdKey);
    }
    const tdVal = document.createElement("td");
    tdVal.innerHTML = formatValue(obj);
    tr.appendChild(tdVal);
    tbody.appendChild(tr);
  } else if (Array.isArray(obj)) {
    obj.forEach((line, i) => {
      const tr = document.createElement("tr");
      if (i === 0 && parentKey) {
        const tdKey = document.createElement("td");
        tdKey.className = "label";
        tdKey.rowSpan = obj.length;
        tdKey.textContent = parentKey;
        tr.appendChild(tdKey);
      }
      const tdVal = document.createElement("td");
      tdVal.innerHTML = formatValue(line);
      tr.appendChild(tdVal);
      tbody.appendChild(tr);
    });
  } else if (typeof obj === "object" && obj !== null) {
    for (const [key, val] of Object.entries(obj)) {
      buildTable(val, tbody, key);
    }
  }
}

// セリフ開閉
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
