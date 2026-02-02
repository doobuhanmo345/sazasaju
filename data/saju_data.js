// data/saju_data.js

export const HANJA_MAP = {
  甲: '갑',
  乙: '을',
  丙: '병',
  丁: '정',
  戊: '무',
  己: '기',
  庚: '경',
  辛: '신',
  壬: '임',
  癸: '계',
  子: '자',
  丑: '축',
  寅: '인',
  卯: '묘',
  辰: '진',
  巳: '사',
  午: '오',
  未: '미',
  申: '신',
  酉: '유',
  戌: '술',
  亥: '해',
};

export const ENG_MAP = {
  갑: 'Gap',
  을: 'Eul',
  병: 'Byeong',
  정: 'Jeong',
  무: 'Mu',
  기: 'Gi',
  경: 'Gyeong',
  신: 'Sin',
  임: 'Im',
  계: 'Gye',
  자: 'Ja',
  축: 'Chuck',
  인: 'In',
  묘: 'Myo',
  진: 'Jin',
  사: 'Sa',
  오: 'O',
  미: 'Mi',
  신: 'Shin',
  유: 'You',
  술: 'Sul',
  해: 'Hae',
};

export const OHAENG_MAP = {
  갑: 'wood',
  을: 'wood',
  인: 'wood',
  묘: 'wood',
  병: 'fire',
  정: 'fire',
  사: 'fire',
  오: 'fire',
  무: 'earth',
  기: 'earth',
  진: 'earth',
  술: 'earth',
  축: 'earth',
  미: 'earth',
  경: 'metal',
  신: 'metal',
  유: 'metal',
  임: 'water',
  계: 'water',
  해: 'water',
  자: 'water',
};

export const UI_TEXT = {
  year: { ko: '년주', en: 'YEAR' },
  month: { ko: '월주', en: 'MONTH' },
  day: { ko: '일주', en: 'DAY' },
  hour: { ko: '시주', en: 'TIME' },
};

/* ==========================================================================
   [수정됨] 모든 키와 값을 '한글'로 통일 (saju 객체가 한글이므로)
   ========================================================================== */

// 1. 천을귀인 (일간 -> 지지)
export const GUIN_MAP = {
  '갑': ['축', '미'], '무': ['축', '미'], '경': ['축', '미'],
  '을': ['자', '신'], '기': ['자', '신'],
  '병': ['해', '유'], '정': ['해', '유'],
  '신': ['인', '오'],
  '임': ['사', '묘'], '계': ['사', '묘']
};

// 2. 양인살 (일간 -> 지지)
export const YANGIN_MAP = {
  '갑': '묘', '경': '유', '임': '자', '병': '오', '무': '오'
};

// 3. 원진살 (지지 <-> 지지)
export const WONJIN_PAIRS = {
  '자': '미', '축': '오', '인': '유', '묘': '신', '진': '해', '사': '술',
  '오': '축', '미': '자', '신': '묘', '유': '인', '술': '사', '해': '진'
};

// 4. 낙정관살 (일간 -> 지지)
export const NAKJEONG_MAP = {
  '갑': '사', '기': '사',
  '을': '자', '경': '자',
  '병': '신', '신': '신',
  '정': '술', '임': '술',
  '무': '묘', '계': '묘'
};

// 5. 삼재 (년지 -> 지지 3개)
export const SAMJAE_MAP = {
  '신': ['인', '묘', '진'], '자': ['인', '묘', '진'], '진': ['인', '묘', '진'],
  '인': ['신', '유', '술'], '오': ['신', '유', '술'], '술': ['신', '유', '술'],
  '해': ['사', '오', '미'], '묘': ['사', '오', '미'], '미': ['사', '오', '미'],
  '사': ['해', '자', '축'], '유': ['해', '자', '축'], '축': ['해', '자', '축'],
};

