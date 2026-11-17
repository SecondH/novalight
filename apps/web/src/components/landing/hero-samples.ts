/**
 * Landing-hero example content. Everything except businessName/handle is REAL, UNEDITED output of
 * NovaLight's own agent pipeline (Brand Strategist -> Content Planner -> Copywriter -> Visual
 * Prompt Engineer), generated 2026-11-16 with Groq openai/gpt-oss-120b from fictional briefs
 * (see docs/architecture/036-landing-hero-v2.md). Business names and handles are fictional.
 * Curation was selection only: which three ideas fill the up-next row. Never hand-edit the
 * generated strings -- the hero labels them as real AI output; regenerate instead.
 */
export type ContentFormat = 'photo-post' | 'carousel' | 'reel' | 'story';
export type SampleKey = 'cafe' | 'salon' | 'restaurant';

export interface HeroSample {
  key: SampleKey;
  businessName: string;
  handle: string;
  toneDescriptors: string;
  featured: { topic: string; format: ContentFormat; caption: string; visualPrompt: string };
  upNext: { topic: string; format: ContentFormat }[];
  ideaCount: number;
}

export const HERO_SAMPLES: Record<'fa' | 'en', HeroSample[]> = {
  fa: [
    {
      key: 'cafe',
      businessName: 'کافه نارون',
      handle: 'narvan.cafe',
      toneDescriptors: 'صمیمی، گرم، کمی شوخ',
      featured: {
        topic:
          'معرفی نوشیدنی جدید: قهوه کارامل دارچینی مخصوص صبح‌های پرانرژی برای دانشجوها و کارمندان',
        format: 'photo-post',
        caption:
          'صبح‌هاتون رو با یک جرعه انرژی شروع کنید! قهوه کارامل‌دارچینی تازه‌مون، ترکیبی از عطر کارامل شیرین و دارچین گرم، مخصوص دانشجوها و کارمندهای پرکار. هر فنجان یک بوسه‌ی بیداری! همین امروز امتحانش کن و بگو کدوم حس بهتره! ☕️✨📚💼 #قهوه_کارامل #صبح_انرژی #دانشجو #کارمند #نوشیدنی_جدید',
        visualPrompt:
          'A steaming cup of caramel‑cinnamon coffee placed on a wooden desk beside an open notebook and a laptop, soft sunlight filtering through a nearby window, casting gentle warm shadows. The scene is bathed in rich brown and creamy tones, with a cozy, intimate café ambiance. Composition centers the cup, evoking energized yet relaxed morning vibes.',
      },
      upNext: [
        {
          topic:
            'ویدیو پشت صحنه: بارستای ما چگونه با یک حرکت ساده لاتِ آرت می‌سازد و دل همه را می‌برد',
          format: 'reel',
        },
        {
          topic:
            'پیشنهاد ویژه مطالعه: ساعت ۱۴ تا ۱۸ تخفیف ۱۰٪ برای دانشجویان که در فضای آرام کافه می‌نشینند',
          format: 'carousel',
        },
        {
          topic:
            'دسر تابستانی خنک: پارفه توت فرنگی تازه با سس نعنا برای استراحت پس از کلاس‌های طولانی',
          format: 'photo-post',
        },
      ],
      ideaCount: 5,
    },
    {
      key: 'salon',
      businessName: 'سالن رُز',
      handle: 'rose.salon',
      toneDescriptors: 'شیک، آرام، مطمئن',
      featured: {
        topic: 'معرفی سرویس کوتاهی مو با تکنیک جدید مخصوص خانم‌های شاغل در محله',
        format: 'photo-post',
        caption:
          'موهای شما، زمان‌تان را می‌ارزد! ✂️💇‍♀️ با تکنیک جدید کوتاهی مو، مخصوص خانم‌های شاغل در محله، به سرعت و با دقتی شیک و آرام به استایل دلخواه‌تان می‌رسید. تجربه‌ای مطمئن و بی‌دردسر را امروز بچشید. همین حالا رزرو کنید! 🌟 #کوتاهی_مو #تکنیک_جدید #خانم‌های_شاغل #آرایش_محله #استایل_شیک',
        visualPrompt:
          'An elegant modern salon with pastel pink and white walls, soft diffused natural light streaming through a large window; a confident working woman seated in a sleek chair, a skilled female stylist gently cutting her hair with a new technique, close-up on hands and relaxed expression, minimalistic composition, clean lines, calm and empowering mood',
      },
      upNext: [
        {
          topic: 'نگاهی پشت صحنه به آماده‌سازی آرامش‌بخش سالن قبل از ورود مشتریان',
          format: 'reel',
        },
        {
          topic: 'نکات مراقبت از مو پس از سرویس توسط کارشناس ما برای حفظ درخشندگی',
          format: 'carousel',
        },
        {
          topic: 'آمادگی برای هوای سرد پاییز: توصیه‌های تخصصی مراقبت از موهای شما',
          format: 'story',
        },
      ],
      ideaCount: 5,
    },
    {
      key: 'restaurant',
      businessName: 'رستوران سفره',
      handle: 'sofreh.kitchen',
      toneDescriptors: 'خانوادگی، گرم، پرانرژی',
      featured: {
        topic:
          'معرفی منوی ویژه آخر هفته با کباب‌های خوشمزه و دسر خانگی که برای خانواده‌ها آماده شده‌اند',
        format: 'photo-post',
        caption:
          'آخر هفته‌تان را با طعم‌های فراموش‌نشدنی پر کنید! منوی ویژه آخر هفته با کباب‌های خوشمزه‌مان و دسرهای خانگی که مخصوص خانواده‌ها آماده شده‌اند، منتظر شماست. هر لقمه‌اش انرژی و گرما می‌بخشد، لحظات خوشی را برای همه اعضای خانواده‌تان می‌سازد. 🍢🍰🔥👨‍👩‍👧‍👦 همین حالا بیایید و لذت ببرید! #منوی_ویژه #کباب_خانگی #دسر_دست_ساز #خانواده #آخر_هفته',
        visualPrompt:
          'Close-up view of juicy, charred kebabs arranged on a rustic wooden platter beside a steaming, homemade pastry dessert, all set on a textured brick tabletop. Warm, golden lighting highlights the rich, earthy colors of the food and surroundings, creating an inviting, family‑friendly atmosphere that celebrates a special weekend feast.',
      },
      upNext: [
        {
          topic:
            'دعوت به خانواده‌ها برای به اشتراک‌گذاری لحظات گرم در رستوران با هشتگ #خانواده_گرم و برنده شدن یک وعده رایگان',
          format: 'story',
        },
        {
          topic:
            'پیشنهاد ویژه تابستان: سالاد میوه تازه با تخفیف ۲۰٪ برای گروه‌های چهار نفره در روزهای گرم',
          format: 'carousel',
        },
        {
          topic:
            'همکاری با مدرسه محلی برای برگزاری جشن تولد بچه‌ها با منوی مخصوص کودک و حضور معلم‌ها در رستوران',
          format: 'carousel',
        },
      ],
      ideaCount: 5,
    },
  ],
  en: [
    {
      key: 'cafe',
      businessName: 'Narvan Café',
      handle: 'narvan.cafe',
      toneDescriptors: 'friendly, warm, playful',
      featured: {
        topic:
          'Show off our new student discount latte combo with a vibrant photo of the drink and a caption about the limited‑time 15% off for students.',
        format: 'photo-post',
        caption:
          'Hey students, your coffee break just got a makeover! 🎉☕️📚 Our new student discount latte combo is here, and you can enjoy a sweet 15% off—for a limited time only. Warm, frothy, and ready to fuel your study sessions. Come grab yours and taste the savings! Swing by and sip the savings! #StudentDiscount #LatteLove #CoffeeBreak #CampusLife #SipAndSave',
        visualPrompt:
          'A warm, inviting coffee shop scene bathed in soft natural light, featuring a steaming latte in a matte ceramic mug beside a freshly baked pastry on a wooden tabletop. The drink displays creamy latte art, rich brown tones and creamy foam, surrounded by subtle cream‑colored accents and cozy textures, evoking a relaxed student study atmosphere.',
      },
      upNext: [
        {
          topic:
            'Take a fast‑paced reel of our barista artfully pouring latte art while sharing a fun fact about our locally roasted beans.',
          format: 'reel',
        },
        {
          topic:
            'Create a carousel featuring a ‘day in the life’ of a busy office worker grabbing a quick, nutritious breakfast bowl at our cafe, with tips for staying energized.',
          format: 'carousel',
        },
        {
          topic:
            'Post a story series announcing our autumn pumpkin spice muffins, with a poll asking followers which topping they’d love to try.',
          format: 'story',
        },
      ],
      ideaCount: 5,
    },
    {
      key: 'salon',
      businessName: 'Rose Salon',
      handle: 'rose.salon',
      toneDescriptors: 'elegant, calm, confident',
      featured: {
        topic:
          'Showcase our new signature facial for busy professionals with before‑and‑after images highlighting refreshed skin',
        format: 'carousel',
        caption:
          'Revitalize your glow, even on the busiest days. Our new signature facial is crafted for busy professionals, delivering visible refresh in every session. Swipe to see the before‑and‑after transformation—smooth, radiant skin that speaks confidence. ✨💆‍♀️🌿 Book your appointment and let your skin shine. #SignatureFacial #BusyProfessionals #SkinRefresh #GlowUp #SelfCare',
        visualPrompt:
          'A split-screen portrait of a busy professional, left side showing slightly tired skin, right side glowing refreshed skin after a signature facial; background minimal pastel pink and white gradient; soft diffused lighting envelops the face, emphasizing smooth texture; composition centered, clean lines, subtle shadow, calm and rejuvenating mood',
      },
      upNext: [
        {
          topic:
            'A behind‑the‑scenes reel of our lead stylist preparing the salon for a calm, elegant client experience',
          format: 'reel',
        },
        {
          topic:
            'Story featuring a client testimonial video on how a fresh haircut boosted her confidence at work',
          format: 'story',
        },
        {
          topic:
            'Photo‑post of this season’s spring hair color palette, inviting clients to try subtle pastel highlights',
          format: 'photo-post',
        },
      ],
      ideaCount: 5,
    },
    {
      key: 'restaurant',
      businessName: 'Sofreh Kitchen',
      handle: 'sofreh.kitchen',
      toneDescriptors: 'family‑friendly, warm, energetic',
      featured: {
        topic:
          'Show off our weekend Family Feast combo with a vibrant photo of the shared platter, highlighting kid‑friendly favorites and a complimentary dessert.',
        format: 'photo-post',
        caption:
          'Gather round, fam—our Weekend Family Feast is here! 🍽️ A vibrant shared platter packed with kid‑friendly favorites and a complimentary dessert makes every bite a celebration. Warm, energetic vibes fill the table as you create memories together. Bring the whole crew and taste the love. 🌟 Stop by this weekend and share the joy! 👨‍👩‍👧‍👦 #FamilyFeast #WeekendVibes #KidsMenu #DessertTreat #TogetherTime',
        visualPrompt:
          'Close‑up of a rustic wooden table with a shared family platter brimming with kid‑friendly dishes—mini burgers, chicken nuggets, colorful veggie sticks—and a glossy chocolate dessert beside it; warm golden lighting highlights the steam, while brick wall backdrop adds texture; composition centers the food, shallow depth of field, inviting, cozy, celebratory weekend feast atmosphere.',
      },
      upNext: [
        {
          topic:
            "Take followers behind the kitchen doors with a fast‑paced reel of our chef tossing dough and adding colorful toppings for the kids' pizza special.",
          format: 'reel',
        },
        {
          topic:
            'Share a carousel of smiling families enjoying their meals, paired with short quotes from their weekend dining experience.',
          format: 'carousel',
        },
        {
          topic:
            'Announce the limited‑time Summer BBQ Platter perfect for weekend get‑togethers, using a story series with mouth‑watering close‑ups and a swipe‑up link.',
          format: 'story',
        },
      ],
      ideaCount: 5,
    },
  ],
};
