import React, { useState, useEffect, useCallback } from 'react';
import { FateAlterationType, FATE_ALTERATION_OPTIONS, InterventionType, FortuneResponse } from '../types';

interface FateAlterationProps {
  fortune: FortuneResponse;
  balance: number;
  onPurchase: (cost: number, type: FateAlterationType) => boolean;
  onComplete: (alteredFortune: AlteredFortuneResult) => void;
  onClose: () => void;
}

export interface AlteredFortuneResult {
  type: FateAlterationType;
  originalLuck: string;
  newLuck: string;
  annotation: string;
  intervention: InterventionType;
  interventionMessage?: string;
}

// 强行解释文案库
const SLOPPY_ANNOTATIONS: Record<string, string[]> = {
  '大凶': [
    '雷雨天不出门不就行了？省钱在神社喝茶，这明明是省钱的大吉！',
    '所谓的"凶"，其实是提醒你小心，小心=平安，平安=吉！逻辑完美！',
    '大凶反着读就是凶大，凶大就是把坏运气放大让你看清楚，看清楚就能避开，能避开就是吉！',
  ],
  '凶': [
    '所谓的破财，只要主动捐给神社，就不算"意外"了！这叫"主动积德"！',
    '"凶"字拆开来看就是"凵"里面一个"×"，意思是把坏东西框起来打叉，所以是吉！',
    '古人云：否极泰来。你这个"凶"就是那个"否"，马上就要"泰"了！',
  ],
  '末吉': [
    '什么平淡？这是暴风雨前的宁静！是成大事者的蓄力！',
    '"末"吉的意思是吉运刚开始萌芽，马上就要开花了！',
    '低调的好运才是真正的好运，懂的人都懂。',
  ],
  '小凶': [
    '小凶就是小小的凶，小到可以忽略不计！',
    '"小"凶意味着大运气正在路上，只是现在还看不到而已！',
    '这点小凶，喝杯茶就化解了。来，赛钱。',
  ],
};

const PREMIUM_ANNOTATIONS: string[] = [
  '经博丽神社认证，此签已升级为【大吉】！所有不好的预兆已被神力化解！',
  '本巫女以博丽之名担保，原签文所述之事绝不会发生！（大概）',
  '恭喜！灾难化解成功！请继续支持博丽神社的运营！',
  '神明已收到您的诚意，特此将运势调整为最佳状态！',
];

const LUXURY_ANNOTATIONS: string[] = [
  '不仅是吉，是霸王之吉！天命所归！',
  '这种程度的赛钱...神社未来一年的茶点都有着落了！您就是幻想乡最尊贵的存在！',
  '哇，这家伙给得太多了，连神社的房梁都在发光！',
];

const MARISA_COMMENTS: string[] = [
  '喂灵梦，这家伙给得太多了吧，那张普通的纸都快烧起来了！',
  '哦？有钱人啊。不过再有钱也借不到我的Mini-Hakkero哦~',
  '这么多钱...要不要来我的魔法屋坐坐？我给你看点好东西~',
];

// 第三方监管彩蛋
const YUKARI_INTERVENTIONS: string[] = [
  '哎呀，灵梦又在骗老实人的钱了？这张"大吉"贴纸下面，明明写着"掉进坑里"呢。',
  '隙间里看到了哦~原本的签文可是写着"诸事不宜"呢，呵呵呵~',
  '年轻人，钱可以解决很多问题，但解决不了因果律哦~',
];

const SUIKA_INTERVENTIONS: string[] = [
  '嗝……什么吉不吉的，来喝酒就是大吉！',
  '我说~签文这种东西~喝醉了就看不见了~看不见就不存在~',
  '有酒喝的日子都是大吉！来干杯！',
];