// 6. 삼합 12신살 (삼합 기준 -> 지지들)
export const SAMHAP_MAP = {
  '신': ['수', '인', '유', '진', '해', '미', '묘', '사'],
  '자': ['수', '인', '유', '진', '해', '미', '묘', '사'],
  '진': ['수', '인', '유', '진', '해', '미', '묘', '사'],
  '인': ['화', '신', '묘', '술', '사', '축', '유', '해'],
  '오': ['화', '신', '묘', '술', '사', '축', '유', '해'],
  '술': ['화', '신', '묘', '술', '사', '축', '유', '해'],

  '사': ['금', '해', '오', '축', '신', '술', '자', '인'],
  '유': ['금', '해', '오', '축', '신', '술', '자', '인'],
  '축': ['금', '해', '오', '축', '신', '술', '자', '인'],

  '해': ['목', '사', '자', '미', '인', '술', '오', '신'],
  '묘': ['목', '사', '자', '미', '인', '술', '오', '신'],
  '미': ['목', '사', '자', '미', '인', '술', '오', '신'],
};
export const LISTS = {
  baekho: ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'],
  goegang: ['경진', '임진', '무술', '경술'],
};

export const GWIN_MAP = {
  갑: ['축', '미'],
  무: ['축', '미'],
  경: ['축', '미'],
  을: ['자', '신'],
  기: ['자', '신'],
  병: ['해', '유'],
  정: ['해', '유'],
  신: ['인', '오'],
  임: ['사', '묘'],
  계: ['사', '묘'],
};
export const NOBLE_DESCRIPTIONS = {
  year: {
    ko: '조상자리(년지)에 귀인이 있어, 가문이 좋거나 초년운에 윗사람의 혜택을 입을 수 있습니다. 조상의 음덕이 나를 지켜주는 형국입니다.',
    en: 'Noble Star in the Year Pillar suggests ancestral blessings or support from elders in early life. You have a protective lineage.',
  },
  month: {
    ko: '사회자리(월지)에 귀인이 있어, 부모 형제나 직장 동료, 친구 등 주변 사람들의 도움을 많이 받습니다. 인복이 좋아 위기를 기회로 만듭니다.',
    en: 'Noble Star in the Month Pillar indicates strong support from family, peers, and society. Your social network helps turn crises into opportunities.',
  },
  day: {
    ko: "배우자자리(일지)에 귀인이 있어 '일귀'라 부릅니다. 배우자 복이 있고, 본인 스스로도 지혜로우며 재난을 피하는 천우신조가 따릅니다.",
    en: 'Noble Star in the Day Pillar (Il-Gwi) signifies good spouse luck and personal wisdom. You are naturally protected from disasters.',
  },
  time: {
    ko: '자식자리(시지)에 귀인이 있어, 자녀가 현달하고 효도하며 말년운이 편안합니다. 남들이 모르는 숨겨진 조력자가 있을 수 있습니다.',
    en: 'Noble Star in the Hour Pillar suggests successful children and a peaceful late life. You may have hidden helpers.',
  },
};
export const GONGMANG_DESCRIPTIONS = {
  year: {
    ko: '년지(조상/초년)가 공망입니다. 조상의 덕을 기대하기 어렵거나, 어린 시절 고향을 떠나 타향에서 자수성가해야 하는 운입니다.',
    en: 'Gongmang in the Year Pillar suggests receiving little help from ancestors or leaving home early to succeed on your own.',
  },
  month: {
    ko: '월지(부모형제/사회)가 공망입니다. 부모 형제와 인연이 엷거나 도움을 받기 힘들 수 있습니다. 조직 생활보다는 전문 기술이나 독립적인 직업이 유리합니다.',
    en: 'Gongmang in the Month Pillar implies weak ties with family or career instability. Independent work or specialized skills are recommended.',
  },
  time: {
    ko: '시지(자녀/말년)가 공망입니다. 자녀와의 인연이 멀어지거나 말년에 고독감을 느낄 수 있습니다. 현실적 욕심보다 정신적, 종교적 가치를 추구하면 마음의 평화를 얻습니다.',
    en: 'Gongmang in the Hour Pillar suggests distance from children or loneliness in late life. Pursuing spiritual values brings peace.',
  },
};

