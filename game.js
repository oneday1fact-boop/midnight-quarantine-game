(() => {
  "use strict";
  const SAVE_KEY = "midnight-quarantine-save-v1";
  const initial = () => ({
    node:"wake", health:100, alert:18, battery:78, noise:0,
    inventory:[], flags:{}, steps:0, sound:false, ending:null
  });
  let state = initial();
  let toastTimer;
  const $ = id => document.getElementById(id);
  const scenes = {
    wake:{
      tag:"CHAPTER 01 · THE WARD", title:"最後一個病人", speaker:"未知來電 · 23:47",
      text:[
        "你喺一張冰冷嘅病床上醒來。手腕有三個新鮮針孔，嘴裡充滿消毒水和鐵鏽混合的味道。床尾的病歷寫著你的姓名，入院時間卻是十一年前。",
        "走廊傳來金屬器械拖地的聲音。一下、一下，停在門外。門底慢慢滑進一張濕透的照片——是你失蹤的妹妹。她的臉被人用黑筆塗掉，背面寫著：『不要相信穿白袍的人，即使他用你的聲音叫你。』",
        "廣播突然響起一個溫柔得不自然的男聲：「歡迎回來。你妹妹一直在等你。」門把開始緩緩轉動。"
      ],
      choices:[
        {title:"查看床邊的抽屜",desc:"可能找到有用物品，但抽屜會發出聲音。",to:"drawer",effect:{noise:10,alert:5}},
        {title:"走到門邊，偷看走廊",desc:"先觀察環境，了解聲音來自哪裡。",to:"corridor",effect:{alert:4,battery:-2}},
        {title:"立即離開病房",desc:"快速逃出去，但腳步聲可能引來醫生。",to:"hall",effect:{noise:18,alert:14,health:-3}}
      ]
    },
    drawer:{
      tag:"CHAPTER 01 · THE WARD", title:"抽屜裡的東西", speaker:"你 · 心跳加速",
      text:[
        "抽屜卡住了。你用力一拉，金屬滑軌發出刺耳嘅尖叫聲。",
        "入面有一串生鏽鎖匙，同一張被水浸濕嘅病歷。病歷上嘅病人姓名被人刮走，只剩下紅筆寫嘅一句：『不要讓他聞到血。』",
        "走廊嘅腳步聲停了。"
      ],
      onEnter(s){addItem(s,"生鏽鎖匙");s.flags.foundNote=true;},
      choices:[
        {title:"帶上鎖匙，從病房門離開",desc:"腳步聲似乎正朝你靠近。",to:"corridor",effect:{alert:10}},
        {title:"躲到病床底下等一等",desc:"先避開走廊的視線。",to:"underbed",effect:{alert:-5,battery:-1}}
      ]
    },
    corridor:{
      tag:"CHAPTER 01 · EAST WING", title:"走廊盡頭", speaker:"環境 · 23:51",
      text:[
        "走廊長得不合理。左邊係護士站，右邊係手術室，盡頭有一部停運嘅升降機。",
        "遠處，一個穿著白袍嘅高瘦身影背對住你，慢慢整理手套。佢似乎未發現你。",
        "牆上貼住一張褪色告示：『夜間請勿進入地下手術區。』"
      ],
      choices:[
        {title:"左轉進入護士站",desc:"可能找到門卡或更多病歷。",to:"nurse",effect:{noise:3,alert:3,battery:-3}},
        {title:"右轉前往手術室",desc:"危險，但可能找到地下室線索。",to:"surgery",effect:{alert:12,battery:-4}},
        {title:"躡手躡腳走向升降機",desc:"盡量保持安靜，嘗試離開這層樓。",to:"elevator",effect:{noise:0,alert:4,battery:-5}},
        {title:"躲進附近的清潔衣櫃",desc:"暫時避開走廊上的身影。",to:"closet",effect:{alert:-8,battery:-1}}
      ]
    },
    underbed:{
      tag:"CHAPTER 01 · HIDING", title:"床底下", speaker:"你 · 屏住呼吸",
      text:[
        "灰塵黏在你嘅嘴唇上。你聽到門被推開，一雙擦得發亮嘅黑鞋慢慢走進病房。",
        "「奇怪……我明明聽到有人醒了。」醫生輕輕敲了敲床架。",
        "你只可以保持安靜，或者趁佢背向你時逃出去。"
      ],
      choices:[
        {title:"完全不動，等他離開",desc:"安靜可能降低警戒，但會消耗時間。",to:"hidingWait",effect:{alert:-12,battery:-2}},
        {title:"趁機爬出病房",desc:"有機會逃走，但可能被看見。",to:"chase",effect:{noise:16,alert:18,health:-5}}
      ]
    },
    nurse:{
      tag:"CHAPTER 01 · NURSE STATION", title:"護士站的留言", speaker:"錄音機 · 斷續播放",
      text:[
        "護士站空無一人，桌上有一部仍然運作嘅錄音機。",
        "「如果有人聽到呢段錄音，千祈唔好去地下室。陳醫生唔係治療病人……佢將病人當成食物。」",
        "你在桌底找到一張標示『地下層 B2』的門卡。門外傳來鞋跟聲。"
      ],
      onEnter(s){addItem(s,"地下室門卡");s.flags.heardRecording=true;},
      choices:[
        {title:"帶走門卡，躲入檔案室",desc:"避開正在接近的醫生。",to:"archive",effect:{alert:-2,battery:-2}},
        {title:"立即跑向升降機",desc:"趁醫生未到，嘗試前往地下層。",to:"elevator",effect:{noise:20,alert:20,health:-4}}
      ]
    },
    surgery:{
      tag:"CHAPTER 01 · OPERATING ROOM", title:"手術室的燈", speaker:"陳醫生 · 走廊廣播",
      text:[
        "手術室嘅門半開住。白色燈光照住一張空手術床，旁邊嘅金屬盤上放著一張沾滿污漬嘅病人腕帶。",
        "牆上的白板寫著一行字：『B2 — 冷藏室 — 23:59』。",
        "身後傳來聲音：「你不應該在這裡。」白袍身影已經堵住走廊。"
      ],
      choices:[
        {title:"躲進手術床下方的陰影",desc:"有地方藏身，但醫生就在門口。",to:"surgeryHide",effect:{alert:-4,battery:-1}},
        {title:"推倒器械車，衝出另一道門",desc:"製造混亂，換取逃跑時間。",to:"chase",effect:{noise:25,alert:25,health:-8}},
        {title:"拿起腕帶，試著與醫生交談",desc:"冒險拖延時間，觀察他的反應。",to:"doctorTalk",effect:{alert:8}}
      ]
    },
    elevator:{
      tag:"CHAPTER 01 · ELEVATOR", title:"沒有樓層的按鈕", speaker:"電梯系統 · 故障",
      text:[
        "升降機門打開，裡面沒有燈。按鈕上只有 B1、B2 同一個被刮花嘅黑色按鈕。",
        "門卡讀卡器閃著紅燈。你聽到走廊遠處傳來急促腳步，醫生知道你正在逃跑。",
        "你要決定去地下室，還是先找個地方躲起來。"
      ],
      choices:[
        {title:"使用地下室門卡前往 B2",desc:"需要先取得地下室門卡。",requires:"地下室門卡",to:"basement",effect:{alert:10,battery:-4}},
        {title:"躲入升降機旁的清潔間",desc:"等追捕者經過，再找機會離開。",to:"closet",effect:{alert:-6,battery:-2}},
        {title:"撬開 B1 的維修門",desc:"可能有逃生通道，但需要鎖匙。",to:"maintenance",requires:"生鏽鎖匙",effect:{noise:10,alert:10}}
      ]
    },
    closet:{
      tag:"CHAPTER 01 · HIDING", title:"衣櫃裡的呼吸聲", speaker:"陳醫生 · 門外",
      text:[
        "你把自己塞進清潔衣櫃，關門時小心翼翼地托住門鎖。",
        "醫生嘅腳步聲停在門外。手電筒嘅光從門縫掃過地面。",
        "「我知道你還在這一層。別讓我把每個房間都找一遍。」"
      ],
      choices:[
        {title:"保持安靜，等腳步聲遠去",desc:"最安全的選擇，但不能保證成功。",to:"hidingWait",effect:{alert:-15,battery:-3}},
        {title:"打開衣櫃，衝向護士站",desc:"賭一把速度，可能立即觸發追逐。",to:"chase",effect:{noise:20,alert:18,health:-5}}
      ]
    },
    hidingWait:{
      tag:"CHAPTER 01 · HIDING", title:"他走了嗎？", speaker:"環境 · 一片死寂",
      text:[
        "你數著自己的心跳。十秒、二十秒……走廊終於安靜下來。",
        "但衣櫃門外多了一張紙條，上面用工整嘅字寫著：『下一次，我會看裡面。』",
        "你趁機離開藏身處，必須繼續尋找出口。"
      ],
      choices:[
        {title:"返回走廊，前往升降機",desc:"嘗試找到通往地下層的路。",to:"elevator",effect:{alert:5,battery:-3}},
        {title:"進入護士站搜尋物資",desc:"補充線索，也可能再遇上醫生。",to:"nurse",effect:{alert:8,battery:-2}}
      ]
    },
    archive:{
      tag:"CHAPTER 01 · ARCHIVE", title:"被刪掉的病歷", speaker:"你的發現",
      text:[
        "檔案室堆滿發霉病歷。你找到陳醫生的舊照片：十年前，他曾因病人失蹤事件接受調查，但案件最後被封存。",
        "一張手繪地圖標出地下室冷藏室，以及一條通往裝卸區的服務通道。",
        "門外有人轉動門把。你已經沒有太多時間。"
      ],
      onEnter(s){s.flags.foundMap=true;},
      choices:[
        {title:"帶著地圖前往升降機",desc:"你知道出口可能在哪裡了。",to:"elevator",effect:{alert:8,battery:-3}},
        {title:"躲在檔案櫃後面",desc:"等醫生進來後再找機會逃走。",to:"archiveHide",effect:{alert:-5,battery:-2}}
      ]
    },
    archiveHide:{
      tag:"CHAPTER 01 · HIDING", title:"檔案櫃後", speaker:"陳醫生 · 門內",
      text:[
        "門慢慢打開。醫生走進來，翻看桌上嘅紙張，像是知道你正在附近。",
        "他忽然停下：「這些病歷……有人動過。」",
        "他朝你藏身的檔案櫃走來。你必須立即作出決定。"
      ],
      choices:[
        {title:"推倒檔案櫃，衝向出口",desc:"製造混亂，趁他失去平衡時逃跑。",to:"chase",effect:{noise:28,alert:25,health:-10}},
        {title:"熄掉手電筒，從側門溜走",desc:"依靠黑暗和安靜，成功與否取決於警戒。",to:"stealthExit",effect:{battery:-10,noise:0}}
      ]
    },
    surgeryHide:{
      tag:"CHAPTER 01 · HIDING", title:"手術床底", speaker:"陳醫生 · 近在咫尺",
      text:[
        "你伏在手術床底，聞到刺鼻嘅消毒水氣味。醫生走進來，慢慢拉開金屬抽屜。",
        "「你令我很失望。病人不應該四處走動。」",
        "他把手電筒光束移向床底。"
      ],
      choices:[
        {title:"把金屬盤推向另一邊",desc:"用聲音引開他的注意。",to:"chase",effect:{noise:24,alert:15,health:-5}},
        {title:"屏住呼吸，等他轉身",desc:"若警戒過高，這個藏身處可能失效。",to:"stealthExit",effect:{battery:-3}}
      ]
    },
    doctorTalk:{
      tag:"CHAPTER 01 · ENCOUNTER", title:"醫生的問題", speaker:"陳醫生",
      text:[
        "醫生歪著頭打量你，語氣溫柔得令人發寒。",
        "「你知道嗎？人最誠實的時候，就是他以為自己快要死的時候。」",
        "他伸出戴著手套的手。你注意到他的腰間掛著一張門卡。"
      ],
      choices:[
        {title:"假裝暈倒，等他靠近",desc:"有機會偷走門卡，但非常危險。",to:"fakeOut",effect:{alert:12,health:-8}},
        {title:"轉身逃跑",desc:"不再浪費時間，立即拉開距離。",to:"chase",effect:{noise:22,alert:20,health:-5}}
      ]
    },
    fakeOut:{
      tag:"CHAPTER 01 · ENCOUNTER", title:"近在咫尺", speaker:"你 · 閉上眼睛",
      text:[
        "你倒在地上，讓呼吸變得微弱。醫生俯下身檢查你。",
        "就在他伸手的一刻，你扯下腰間的門卡，猛地推開他。",
        "你取得了地下室門卡，但他已經憤怒地追出手術室。"
      ],
      onEnter(s){addItem(s,"地下室門卡");},
      choices:[
        {title:"衝向升降機",desc:"用門卡打開通往 B2 的路。",to:"elevator",effect:{noise:20,alert:24,health:-5}}
      ]
    },
    chase:{
      tag:"CHAPTER 01 · PURSUIT", title:"他追上來了", speaker:"警告 · 急促腳步",
      text:[
        "「站住！」醫生的聲音第一次失去平靜。",
        "你聽到鞋底在地板上急促敲擊。前方有一道防火門，左邊有雜物間，右邊是沒有燈的樓梯。",
        "你只剩幾秒鐘決定。"
      ],
      choices:[
        {title:"衝過防火門",desc:"可能拉開距離，但門後未必安全。",to:"fireDoor",effect:{noise:12,alert:8,health:-8}},
        {title:"躲進雜物間並鎖門",desc:"有機會甩掉他，但門鎖不一定牢固。",to:"closet",effect:{noise:4,alert:-4,health:-3}},
        {title:"跑下黑暗樓梯",desc:"冒險進入地下區域。",to:"basement",effect:{noise:15,alert:12,health:-12}}
      ]
    },
    stealthExit:{
      tag:"CHAPTER 01 · STEALTH", title:"黑暗中的出口", speaker:"你 · 屏住呼吸",
      text:[
        "你熄掉手電筒，沿著牆壁慢慢移動。醫生的光束在你身後停留片刻，最後移向另一個房間。",
        "你成功離開手術區，但電量減少，而且你仍然不知道地下室裡有甚麼。",
        "前方的升降機門正在緩緩關上。"
      ],
      choices:[
        {title:"趕在門關上前進入升降機",desc:"你可能成功前往地下層。",to:"elevator",effect:{noise:5,alert:8}},
        {title:"沿服務走廊找另一條路",desc:"如果找到地圖，可能會有額外出口。",to:"serviceHall",effect:{battery:-2,alert:3}}
      ]
    },
    maintenance:{
      tag:"CHAPTER 01 · MAINTENANCE", title:"維修通道", speaker:"環境 · 水滴聲",
      text:[
        "鎖匙轉動時發出一聲脆響。門後是一條狹窄維修通道，牆上電線裸露，地面積著冰冷的水。",
        "你看見一個電池盒，旁邊有通往裝卸區的指示牌。",
        "但通道另一端傳來緩慢的拖行聲。"
      ],
      onEnter(s){addItem(s,"備用電池");s.battery=Math.min(100,s.battery+18);},
      choices:[
        {title:"沿通道前往裝卸區",desc:"可能找到出口，但要先通過黑暗區域。",to:"serviceHall",effect:{battery:-3,alert:6}},
        {title:"返回升降機",desc:"較直接，但可能遇上醫生。",to:"elevator",effect:{alert:8,battery:-2}}
      ]
    },
    fireDoor:{
      tag:"CHAPTER 01 · FIRE DOOR", title:"防火門另一邊", speaker:"你 · 喘不過氣",
      text:[
        "你用肩膀撞開防火門，跌進一條向下延伸的樓梯。門在身後砰地關上。",
        "你暫時甩開了醫生，但手臂被門框刮傷。牆上寫著：B2 冷藏室。",
        "樓梯下方傳來一陣不自然的敲門聲。"
      ],
      choices:[
        {title:"繼續下樓前往 B2",desc:"接近真相，也接近最危險的地方。",to:"basement",effect:{health:-5,alert:5,battery:-3}},
        {title:"躲在樓梯轉角休息",desc:"恢復一點體力，但醫生可能找到你。",to:"stairHide",effect:{alert:-5,battery:-2}}
      ]
    },
    stairHide:{
      tag:"CHAPTER 01 · STAIRWELL", title:"樓梯間的影子", speaker:"未知聲音",
      text:[
        "你靠著冰冷的牆喘氣。樓上傳來門鎖轉動聲，接著是醫生低沉的哼歌。",
        "你在牆角找到一小瓶急救噴霧，勉強處理傷口。",
        "樓梯下方有一道通往 B2 的門。"
      ],
      onEnter(s){s.health=Math.min(100,s.health+10);addItem(s,"急救噴霧");},
      choices:[
        {title:"打開 B2 的門",desc:"繼續尋找離開醫院的方法。",to:"basement",effect:{alert:5,battery:-2}},
        {title:"回到維修通道",desc:"尋找裝卸區出口。",to:"serviceHall",effect:{alert:2,battery:-2}}
      ]
    },
    serviceHall:{
      tag:"CHAPTER 01 · SERVICE HALL", title:"裝卸區通道", speaker:"廣播 · 失真",
      text:[
        "通道盡頭有一扇寫著『貨物出口』的鐵門。門旁的控制箱缺少保險絲。",
        "你聽到廣播再次響起：「陳醫生，請到 B2。你的病人正在移動。」",
        "這間醫院似乎有另一個人在監視所有人。"
      ],
      choices:[
        {title:"沿路尋找保險絲",desc:"可能需要折返危險區域。",to:"fuseSearch",effect:{alert:5,battery:-3}},
        {title:"改走地下室，找其他出口",desc:"先解開醫院的秘密。",to:"basement",effect:{alert:6,battery:-2}},
        {title:"試著直接撬開鐵門",desc:"沒有工具的話可能會發出很大聲音。",to:"doorForce",effect:{noise:18,alert:12,health:-2}}
      ]
    },
    fuseSearch:{
      tag:"CHAPTER 01 · SEARCH", title:"失蹤的保險絲", speaker:"你 · 翻找雜物",
      text:[
        "你在維修櫃找到一個空盒，盒蓋寫著『備用保險絲已移至 B2』。",
        "這不是好消息。你必須深入地下室，或者冒險在醫生的巡邏路線中尋找另一條路。",
        "遠處的腳步聲又出現了。"
      ],
      choices:[
        {title:"前往 B2 冷藏室",desc:"追查保險絲與病歷的下落。",to:"basement",effect:{alert:8,battery:-3}},
        {title:"躲進維修櫃後方",desc:"等醫生經過，再重新規劃。",to:"closet",effect:{alert:-5,battery:-2}}
      ]
    },
    doorForce:{
      tag:"CHAPTER 01 · SERVICE EXIT", title:"鐵門的回聲", speaker:"陳醫生 · 遠處",
      text:[
        "你用盡力氣拉扯鐵門，金屬發出刺耳回聲。門沒有打開。",
        "回聲在通道裡反覆迴盪。你知道醫生一定聽到了。",
        "你必須立即離開這裡。"
      ],
      choices:[
        {title:"逃往地下室",desc:"遠離通道，尋找另一個出口。",to:"basement",effect:{alert:20,noise:20,health:-5}},
        {title:"躲進側邊清潔間",desc:"趁他未到之前隱藏自己。",to:"closet",effect:{alert:3,noise:2}}
      ]
    },
    basement:{
      tag:"CHAPTER 01 · BASEMENT B2", title:"冷藏室的門", speaker:"系統 · 門卡已讀取",
      text:[
        "B2 的空氣冷得刺骨。走廊兩側的冷藏門貼著病人編號，而不是姓名。",
        "你找到一份陳醫生的私人紀錄：失蹤病人並非被轉院，他們被秘密帶到這裡。你終於明白「食人醫生」這個傳聞從何而來。",
        "前方有兩條路：一邊通往冷藏室深處，另一邊通往裝卸區。身後傳來升降機到站的提示音。"
      ],
      choices:[
        {title:"進入冷藏室深處，尋找完整病歷",desc:"危險最高，但可能揭開真相。",to:"truth",effect:{alert:15,battery:-8}},
        {title:"沿裝卸區標示尋找出口",desc:"優先逃生，可能留下未解之謎。",to:"escapeCheck",effect:{alert:8,battery:-5}},
        {title:"躲進冷藏室旁的清潔間",desc:"先避開追捕，再決定下一步。",to:"basementHide",effect:{alert:-8,battery:-2}}
      ]
    },
    basementHide:{
      tag:"CHAPTER 01 · HIDING", title:"冷藏室旁的陰影", speaker:"陳醫生 · 門外",
      text:[
        "你把自己藏進清潔間，隔著門聽見醫生的腳步聲踏入 B2。",
        "他沒有立刻追來，只是慢慢說：「你已經走到這裡了。你真的想知道裡面有甚麼嗎？」",
        "門外的腳步聲停住。你可以繼續藏，或者趁他走向另一端時離開。"
      ],
      choices:[
        {title:"保持安靜，等他走遠",desc:"警戒較低時有機會避過搜索。",to:"basementWait",effect:{alert:-10,battery:-3}},
        {title:"趁他轉身，跑向裝卸區",desc:"立即嘗試逃生。",to:"escapeCheck",effect:{noise:14,alert:14,health:-5}}
      ]
    },
    basementWait:{
      tag:"CHAPTER 01 · BASEMENT B2", title:"他在唱歌", speaker:"你 · 門縫之外",
      text:[
        "醫生在外面哼著一首兒歌，聲音逐漸遠去。你聽見另一道門被打開。",
        "清潔間的架子上有一個小型急救包。你整理呼吸，準備作最後決定。",
        "你可以查明真相，也可以趁現在離開。"
      ],
      onEnter(s){s.health=Math.min(100,s.health+8);addItem(s,"急救包");},
      choices:[
        {title:"進入冷藏室深處",desc:"找出完整病歷，揭開醫生的秘密。",to:"truth",effect:{alert:8,battery:-5}},
        {title:"沿裝卸區路線逃走",desc:"把活下去放在第一位。",to:"escapeCheck",effect:{alert:4,battery:-3}}
      ]
    },
    truth:{
      tag:"CHAPTER 01 · THE TRUTH", title:"最後一份病歷", speaker:"錄音 · 陳醫生",
      text:[
        "你找到完整病歷和一台仍在錄音的舊設備。陳醫生的聲音從喇叭傳出：",
        "「人們以為我是怪物。但這間醫院裡，所有人都知道病人被送去哪裡。他們只需要一個人替他們動手。」",
        "你聽見門外的腳步聲越來越近。手上有足夠證據，但逃生通道就在另一邊。"
      ],
      onEnter(s){s.flags.hasEvidence=true;addItem(s,"陳醫生的錄音");},
      choices:[
        {title:"帶著證據衝向出口",desc:"可能揭露整間醫院的秘密。",to:"truthEnding",effect:{noise:16,alert:18,health:-5}},
        {title:"放棄證據，立即逃走",desc:"先活下來，將真相留在黑暗裡。",to:"escapeCheck",effect:{alert:5,battery:-2}}
      ]
    },
    escapeCheck:{
      tag:"CHAPTER 01 · FINAL CHOICE", title:"最後的出口", speaker:"你 · 天快亮了",
      text:[
        "裝卸區的鐵門就在眼前。外面傳來雨聲，門鎖卻需要一張有效門卡或一把合適的工具。",
        "醫生的腳步聲在你身後響起。你只有一次機會。",
        "你會用找到的線索開門，還是冒險繞回維修通道？"
      ],
      choices:[
        {title:"使用地下室門卡開啟側門",desc:"如果你已取得門卡，這是最直接的路。",to:"escapeEnding",requires:"地下室門卡",effect:{alert:5}},
        {title:"沿維修通道尋找另一出口",desc:"較慢，但可能避開正面衝突。",to:"serviceEnding",effect:{alert:8,battery:-3}},
        {title:"轉身拖延醫生，搶時間破門",desc:"高風險選擇，可能付出代價。",to:"lastStand",effect:{noise:20,alert:25,health:-12}}
      ]
    },
    lastStand:{
      tag:"CHAPTER 01 · LAST CHANCE", title:"不要回頭", speaker:"陳醫生",
      text:[
        "你把金屬推車撞向醫生，趁他踉蹌時撲向鐵門。",
        "門鎖只轉動了一半。醫生抓住你的外套，冷冷地說：「我還沒替你完成檢查。」",
        "你必須作最後一次選擇。"
      ],
      choices:[
        {title:"掙脫外套，衝進雨中",desc:"放棄外套及部分物品，換取逃跑機會。",to:"escapeEnding",effect:{health:-15,alert:10}},
        {title:"用錄音證據分散他的注意",desc:"只有找到陳醫生的錄音才有效。",to:"truthEnding",requires:"陳醫生的錄音",effect:{health:-5,alert:-10}},
        {title:"放棄抵抗",desc:"你已經沒有力氣繼續逃跑。",to:"caughtEnding",effect:{}}
      ]
    },
    escapeEnding:{
      tag:"ENDING · ESCAPED", title:"結局：逃出禁區", speaker:"結局 · 清晨 05:12",
      text:["鐵門終於打開。你跌進雨中，身後的醫院警報聲越來越遠。","你活下來了，但你不知道醫院是否真的只有一個食人醫生。"],
      ending:"escape", choices:[]
    },
    serviceEnding:{
      tag:"ENDING · UNKNOWN", title:"結局：另一條走廊", speaker:"結局 · 無人接聽",
      text:["你沿維修通道走了很久，最後來到一扇沒有標示的門。門外不是街道，而是另一條同樣熟悉的醫院走廊。","廣播再次響起：「最後一位病人，請返回病房。」你開始懷疑，自己是否真的離開過。"],
      ending:"loop", choices:[]
    },
    truthEnding:{
      tag:"ENDING · THE EVIDENCE", title:"結局：真相曝光", speaker:"結局 · 新聞快訊",
      text:["你帶著錄音與病歷衝出醫院。幾天後，警方封鎖了整棟建築，案件震動全城。","但錄音最後多出一句你從未聽過的低語：「你帶走的，只是其中一份病歷。」"],
      ending:"truth", choices:[]
    },
    caughtEnding:{
      tag:"ENDING · CAUGHT", title:"結局：留院觀察", speaker:"陳醫生",
      text:["你再也跑不動了。醫生替你整理衣領，像一位真正關心病人的醫生。","「休息吧。明天，我們再做一次檢查。」","燈光熄滅。你的病歷被放進一個沒有姓名的抽屜。"],
      ending:"caught", choices:[]
    },
    deadEnding:{
      tag:"ENDING · GAME OVER", title:"結局：最後的病人", speaker:"系統 · 生命體徵停止",
      text:["你的視線逐漸模糊，走廊的燈變成一片白色。醫生的聲音像從很遠的地方傳來。","「別擔心，病人。你很快就不會再感到害怕。」"],
      ending:"dead", choices:[]
    }
  };

  function addItem(s,item){ if(!s.inventory.includes(item)) s.inventory.push(item); }
  function hasItem(item){ return state.inventory.includes(item); }
  let scareTimers = [];
  let audioCtx = null;
  function soundEffect(kind){
    if(!state.sound) return;
    try {
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC) return;
      if(!audioCtx) audioCtx=new AC();
      if(audioCtx.state==="suspended") audioCtx.resume();
      const now=audioCtx.currentTime, osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      if(kind==="heartbeat"){osc.type="sine";osc.frequency.setValueAtTime(58,now);osc.frequency.exponentialRampToValueAtTime(38,now+.18);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.18,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+.24);osc.start(now);osc.stop(now+.25);}
      else if(kind==="sting"){osc.type="sawtooth";osc.frequency.setValueAtTime(240,now);osc.frequency.exponentialRampToValueAtTime(52,now+.42);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.16,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+.48);osc.start(now);osc.stop(now+.5);}
      else {osc.type="square";osc.frequency.setValueAtTime(110,now);osc.frequency.setValueAtTime(72,now+.08);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.07,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+.16);osc.start(now);osc.stop(now+.18);}
    } catch(e) {}
  }
  function pulse(id,duration=900){const el=$(id);if(!el)return;el.classList.remove("fire");void el.offsetWidth;el.classList.add("fire");scareTimers.push(setTimeout(()=>el.classList.remove("fire"),duration));}
  function triggerCCTV(){pulse("cctvNoise",900);pulse("horrorFlash",500);soundEffect("static");}
  function triggerPhotoJump(){const el=$("jumpScare");el.classList.remove("fire");void el.offsetWidth;el.classList.add("fire");triggerCCTV();soundEffect("sting");scareTimers.push(setTimeout(()=>el.classList.remove("fire"),1500));}
  function showToast(message){
    $("toast").textContent=message; $("toast").classList.remove("hidden");
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>$("toast").classList.add("hidden"),2200);
  }
  function save(silent=false){
    try { localStorage.setItem(SAVE_KEY,JSON.stringify(state)); if(!silent)showToast("進度已儲存"); }
    catch(e){ if(!silent)showToast("此瀏覽器無法儲存進度"); }
  }
  function load(){
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      if(raw){ const parsed=JSON.parse(raw); if(parsed && parsed.node && scenes[parsed.node]) state={...initial(),...parsed}; }
    }catch(e){ state=initial(); }
  }
  const visualEvents = {
    drawer:{image:"./assets/clue-tools.jpg",label:"FOUND EVIDENCE",title:"手術器械上的痕跡",description:"金屬盤上有未乾透的暗色痕跡。最奇怪的是，每件器械都被整齊地排好，像是有人剛剛完成一場手術。"},
    nurse:{image:"./assets/clue-sister.jpg",label:"RECOVERED IMAGE",title:"妹妹最後傳來的照片",description:"照片的拍攝時間，比醫院聲稱她失蹤的日期早了三個月。照片背後寫著：『如果他說你已經來過，不要相信。』"},
    surgery:{image:"./assets/clue-record.jpg",label:"CLASSIFIED RECORD",title:"被刪去的病人紀錄",description:"病歷上有一欄被反覆刮掉。底下仍看得出一行字：『轉送 B2 冷藏室』。最底部還有一個與你相同的姓氏。"},
    archive:{image:"./assets/clue-record.jpg",label:"ARCHIVE EVIDENCE",title:"第 38 位病人",description:"名冊裡三十七個名字被劃掉，最後一格卻已經填上你的資料。入院時間：十一年前。"},
    basement:{image:"./assets/clue-warning.jpg",label:"WARNING",title:"牆上的警告",description:"有人用顫抖的字跡寫下：『如果你聽到家人的聲音，先看監視器。這裡會學你最想聽見的聲音。』"},
    chase:{image:"./assets/doctor-photo.jpg",label:"SUDDEN EVENT · SIGNAL LOST",title:"照片裡多了一個人",description:"你剛拍下走廊照片，畫面便出現一陣監視器雜訊。照片最深處多了一個穿白袍的人影。你放大照片——那張臉，正對著鏡頭。你回頭時，走廊空無一人。"},
    truth:{image:"./assets/clue-warning.jpg",label:"TRUTH REVEALED",title:"最後一條訊息",description:"牆上的字不是寫給上一個病人的。字跡與你妹妹的筆跡一模一樣，日期卻是明天。"},
    caughtEnding:{image:"./assets/clue-tools.jpg",label:"YOU WERE FOUND",title:"手術準備開始",description:"燈光亮起。陳醫生沒有生氣，只是翻開病歷，平靜地說：『你終於回到自己的床位了。』"},
    deadEnding:{image:"./assets/clue-sister.jpg",label:"SIGNAL LOST",title:"最後一張照片",description:"手機螢幕亮了一次。妹妹傳來一張新照片，照片裡的人穿著你的衣服，躺在一張你從未見過的病床上。"}
  };
  function showVisualEvent(node){
    const event=visualEvents[node];
    if(!event || state.flags["visual_seen_"+node]) return;
    state.flags["visual_seen_"+node]=true;
    $("eventImage").src=event.image;
    $("eventImage").alt=event.title;
    $("eventLabel").textContent=event.label;
    $("eventTitle").textContent=event.title;
    $("eventDescription").textContent=event.description;
    $("imageEvent").classList.remove("hidden");
    if(node==="chase") triggerCCTV();
    save(true);
  }
  function closeVisualEvent(){ $("imageEvent").classList.add("hidden"); }
  $("eventClose").addEventListener("click",closeVisualEvent);
  $("imageEvent").addEventListener("click",e=>{if(e.target===$("imageEvent"))closeVisualEvent();});

  function render(){
    const scene=scenes[state.node];
    $("sceneTag").textContent=scene.tag || "MIDNIGHT QUARANTINE";
    $("sceneTitle").textContent=scene.title;
    $("speaker").textContent=scene.speaker || "你 · 未知時間";
    $("storyTitle").textContent=scene.title;
    $("storyText").innerHTML="";
    (scene.text||[]).forEach(line=>{const p=document.createElement("p");p.textContent=line;$("storyText").appendChild(p);});
    $("healthText").textContent=state.health+"%";
    $("healthBar").style.width=state.health+"%";
    $("alertText").textContent=state.alert<25?"低":state.alert<60?"中":"極高";
    $("alertBar").style.width=state.alert+"%";
    $("batteryText").textContent=state.battery+"%";
    $("batteryBar").style.width=state.battery+"%";
    $("inventory").innerHTML="物品："+(state.inventory.length?state.inventory.map(escapeHtml).join("、"):"空手")+"。<br>提示：選擇會影響醫生警戒、生命及可走的路線。";
    $("choices").innerHTML="";
    const isEnding=!!scene.ending;
    $("ending").classList.toggle("hidden",!isEnding);
    $("choices").classList.toggle("hidden",isEnding);
    if(isEnding){
      const endingTitles={escape:"逃出生天：你活著離開，但妹妹的下落仍成謎。",loop:"循環結局：醫院似乎不允許任何人真正離開。",truth:"真相結局：你帶出證據，揭開醫院共犯的秘密。",caught:"被捕結局：你成為陳醫生下一份病人紀錄。",dead:"死亡結局：這次逃生失敗。重新開始並嘗試不同路線。 "};
      $("endingTitle").textContent=endingTitles[scene.ending]||"故事結束";
      $("endingText").textContent=scene.text.join("\n\n");
      $("restartBtn").textContent="重新開始故事";
    } else {
      scene.choices.forEach((choice,i)=>{
        const btn=document.createElement("button");btn.className="choice";
        const locked=choice.requires&&!hasItem(choice.requires);
        btn.innerHTML=`<span class="key">${String.fromCharCode(65+i)}</span><span><strong>${escapeHtml(choice.title)}${locked?" 🔒":""}</strong><small>${escapeHtml(locked?"需要物品："+choice.requires:choice.desc)}</small></span>`;
        btn.addEventListener("click",()=>choose(choice,locked));
        $("choices").appendChild(btn);
      });
    }
    $("soundBtn").textContent=state.sound?"♫ 音效開":"♫ 音效關";
    save(true);
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function choose(choice,locked){
    if(locked){showToast("你需要先找到："+choice.requires);return;}
    const oldNode=state.node;
    const e=choice.effect||{};
    state.health=clamp(state.health+(e.health||0),0,100);
    state.alert=clamp(state.alert+(e.alert||0)+(state.noise>15?3:0),0,100);
    state.battery=clamp(state.battery+(e.battery||0),0,100);
    state.noise=clamp(state.noise+(e.noise||0)-3,0,100);
    state.steps++;
    state.flags[oldNode+"_visited"]=true;
    if(state.health<=0){state.node="deadEnding";state.ending="dead";render();return;}
    if(state.alert>=90 && !["chase","caughtEnding","deadEnding"].includes(choice.to) && state.steps>2){
      state.node="chase";state.alert=70;state.health=clamp(state.health-5,0,100);
      showToast("腳步聲突然加快！醫生發現你了。");
    } else {
      state.node=choice.to;
    }
    const next=scenes[state.node];
    if(next && typeof next.onEnter==="function" && !state.flags[state.node+"_entered"]){
      next.onEnter(state);state.flags[state.node+"_entered"]=true;
    }
    if(state.health<=0)state.node="deadEnding";
    render();
    if(state.node!==oldNode) {
      if(state.node==="chase") { triggerPhotoJump(); soundEffect("heartbeat"); }
      else if(["corridor","surgery","basement","archive"].includes(state.node) && Math.random()<0.62) triggerCCTV();
      showVisualEvent(state.node);
    }
  }
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function reset(){
    if(!confirm("確定重置故事？目前進度將會清除。"))return;
    state=initial();localStorage.removeItem(SAVE_KEY);enterScene("wake");showToast("故事已重置");
  }
  function enterScene(node){
    state.node=node;
    const scene=scenes[node];
    if(scene && typeof scene.onEnter==="function" && !state.flags[node+"_entered"]){
      scene.onEnter(state);state.flags[node+"_entered"]=true;
    }
    render();
  }
  const introScreen = $("introScreen");
  $("startGameBtn").addEventListener("click",()=>{
    introScreen.classList.add("hidden");
    document.body.classList.remove("intro-active");
    showToast("門已鎖上。你只能向前走。");
  });
  $("saveBtn").addEventListener("click",()=>save(false));
  $("resetBtn").addEventListener("click",reset);
  $("restartBtn").addEventListener("click",()=>{state=initial();enterScene("wake");showToast("新故事開始");});
  $("soundBtn").addEventListener("click",()=>{
    state.sound=!state.sound;
    if(state.sound){soundEffect("static");showToast("恐怖音效已開啟：雜訊、低頻心跳與驚嚇音");}else showToast("恐怖音效已關閉");
    render();
  });
  load();
  if(!scenes[state.node])state=initial();
  if(state.node==="wake" && !state.flags.wake_entered){state.flags.wake_entered=true;}
  render();
})();