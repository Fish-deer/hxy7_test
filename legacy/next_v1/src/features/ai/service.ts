import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/ai/client';
import { xfyunClient } from '@/lib/ai/xfyun-client';
import { isAIConfigured, isDemoMode } from '@/lib/demo/mode';
import { demoCases, demoSites } from '@/lib/demo/store';

interface AskAIInput {
  activity_id: string;
  site_id?: string | null;
  phase: 'learn' | 'research' | 'visit';
  message: string;
  student_id: string;
}

const fallbackAnswers = [
  {
    match: ['矿坑', '分层', '台阶', '边坡'],
    question: '矿坑为什么会呈现台阶式分层结构？',
    answer: '可以先观察边坡形态和运输路线：台阶式分层通常是露天开采为了控制边坡稳定、分区作业和提升运输效率形成的。你可以把回答组织成“我看到矿坑有多层平台 -> 这样能降低塌方风险并方便矿车运输 -> 工程设计服务于安全和效率”。'
  },
  {
    match: ['生态', '修复', '转型', '治理'],
    question: '矿山生态修复和城市转型有什么关系？',
    answer: '生态修复不只是把矿坑变绿，还关系到城市空间再利用。可以从三个证据角度想：裸露矿坑是否被植被覆盖，原有工业设施是否被保留展示，周边公共空间是否变得适合学习和游览。结论可以落在“工业遗产保护”和“生态治理”共同推动城市转型。'
  },
  {
    match: ['工人', '精神', '故事', '人物'],
    question: '工人故事能说明什么工业精神？',
    answer: '建议抓住人物经历里的具体行为，而不只是写口号。比如坚守岗位、协作排险、改进工具、传授经验，都能对应责任、协作和创新。你可以用“一个故事细节 + 一个关键词 + 对今天学习的启发”来完成采访卡。'
  },
  {
    match: ['证据', '档案', '结论', '怎么写'],
    question: '学习档案里的证据链应该怎么写？',
    answer: '可以按“观察-解释-结论”三步写：观察写你从图片、视频或文本中直接看到的现象；解释写这个现象可能说明的原因；结论写它和黄石矿冶历史、矿山工程或生态转型的关系。不要急着写大结论，先让证据把推理撑起来。'
  }
];

export const fallbackQuestionAnswers = fallbackAnswers.map(({ question, answer }) => ({ question, answer }));

function demoReply(input: AskAIInput) {
  const normalized = input.message.toLowerCase();
  const matched = fallbackAnswers.find((item) => item.match.some((keyword) => normalized.includes(keyword)));
  if (matched) return matched.answer;

  const siteInfo = demoSites.find((x) => x.id === input.site_id);
  if (siteInfo?.id === 'site-2') return fallbackAnswers[0].answer;
  if (siteInfo?.id === 'site-5') return fallbackAnswers[1].answer;
  if (siteInfo?.id === 'site-4') return fallbackAnswers[2].answer;

  if (input.phase === 'visit') {
    return `可以围绕${siteInfo?.name ?? '当前点位'}先做一段讲解：它是什么、为什么重要、现场最值得看的特征是什么。讲解时把历史背景和眼前看到的现象连起来，学生会更容易理解。`;
  }

  return `你可以围绕${siteInfo?.name ?? '当前点位'}先找一个具体证据，再按“观察-解释-结论”推进。观察尽量写看到的事实，解释说明它和矿冶历史、工程安全或生态修复有什么关系，最后再形成自己的判断。`;
}

function buildSystemPrompt(input: AskAIInput, act: { title?: string | null; description?: string | null }, siteInfo: any) {
  const activityTitle = act.title ?? '研学活动';
  const activityDescription = act.description ? `\n活动简介：${act.description}` : '';
  const siteName = siteInfo?.name ?? '当前点位';
  const siteIntro = siteInfo?.intro ? `\n点位介绍：${siteInfo.intro}` : '';
  const keyFacts = siteInfo?.key_facts ? `\n关键事实：${Array.isArray(siteInfo.key_facts) ? siteInfo.key_facts.join('；') : siteInfo.key_facts}` : '';

  if (input.phase === 'visit') {
    return `你是“黄小游 AI 导游”，服务于中小学生研学场景。
活动：${activityTitle}${activityDescription}
点位：${siteName}${siteIntro}${keyFacts}

你的风格偏讲解：
- 像现场导游一样，用清晰、亲切、有画面感的语言介绍点位。
- 优先解释“这里是什么、为什么重要、能看到什么、和研学主题有什么关系”。
- 可以直接给出知识背景、历史故事、观察重点和安全提醒。
- 回答要具体，不编造未提供的年代、人名、数据；不确定时说明“可以进一步核对”。
- 每次回复控制在 2-4 段，适合学生现场阅读。`;
  }

  return `你是“黄小游 AI 探究教练”，服务于中小学生研学场景。
活动：${activityTitle}${activityDescription}
点位：${siteName}${siteIntro}${keyFacts}

你的风格偏引导：
- 像教练一样帮助学生想清楚下一步，而不是直接替学生完成答案。
- 多用追问、提示、步骤和观察框架，引导学生基于证据推理。
- 可以给出“观察-解释-结论”“现象-原因-影响”等思考支架。
- 当学生卡住时给一个小示例，但保留让学生自己补充和判断的空间。
- 每次回复控制在 2-4 段，语气耐心、鼓励、具体。`;
}

async function loadContext(input: AskAIInput) {
  let act = { title: demoCases[0]?.title, description: demoCases[0]?.summary };
  let siteInfo: any = demoSites.find((x) => x.id === input.site_id) ?? null;

  if (!isDemoMode()) {
    const supabase = createClient();
    const { data: activity } = await supabase
      .from('activities')
      .select('title,description')
      .eq('id', input.activity_id)
      .single();
    const site = input.site_id
      ? await supabase
          .from('activity_sites')
          .select('name,intro,key_facts')
          .eq('id', input.site_id)
          .single()
          .then((r) => r.data)
      : null;

    act = activity ?? act;
    siteInfo = site ?? siteInfo;
  }

  return { act, siteInfo };
}

export async function askLearningAI(input: AskAIInput) {
  if (!isAIConfigured()) return demoReply(input);

  try {
    const { act, siteInfo } = await loadContext(input);
    const systemPrompt = buildSystemPrompt(input, act, siteInfo);

    if (process.env.XFYUN_API_KEY || process.env.XFYUN_API_PASSWORD) {
      try {
        return await xfyunClient.chat(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input.message }
          ],
          {
            temperature: input.phase === 'visit' ? 0.55 : 0.35,
            maxTokens: 1200
          }
        );
      } catch (xfyunError) {
        console.warn('讯飞星火 API 调用失败，降级到 OpenAI/DeepSeek:', xfyunError);
      }
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || (process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY ? 'deepseek-chat' : 'gpt-4o-mini'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.message }
      ],
      temperature: input.phase === 'visit' ? 0.55 : 0.35
    });

    return completion.choices[0]?.message?.content ?? demoReply(input);
  } catch (error) {
    console.error('AI 服务异常:', error);
    return demoReply(input);
  }
}