export const RELATION_RULES = {
  자축: {
    ko: {
      type: '육합',
      name: '자축합(土)',
      desc: '믿음직하고 끈끈한 결속력을 가집니다.',
    },
    en: {
      type: 'Harmony',
      name: 'Ja-Chuk Harmony (Earth)',
      desc: 'A bond of deep trust and strong cohesion.',
    },
  },
  인해: {
    ko: {
      type: '육합',
      name: '인해합(木)',
      desc: '먼저 베풀고 화합하는 따뜻한 기운이 있습니다.',
    },
    en: {
      type: 'Harmony',
      name: 'In-Hae Harmony (Wood)',
      desc: 'Warm energy formed by generosity and unity.',
    },
  },
  묘술: {
    ko: {
      type: '육합',
      name: '묘술합(火)',
      desc: '예술적 감각과 뜨거운 열정이 결합된 형태입니다.',
    },
    en: {
      type: 'Harmony',
      name: 'Myo-Sul Harmony (Fire)',
      desc: 'A fusion of artistic sense and burning passion.',
    },
  },
  진유: {
    ko: {
      type: '육합',
      name: '진유합(金)',
      desc: '의리와 원칙을 중요시하며 맺고 끊음이 확실합니다.',
    },
    en: {
      type: 'Harmony',
      name: 'Jin-Yu Harmony (Metal)',
      desc: 'Values loyalty and principles with clear boundaries.',
    },
  },
  사신: {
    ko: {
      type: '육합',
      name: '사신합(水)',
      desc: '현실적인 지혜와 변화를 추구하는 성향이 강합니다.',
    },
    en: {
      type: 'Harmony',
      name: 'Sa-Shin Harmony (Water)',
      desc: 'Pursues practical wisdom and dynamic change.',
    },
  },
  오미: {
    ko: {
      type: '육합',
      name: '오미합(火)',
      desc: '화려함 속에 실속을 챙기는 조화로움이 있습니다.',
    },
    en: {
      type: 'Harmony',
      name: 'O-Mi Harmony (Fire)',
      desc: 'Harmony that seeks substance amidst brilliance.',
    },
  },
  자오: {
    ko: {
      type: '육충',
      name: '자오충',
      desc: '물과 불이 만나 강한 에너지와 역동적인 변화를 만듭니다.',
    },
    en: {
      type: 'Clash',
      name: 'Ja-O Clash',
      desc: 'Water and Fire collide, creating intense energy and dynamic change.',
    },
  },
  축미: {
    ko: {
      type: '육충',
      name: '축미충',
      desc: '끈기와 고집이 부딪히니 형제나 지인 간의 갈등을 조심해야 합니다.',
    },
    en: {
      type: 'Clash',
      name: 'Chuk-Mi Clash',
      desc: 'A clash of stubbornness; be mindful of conflicts in close relationships.',
    },
  },
  인신: {
    ko: {
      type: '육충',
      name: '인신충',
      desc: '시작과 끝이 부딪히는 형상이라 이동수가 많고 매우 바쁩니다.',
    },
    en: {
      type: 'Clash',
      name: 'In-Shin Clash',
      desc: 'Beginnings and endings clash, leading to a busy life with frequent movement.',
    },
  },
  묘유: {
    ko: {
      type: '육충',
      name: '묘유충',
      desc: '환경의 변화가 잦고 예민해질 수 있으니 마음을 잘 다스려야 합니다.',
    },
    en: {
      type: 'Clash',
      name: 'Myo-Yu Clash',
      desc: 'Frequent environmental changes and sensitivity; requires emotional mind control.',
    },
  },
  진술: {
    ko: {
      type: '육충',
      name: '진술충',
      desc: '고독할 수 있으나 투쟁심과 개성이 매우 강하여 리더가 되기도 합니다.',
    },
    en: {
      type: 'Clash',
      name: 'Jin-Sul Clash',
      desc: 'Can be solitary but possesses a strong fighting spirit and unique leadership qualities.',
    },
  },
  사해: {
    ko: {
      type: '육충',
      name: '사해충',
      desc: '쓸데없는 잡념이 많을 수 있으나 해외나 원거리 이동을 통해 해소됩니다.',
    },
    en: {
      type: 'Clash',
      name: 'Sa-Hae Clash',
      desc: 'Mental restlessness, often resolved through travel or moving far away.',
    },
  },
  갑기: {
    ko: {
      type: '합',
      name: '갑기합(土)',
      desc: '중정지합(中正之合): 분수에 맞게 행동하며 타인의 신뢰를 얻습니다.',
    },
    en: {
      type: 'Harmony',
      name: 'Gap-Gi Harmony (Earth)',
      desc: 'Harmony of Honor: Gains trust by acting with propriety and integrity.',
    },
  },
  을경: {
    ko: {
      type: '합',
      name: '을경합(金)',
      desc: '인의지합(仁義지合): 강단이 있고 의리를 중요하게 생각합니다.',
    },
    en: {
      type: 'Harmony',
      name: 'Eul-Gyeong Harmony (Metal)',
      desc: 'Harmony of Righteousness: Values loyalty and decisive action.',
    },
  },
  병신: {
    ko: {
      type: '합',
      name: '병신합(水)',
      desc: '위제지합(威制之合): 겉은 화려하나 속은 냉철하고 지혜롭습니다.',
    },
    en: {
      type: 'Harmony',
      name: 'Byeong-Sin Harmony (Water)',
      desc: 'Harmony of Authority: Brilliant on the outside, cool and wise on the inside.',
    },
  },
  정임: {
    ko: {
      type: '합',
      name: '정임합(木)',
      desc: '인수지합(仁壽之合): 감수성이 풍부하고 다정다감하여 인기가 많습니다.',
    },
    en: {
      type: 'Harmony',
      name: 'Jeong-Im Harmony (Wood)',
      desc: 'Harmony of Benevolence: Sensitive and affectionate, often popular with others.',
    },
  },
  무계: {
    ko: {
      type: '합',
      name: '무계합(火)',
      desc: '무정지합(無情之合): 두뇌 회전이 빠르고 외모나 겉모습에 신경을 씁니다.',
    },
    en: {
      type: 'Harmony',
      name: 'Mu-Gye Harmony (Fire)',
      desc: 'Harmony of Pragmatism: Quick-witted and attentive to appearances.',
    },
  },
  갑경: {
    ko: {
      type: '충',
      name: '갑경충',
      desc: '새로운 시작과 결실이 부딪히니 두통이나 신경성 질환을 주의해야 합니다.',
    },
    en: {
      type: 'Clash',
      name: 'Gap-Gyeong Clash',
      desc: 'Clash of Start and Finish: Be mindful of stress-related headaches or nerve issues.',
    },
  },
  을신: {
    ko: {
      type: '충',
      name: '을신충',
      desc: '날카로운 칼이 꽃을 베는 형국이라 예민하고 주변 관계가 끊어질 수 있습니다.',
    },
    en: {
      type: 'Clash',
      name: 'Eul-Sin Clash',
      desc: 'Scissors cutting a flower: High sensitivity and potential severing of relationships.',
    },
  },
  병임: {
    ko: {
      type: '충',
      name: '병임충',
      desc: '태양과 강물이 만나니 수화상전(水火相戰)으로 감정 기복이 심할 수 있습니다.',
    },
    en: {
      type: 'Clash',
      name: 'Byeong-Im Clash',
      desc: 'Fire and Water battle: Likely to experience intense emotional mood swings.',
    },
  },
  정계: {
    ko: {
      type: '충',
      name: '정계충',
      desc: '촛불이 비를 만난 격이라 내면의 갈등과 심리적 불안을 겪기 쉽습니다.',
    },
    en: {
      type: 'Clash',
      name: 'Jeong-Gye Clash',
      desc: 'Candle meeting Rain: Prone to internal conflict and psychological anxiety.',
    },
  },
};