export const FateAlteration: React.FC<FateAlterationProps> = ({
  fortune,
  balance,
  onPurchase,
  onComplete,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<FateAlterationType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'drawing' | 'stamping' | 'sparkling' | 'done'>('idle');
  const [showIntervention, setShowIntervention] = useState(false);
  const [intervention, setIntervention] = useState<InterventionType>(null);
  const [interventionMessage, setInterventionMessage] = useState('');
  const [annotation, setAnnotation] = useState('');

  const canAfford = useCallback((cost: number) => balance >= cost, [balance]);

  const getAnnotation = useCallback((type: FateAlterationType, luck: string) => {
    if (type === 'luxury') {
      return LUXURY_ANNOTATIONS[Math.floor(Math.random() * LUXURY_ANNOTATIONS.length)];
    }
    if (type === 'premium') {
      return PREMIUM_ANNOTATIONS[Math.floor(Math.random() * PREMIUM_ANNOTATIONS.length)];
    }
    // Sloppy version
    const pool = SLOPPY_ANNOTATIONS[luck] || SLOPPY_ANNOTATIONS['凶'];
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const handlePurchase = async (type: FateAlterationType) => {
    const option = FATE_ALTERATION_OPTIONS.find(o => o.type === type);
    if (!option || !canAfford(option.cost)) return;

    const success = onPurchase(option.cost, type);
    if (!success) return;

    setSelectedType(type);
    setIsProcessing(true);
    setAnnotation(getAnnotation(type, fortune.luck));

    // Animation sequence
    if (type === 'sloppy') {
      setAnimationPhase('drawing');
      await new Promise(r => setTimeout(r, 2000));
    } else if (type === 'premium') {
      setAnimationPhase('stamping');
      await new Promise(r => setTimeout(r, 1500));
    } else {
      setAnimationPhase('sparkling');
      await new Promise(r => setTimeout(r, 2500));
    }

    setAnimationPhase('done');

    // 10% chance of intervention
    if (Math.random() < 0.1) {
      await new Promise(r => setTimeout(r, 1000));
      const isYukari = Math.random() < 0.5;
      setIntervention(isYukari ? 'yukari' : 'suika');
      setInterventionMessage(
        isYukari 
          ? YUKARI_INTERVENTIONS[Math.floor(Math.random() * YUKARI_INTERVENTIONS.length)]
          : SUIKA_INTERVENTIONS[Math.floor(Math.random() * SUIKA_INTERVENTIONS.length)]
      );
      setShowIntervention(true);
    }

    setIsProcessing(false);
  };

  const handleComplete = () => {
    if (!selectedType) return;
    onComplete({
      type: selectedType,
      originalLuck: fortune.luck,
      newLuck: selectedType === 'sloppy' ? '吉（大概）' : '大吉',
      annotation,
      intervention,
      interventionMessage: intervention ? interventionMessage : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-red-600 text-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-bold text-center">改命服务</h2>
          <p className="text-center text-red-200 text-sm mt-1">
            "对神明的指示不满意？或许有些误会……"
          </p>
        </div>

        <div className="p-6">
          {/* Original fortune display */}
          <div className="mb-6 p-4 bg-gray-100 rounded-lg relative">
            <div className="text-center">
              <span className={`text-2xl font-bold ${
                fortune.luck.includes('凶') ? 'text-gray-700' : 'text-amber-600'
              }`}>
                【{fortune.luck}】
              </span>
              <p className="text-gray-600 mt-2 text-sm">{fortune.comment}</p>
            </div>

            {/* Animation overlays */}
            {animationPhase === 'drawing' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse">
                  <svg className="w-32 h-32 text-red-600" viewBox="0 0 100 100">
                    <line 
                      x1="20" y1="20" x2="80" y2="80" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-draw-line"
                    />
                    <line 
                      x1="80" y1="20" x2="20" y2="80" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-draw-line"
                      style={{ animationDelay: '0.5s' }}
                    />
                  </svg>
                </div>
              </div>
            )}

            {animationPhase === 'stamping' && (
              <div className="absolute inset-0 flex items-center justify-center animate-bounce">
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-red-800 shadow-lg transform rotate-12">
                  博丽認證<br/>大吉
                </div>
              </div>
            )}

            {animationPhase === 'sparkling' && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 animate-pulse rounded-lg flex items-center justify-center">
                <div className="text-4xl font-bold text-white drop-shadow-lg animate-bounce">
                  ✨ 大吉 ✨
                </div>
              </div>
            )}

            {animationPhase === 'done' && selectedType && (
              <div className={`absolute inset-0 rounded-lg flex flex-col items-center justify-center ${
                selectedType === 'luxury' 
                  ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500' 
                  : 'bg-white/95'
              }`}>
                {selectedType === 'premium' && (
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-red-800 shadow-lg transform rotate-6">
                    博丽認證<br/>大吉
                  </div>
                )}
                {selectedType === 'luxury' && (
                  <div className="text-3xl font-bold text-white drop-shadow-lg">
                    ✨ 霸王之吉 ✨
                  </div>
                )}
                {selectedType === 'sloppy' && (
                  <div className="text-xl font-bold text-gray-700 line-through decoration-red-500 decoration-4">
                    原文已修正
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Annotation */}
          {animationPhase === 'done' && annotation && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm font-medium text-red-800">灵梦批注：</p>
              <p className="text-red-700 mt-1">{annotation}</p>
            </div>
          )}

          {/* Marisa cameo for luxury */}
          {animationPhase === 'done' && selectedType === 'luxury' && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm font-medium text-yellow-800">🌟 魔理沙探头：</p>
              <p className="text-yellow-700 mt-1">
                {MARISA_COMMENTS[Math.floor(Math.random() * MARISA_COMMENTS.length)]}
              </p>
            </div>
          )}

          {/* Intervention event */}
          {showIntervention && intervention && (
            <div className={`mb-6 p-4 rounded border-l-4 ${
              intervention === 'yukari' 
                ? 'bg-purple-50 border-purple-500' 
                : 'bg-orange-50 border-orange-500'
            }`}>
              <p className={`text-sm font-medium ${
                intervention === 'yukari' ? 'text-purple-800' : 'text-orange-800'
              }`}>
                {intervention === 'yukari' ? '🌀 隙间裂开...' : '🍶 酒葫芦砸了过来！'}
              </p>
              <p className={`mt-1 ${
                intervention === 'yukari' ? 'text-purple-700' : 'text-orange-700'
              }`}>
                {interventionMessage}
              </p>
              {intervention === 'yukari' && (
                <p className="text-xs text-purple-500 mt-2">（注：赛钱不退。这非常真实。）</p>
              )}
              {intervention === 'suika' && (
                <p className="text-xs text-orange-500 mt-2">（签文变得模糊不清了...但心情莫名变好）</p>
              )}
            </div>
          )}

          {/* Options */}
          {animationPhase === 'idle' && (
            <div className="space-y-3">
              {FATE_ALTERATION_OPTIONS.map(option => (
                <button
                  key={option.type}
                  onClick={() => handlePurchase(option.type)}
                  disabled={!canAfford(option.cost) || isProcessing}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    canAfford(option.cost)
                      ? 'border-red-300 hover:border-red-500 hover:bg-red-50 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-red-800">{option.name}</span>
                      <span className="text-gray-500 text-sm ml-2">- {option.description}</span>
                    </div>
                    <span className={`font-bold ${canAfford(option.cost) ? 'text-amber-600' : 'text-gray-400'}`}>
                      ¥{option.cost}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Balance display */}
          <div className="mt-6 text-center text-sm text-gray-500">
            当前余额：<span className="font-bold text-amber-600">¥{balance}</span>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {animationPhase === 'done' ? (
              <button
                onClick={handleComplete}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                收下这份"大吉"
              </button>
            ) : (
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                算了，认命
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes draw-line {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw-line {
          stroke-dasharray: 100;
          animation: draw-line 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
