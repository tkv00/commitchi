const roster = [
  {
    id: 'spark',
    name: '찌릿콩',
    species: 'rabbit-chick',
    sprite: 'assets/sprites/commitchi.png',
    accent: '#77e6c4',
    description: '토끼 귀와 병아리 발을 가진 기본 캐릭터'
  },
  {
    id: 'mogu',
    name: '모구',
    species: 'mushroom',
    sprite: 'assets/sprites/mogu.png',
    accent: '#ff9f68',
    description: '말랑한 버섯 모자를 쓴 숲속 친구'
  },
  {
    id: 'pudding',
    name: '푸딩',
    species: 'droplet-blob',
    sprite: 'assets/sprites/pudding.png',
    accent: '#ffd36e',
    description: '흔들흔들 움직이는 물방울 젤리'
  },
  {
    id: 'luna',
    name: '루나',
    species: 'bat',
    sprite: 'assets/sprites/luna.png',
    accent: '#c3a6ff',
    description: '달빛을 모으는 작은 박쥐'
  },
  {
    id: 'bolt',
    name: '볼트',
    species: 'square-robot',
    sprite: 'assets/sprites/bolt.png',
    accent: '#73b8ff',
    description: '커밋을 에너지로 바꾸는 네모 로봇'
  },
  {
    id: 'moss',
    name: '모스',
    species: 'sprout-turtle',
    sprite: 'assets/sprites/moss.png',
    accent: '#8bd17c',
    description: '등에 새싹을 틔운 느긋한 거북이'
  },
  {
    id: 'ember',
    name: '불씨',
    species: 'flame',
    sprite: 'assets/sprites/ember.png',
    accent: '#ff796d',
    description: '작은 불꽃을 지키는 열정적인 정령'
  },
  {
    id: 'cloud',
    name: '몽실',
    species: 'cloud',
    sprite: 'assets/sprites/cloud.png',
    accent: '#a9d8ff',
    description: '구름처럼 둥실 떠다니는 친구'
  }
];

export const CHARACTERS = Object.freeze(roster.map((character) => Object.freeze(character)));

const normalizedAnchor = 'tkv00';

function hashOwner(owner) {
  let hash = 2166136261;
  for (const character of owner) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const anchorOffset = hashOwner(normalizedAnchor) % CHARACTERS.length;

function normalizeOwner(owner) {
  if (typeof owner !== 'string' || owner.trim().length === 0) {
    throw new TypeError('owner must be a non-empty string');
  }
  return owner.trim().toLowerCase();
}

export function characterFor(owner, generation) {
  const normalizedOwner = normalizeOwner(owner);
  if (!Number.isSafeInteger(generation) || generation < 1) {
    throw new RangeError('generation must be a positive safe integer');
  }
  const ownerOffset = (hashOwner(normalizedOwner) + CHARACTERS.length - anchorOffset) % CHARACTERS.length;
  const index = (ownerOffset + generation - 1) % CHARACTERS.length;
  return CHARACTERS[index];
}

export default { CHARACTERS, characterFor };