export const SHIP_SUNG_TABLE = {
  갑: {
    갑: '비견',을: '겁재',병: '식신',정: '상관',무: '편재',기: '정재',경: '편관',신: '정관',임: '편인',계: '정인',
  },
  을: {
    을: '비견',갑: '겁재',정: '식신',병: '상관',기: '편재',무: '정재',신: '편관',경: '정관',계: '편인',임: '정인',
  },
  병: {
    병: '비견',정: '겁재',무: '식신',기: '상관',경: '편재',신: '정재',임: '편관',계: '정관',갑: '편인',을: '정인',
  },
  정: {
    정: '비견',병: '겁재',기: '식신',무: '상관',신: '편재',경: '정재',계: '편관',임: '정관',을: '편인',갑: '정인',
  },
  무: {
    무: '비견',기: '겁재',경: '식신',신: '상관',임: '편재',계: '정재',갑: '편관',을: '정관',병: '편인',정: '정인',
  },
  기: {
    기: '비견',무: '겁재',신: '식신',경: '상관',계: '편재',임: '정재',을: '편관',갑: '정관',정: '편인',병: '정인',
  },
  경: {
    경: '비견',신: '겁재',임: '식신',계: '상관',갑: '편재',을: '정재',병: '편관',정: '정관',무: '편인',기: '정인',
  },
  신: {
    신: '비견',경: '겁재',계: '식신',임: '상관',을: '편재',갑: '정재',정: '편관',병: '정관',기: '편인',무: '정인',
  },
  임: {
    임: '비견',계: '겁재',갑: '식신',을: '상관',병: '편재',정: '정재',무: '편관',기: '정관',경: '편인',신: '정인',
  },
  계: {
    계: '비견',임: '겁재',을: '식신',갑: '상관',정: '편재',병: '정재',기: '편관',무: '정관',신: '편인',경: '정인',
  },
};

export const SHIP_SUNG_MAP = {
  비견: { ko: '주체성과 자립', en: 'Independence' },
  겁재: { ko: '경쟁과 사회적 변동', en: 'Competition' },
  식신: { ko: '창의력과 풍요', en: 'Creativity' },
  상관: { ko: '혁신과 도전', en: 'Innovation' },
  편재: { ko: '재물 확장과 모험', en: 'Wealth Expansion' },
  정재: { ko: '안정적 결실과 성실', en: 'Stability' },
  편관: { ko: '책임감과 권위', en: 'Discipline' },
  정관: { ko: '명예와 사회적 인정', en: 'Honor' },
  편인: { ko: '특수 기술과 통찰', en: 'Intuition' },
  정인: { ko: '지원과 학문적 성취', en: 'Support' },
};

export const PILLAR_DETAILS = {
  갑자: {
    ko: '차가운 물을 머금고 겨울을 견디는 나무입니다. 성장은 더디나 지혜가 깊어지는 10년입니다.',
    en: 'A tree in winter water. Internal growth is prioritized over visible results.',
  },
  을축: {
    ko: '얼어붙은 땅에서 인내하는 풀의 모습입니다. 끈기와 인내로 척박한 환경을 이겨내고 성공합니다.',
    en: 'Grass on frozen earth. Perseverance leads to breaking through social obstacles.',
  },
  병인: {
    ko: '봄 숲 위로 떠오르는 태양입니다. 역동적인 시작과 확장의 기운이 넘치는 매우 화려한 시기입니다.',
    en: 'Sun rising over a forest. A dynamic decade of expansion and new beginnings.',
  },
  정묘: {
    ko: '나무 정자 안을 비추는 따스한 등불입니다. 세심한 감각으로 실속을 챙기며 명예를 쌓는 10년입니다.',
    en: 'A warm lamp in a pavilion. Delicate talents lead to steady progress and honor.',
  },
  무진: {
    ko: '호수를 품은 산의 형상입니다. 포용력이 넓어지고 사회적 신뢰를 바탕으로 큰 책임을 맡게 됩니다.',
    en: 'A mountain holding a lake. You gain great trust and take on heavy responsibilities.',
  },
  기사: {
    ko: '햇살 받은 비옥한 땅입니다. 노력해온 일들이 성과로 이어지며 경제적 풍요를 누리는 시기입니다.',
    en: 'Golden earth warmed by sun. Past efforts turn into tangible financial results.',
  },
  경오: {
    ko: '불길 속을 달리는 백마의 기상입니다. 강직한 의지로 어려운 과업을 성공시켜 권위를 얻게 됩니다.',
    en: 'A horse running through fire. Overcoming challenges brings you immense authority.',
  },
  신미: {
    ko: '사막 속 보석을 제련하는 과정입니다. 고된 환경을 거쳐 독보적인 전문성을 갖춘 인재가 됩니다.',
    en: 'Refining jewelry in a desert. This process turns you into a highly valuable expert.',
  },
  임신: {
    ko: '바위 사이 흐르는 강물처럼 지혜가 깊습니다. 환경 적응력이 뛰어나며 활동 범위를 넓히는 시기입니다.',
    en: 'Deep river over rocks. You will use new knowledge to expand your reach globally.',
  },
  계유: {
    ko: '맑은 샘물처럼 통찰력이 날카로워집니다. 전문 분야에서 독보적 성과를 거두며 삶의 질이 높아집니다.',
    en: 'Clear water from a cave. Your intuition becomes sharp, leading to professional success.',
  },
  갑술: {
    ko: '언덕 위 홀로 선 거목입니다. 독립심이 강해지며 본인만의 확고한 가치관을 세우는 시기입니다.',
    en: 'A lone tree on a hill. You will establish your own philosophy and foundation.',
  },
  을해: {
    ko: '호수 위 연꽃의 모습입니다. 주변의 도움과 자원이 모여들며 명예와 실속을 동시에 챙깁니다.',
    en: 'Lotus on a peaceful lake. Resources and supporters naturally flow toward you.',
  },
  병자: {
    ko: '밤 호수 위 비치는 햇살입니다. 어둠을 밝히는 해결사로 부각되어 명예와 이름이 널리 알려집니다.',
    en: 'Sun rising over a night lake. Your name and honor will be widely recognized.',
  },
  정축: {
    ko: '설원 위 촛불의 형상입니다. 환경은 차갑지만 지혜와 끈기로 보이지 않는 곳에서 실속을 챙깁니다.',
    en: 'A candle in snowy field. Inner warmth and wisdom move and inspire others.',
  },
  무인: {
    ko: '산속 호랑이의 기세입니다. 리더십이 극대화되고 본인의 주장이 관철되며 새로운 분야를 개척합니다.',
    en: 'A tiger on a mountain. Your leadership is at its peak to lead large projects.',
  },
  기묘: {
    ko: '비옥한 들판에 핀 꽃처럼 조화롭습니다. 재능을 발산하여 꾸준한 수익과 생활의 안정을 기하게 됩니다.',
    en: 'Flowers in a fertile field. Artistic activities flourish with steady income.',
  },
  경진: {
    ko: '진흙 속 솟구치는 백룡의 기운입니다. 대전환점을 맞이하게 되며 과감한 결단이 큰 성공을 부릅니다.',
    en: 'A dragon rising from marsh. A bold decision will completely change your life path.',
  },
  신사: {
    ko: '용광로 속 보석입니다. 규율 안에서 본인을 다듬어야 하며 최상위 계층의 자격을 갖추게 됩니다.',
    en: 'Jewelry refined in a furnace. Following rules will carve you into high social status.',
  },
  임오: {
    ko: '태양 아래 흐르는 강물입니다. 감성과 이성이 교차하며 예술적, 창의적 분야에서 큰 성과를 거둡니다.',
    en: 'Water meeting fire. Passion and charm lead to dynamic social success.',
  },
  계미: {
    ko: '마른 숲에 내리는 단비입니다. 막혔던 일들이 해결되고 귀인의 덕을 보며 갈증이 해소되는 흐름입니다.',
    en: 'Rain on parched land. Obstacles are cleared and mentors appear to help.',
  },
  갑신: {
    ko: '바위산 위 거목의 형상으로 강한 책임감이 따릅니다. 단련을 통해 리더나 큰 인물로 거듭나게 됩니다.',
    en: 'Tree on a rocky cliff. Social pressure molds you into a powerful leader.',
  },
  을유: {
    ko: '칼날 위 핀 꽃처럼 긴장감이 넘칩니다. 유연한 처세술로 경쟁을 뚫고 독보적인 위치를 점하게 됩니다.',
    en: 'Flower on a sharp blade. Your delicate intuition leads to extraordinary success.',
  },
  병술: {
    ko: '지는 저녁 노을입니다. 화려했던 활동을 정리하고 내실을 기하며 안정적 기반을 마련하는 시기입니다.',
    en: 'Sunset over a plain. Mature experience leads to a stable foundation.',
  },
  정해: {
    ko: '밤바다를 비추는 등불입니다. 정신적 성장이 크며 보이지 않는 곳에서 돕는 귀인의 조력이 따릅니다.',
    en: 'Lamp on the night sea. You act as a mentor with deep wisdom and support.',
  },
  무자: {
    ko: '샘물 품은 산처럼 풍요롭습니다. 재물이 남모르게 쌓이는 운세로 경제적 안정을 이룰 수 있습니다.',
    en: 'Spring hidden in a mountain. Financial resources accumulate quietly but steadily.',
  },
  기축: {
    ko: '얼어붙은 논밭처럼 에너지를 비축해야 합니다. 내면 수양에 힘쓰며 다음의 큰 운을 준비하십시오.',
    en: 'Frozen earth waiting for spring. Focus on cultivation to prepare for the next cycle.',
  },
  경인: {
    ko: '숲속 백호처럼 용맹하고 결단력이 빠릅니다. 개척 정신으로 새로운 분야를 장악하는 시기입니다.',
    en: 'Tiger hunting in a forest. You pioneer new fields with bold actions.',
  },
  신묘: {
    ko: '나무 조각하는 정교한 칼입니다. 기술이 극대화되어 남들이 흉내 낼 수 없는 가치를 창출합니다.',
    en: 'A chisel carving a masterpiece. Specialized skills lead to professional success.',
  },
  임진: {
    ko: '바다 속 흑룡의 기세로 스케일이 큰 일에 도전합니다. 큰 변화를 타고 거부가 될 수 있는 운세입니다.',
    en: 'A dragon in the ocean. Large-scale activities bring massive wealth.',
  },
  계사: {
    ko: '안개 걷히고 햇살 비치는 마을입니다. 목표가 명확해집니다.',
    en: 'Fog lifting over a village. Confusion clears.',
  },
  갑오: {
    ko: '여름철 거목입니다. 교육, 문화 사업에서 두각을 나타냅니다.',
    en: 'Tree providing shade. Influence expands through education.',
  },
  을미: {
    ko: '마른 언덕 위 풀입니다. 끈질긴 생명력으로 재물을 모읍니다.',
    en: 'Grass on dry hill. Persistence brings wealth.',
  },
  병신: {
    ko: '금속에 반사되는 햇살입니다. 명예와 인기를 동시에 얻습니다.',
    en: 'Sun reflecting on metal. Fame and social success.',
  },
  정유: {
    ko: '별빛 아래 금빛 봉황입니다. 장인 정신으로 최고의 자리에 오릅니다.',
    en: 'Phoenix under starlight. Master level achieved.',
  },
  무술: {
    ko: '황혼의 사막입니다. 확고한 신념으로 정신적 지주가 됩니다.',
    en: 'Desert at dusk. Unshakable convictions.',
  },
  기해: {
    ko: '비옥한 땅입니다. 물을 만나 재물이 풍족해집니다.',
    en: 'Fertile earth. Wealth accumulates easily.',
  },
  경자: {
    ko: '우물 속의 칼입니다. 냉철한 지성과 연구력이 빛납니다.',
    en: 'Blade in a well. Excellence in research.',
  },
  신축: {
    ko: '진흙 속 보석입니다. 때를 기다리며 가치를 높입니다.',
    en: 'Jewelry in mud. Preparing for a breakthrough.',
  },
  임인: {
    ko: '봄 숲을 적시는 강입니다. 새로운 아이디어로 활로를 엽니다.',
    en: 'River feeding forest. Creative ideas sprout.',
  },
  계묘: {
    ko: '꽃잎 위 이슬입니다. 부드러운 카리스마로 사람을 모읍니다.',
    en: 'Dew on flowers. Gentle charisma.',
  },
  갑진: {
    ko: '기름진 땅 위 거목입니다. 튼튼한 기반 위에서 성공합니다.',
    en: 'Tree on fertile land. Solid business foundation.',
  },
  을사: {
    ko: '열기 속의 풀입니다. 화려한 언변으로 주목받습니다.',
    en: 'Grass in heat. Success through showmanship.',
  },
  병오: {
    ko: '한낮의 태양입니다. 강렬한 에너지로 목표를 달성합니다.',
    en: 'Blazing sun. Explosive energy.',
  },
  정미: {
    ko: '뜨거운 열기입니다. 한 분야의 전문가로 인정받습니다.',
    en: 'Heat on earth. Recognized authority.',
  },
  무신: {
    ko: '광산이 있는 산입니다. 끊임없이 자원을 캐냅니다.',
    en: 'Mountain with minerals. Active wealth creation.',
  },
  기유: {
    ko: '추수하는 들판입니다. 노력의 결실을 거두는 시기입니다.',
    en: 'Harvest field. Hard work pays off.',
  },
  경술: {
    ko: '언덕 위 호랑이입니다. 리더십으로 조직을 이끕니다.',
    en: 'Hill tiger. Charismatic leadership.',
  },
  신해: {
    ko: '물에 씻긴 보석입니다. 당신의 가치가 세상에 드러납니다.',
    en: 'Washed jewelry. Value revealed.',
  },
  임자: {
    ko: '밤의 바다입니다. 깊은 지혜와 포용력을 가집니다.',
    en: 'Night ocean. Immense capacity.',
  },
  계축: { ko: '겨울 비입니다. 고난 속에 내면이 단단해집니다.', en: 'Winter rain. Inner maturity.' },
};
