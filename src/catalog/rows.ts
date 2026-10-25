import {
  equipmentCodes,
  type CatalogRow,
  type Pattern,
  type Kind,
} from "./types";
// Authored locally. Rows are explicit established movements; equipment/angle/grip
// variations are included only where setup and loading differ meaningfully.
export const catalogRows: CatalogRow[] = [];
function group(muscle: string, pattern: Pattern, kind: Kind, text: string) {
  for (const line of text.trim().split("\n")) {
    const [name, ar, code, region = "", cue = "", cueAr = "", synonym = ""] =
      line.split("|");
    catalogRows.push({
      name,
      ar,
      equipment: equipmentCodes[code],
      muscle,
      pattern,
      kind,
      regions: region.split(",").filter(Boolean),
      cue,
      cueAr,
      synonyms: synonym ? synonym.split(",") : [],
    });
  }
}
group(
  "Chest",
  "Horizontal Push",
  "Compound",
  `
Bench Press|ضغط صدر بالبار|BB|Mid chest|Use a flat bench, plant both feet and set the bar over your lower chest.|استخدم مقعداً مستوياً وثبّت القدمين وأنزل البار باتجاه أسفل الصدر.|Barbell Bench Press,Flat Barbell Press
Incline Bench Press|ضغط صدر مائل بالبار|BB|Upper chest|Set a modest incline of about 15–30 degrees.|اضبط المقعد على ميل معتدل نحو ١٥–٣٠ درجة.
Decline Barbell Bench Press|ضغط صدر منحدر بالبار|BB|Lower chest|Secure your legs on a decline bench and use a spotter.|ثبّت الساقين على المقعد المنحدر واستعن بمراقب.
Dumbbell Bench Press|ضغط صدر مستوٍ بالدمبل|DB|Mid chest|Start with the dumbbells beside your chest, forearms near vertical.|ابدأ والدمبل بجانبي الصدر والساعدان شبه عموديين.|Flat Dumbbell Press
Incline Dumbbell Press|ضغط صدر مائل بالدمبل|DB|Upper chest|Set the bench to a low incline and keep both feet planted.|اضبط المقعد على ميل خفيف وثبّت القدمين.
Decline Dumbbell Press|ضغط صدر منحدر بالدمبل|DB|Lower chest|Secure your legs and have help positioning heavy dumbbells.|ثبّت ساقيك واطلب المساعدة في تجهيز الدمبل الثقيل.
Neutral Grip Dumbbell Bench Press|ضغط صدر دمبل بقبضة محايدة|DB|Mid chest|Keep the palms facing each other throughout the press.|أبقِ راحتي اليدين متقابلتين أثناء الضغط.
Dumbbell Floor Press|ضغط صدر دمبل على الأرض|DB|Mid chest|Lie on the floor; let upper arms touch down gently between reps.|استلقِ على الأرض ودع العضدين يلامسانها بلطف بين التكرارات.
Barbell Floor Press|ضغط صدر بار على الأرض|BB|Mid chest|Use a rack and pause when the upper arms gently reach the floor.|استخدم حاملاً وتوقف عندما يلامس العضدان الأرض بلطف.
Smith Machine Bench Press|ضغط صدر مستوٍ بالسميث|SM|Mid chest|Position the bench so the fixed bar path stays comfortable at the lower chest.|ضع المقعد بحيث يمر البار الثابت بمسار مريح عند أسفل الصدر.
Incline Smith Machine Press|ضغط صدر مائل بالسميث|SM|Upper chest|Use a low incline and set the safety stops before unracking.|استخدم ميلاً خفيفاً واضبط مصدات الأمان قبل البدء.
Decline Smith Machine Press|ضغط صدر منحدر بالسميث|SM|Lower chest|Secure the bench and legs; set the safety stops above your chest.|ثبّت المقعد والساقين واضبط مصدات الأمان فوق صدرك.
Machine Chest Press|ضغط صدر بالجهاز|MA|Mid chest|Adjust the seat so the handles start around mid-chest height.|اضبط المقعد ليبدأ المقبضان عند منتصف الصدر.
Incline Chest Press Machine|ضغط صدر علوي بالجهاز|PL|Upper chest|Align the seat with the machine's incline press handles.|اضبط المقعد بما يناسب مقابض الضغط المائل.
Decline Chest Press Machine|ضغط صدر سفلي بالجهاز|MA|Lower chest|Adjust the seat and press down and forward along the machine path.|اضبط المقعد واضغط للأمام والأسفل مع مسار الجهاز.
Single Arm Machine Chest Press|ضغط صدر جهاز بذراع واحدة|MA|Mid chest|Use one handle at a time and resist trunk rotation.|استخدم مقبضاً واحداً كل مرة وامنع دوران الجذع.
Standing Cable Chest Press|ضغط صدر بالكابل واقفاً|CB|Mid chest|Use a staggered stance with pulleys around chest height.|اتخذ وقفة متباعدة للأمام والخلف والكابل عند مستوى الصدر.
Single Arm Cable Chest Press|ضغط صدر كابل بذراع واحدة|CB|Mid chest|Set one pulley at chest height and brace against rotation.|اضبط بكرة واحدة عند مستوى الصدر وشد الجذع ضد الدوران.
Resistance Band Chest Press|ضغط صدر بشريط مقاومة|RB|Mid chest|Anchor the band securely behind you at chest height.|ثبّت الشريط خلفك بأمان عند مستوى الصدر.
Push-up|تمرين الضغط|BW|Mid chest|Place hands just wider than shoulders and keep head, hips and heels aligned.|ضع اليدين أوسع قليلاً من الكتفين وحافظ على استقامة الجسم.|Press-up
Incline Push-up|ضغط مائل على سطح مرتفع|BW|Mid chest|Use a stable elevated surface; a higher surface makes the press easier.|استخدم سطحاً مرتفعاً ثابتاً؛ كلما ارتفع السطح سهل الضغط.
Knee Push-up|ضغط على الركبتين|BW|Mid chest|Keep a straight line from head to knees without bending at the hips.|حافظ على خط مستقيم من الرأس إلى الركبتين دون ثني الوركين.
Decline Push-up|ضغط والقدمان مرتفعتان|BW|Upper chest|Elevate feet on a stable low bench and keep hips level.|ارفع القدمين على مقعد منخفض ثابت وحافظ على استواء الحوض.
Ring Push-up|ضغط بحلقات الجمباز|OT|Mid chest|Use securely suspended rings and start at an easy height.|استخدم حلقات مثبتة بأمان وابدأ بارتفاع سهل.
Archer Push-up|ضغط آرتشر|BW|Mid chest|Shift toward one hand while the other arm extends; use a modest range initially.|انقل الوزن نحو يد بينما تمتد الأخرى وابدأ بمدى محدود.
Weighted Push-up|ضغط بوزن إضافي|OT|Mid chest|Use a secure weighted vest rather than an unsecured plate on your back.|استخدم سترة أوزان ثابتة بدلاً من قرص غير مثبت على الظهر.
`,
);
group(
  "Chest",
  "Horizontal Push",
  "Isolation",
  `
Pec Fly Machine|تفتيح صدر بالجهاز|MA|Mid chest|Adjust the seat so your elbows or handles are near chest height.|اضبط المقعد ليكون المرفقان أو المقبضان عند مستوى الصدر.|Pec Deck,Butterfly Machine
Dumbbell Fly|تفتيح صدر بالدمبل|DB|Mid chest|Keep a soft elbow bend and lower only to a comfortable shoulder stretch.|اثنِ المرفقين قليلاً وانزل فقط إلى تمدد مريح للكتف.
Incline Dumbbell Fly|تفتيح صدر مائل بالدمبل|DB|Upper chest|Use a low incline and maintain the same elbow bend through the arc.|استخدم ميلاً خفيفاً وحافظ على انثناء المرفقين خلال الحركة.
Decline Dumbbell Fly|تفتيح صدر منحدر بالدمبل|DB|Lower chest|Secure the legs and use a light load with a controlled arc.|ثبّت الساقين واستخدم وزناً خفيفاً ومساراً متحكماً به.
Cable Chest Fly|تفتيح صدر بالكابل|CB|Mid chest|Set both pulleys at chest height and bring the hands together in front.|اضبط البكرتين عند الصدر وقرّب اليدين أمامك.
High to Low Cable Fly|تفتيح كابل من أعلى لأسفل|CB|Lower chest|Start with high pulleys and sweep the hands toward your lower chest.|ابدأ ببكرات مرتفعة وقرّب اليدين باتجاه أسفل الصدر.
Low to High Cable Fly|تفتيح كابل من أسفل لأعلى|CB|Upper chest|Use low pulleys and bring the hands up toward upper-chest height.|استخدم بكرات منخفضة وارفع اليدين باتجاه أعلى الصدر.
Incline Cable Fly|تفتيح صدر مائل بالكابل|CB|Upper chest|Place an incline bench between low pulleys and use a controlled arc.|ضع مقعداً مائلاً بين بكرتين منخفضتين وتحكم بقوس الحركة.
Single Arm Cable Fly|تفتيح كابل بذراع واحدة|CB|Mid chest|Work one side at a time without twisting the torso.|درّب جانباً واحداً دون لف الجذع.
Resistance Band Chest Fly|تفتيح صدر بشريط مقاومة|RB|Mid chest|Anchor bands securely behind you and keep elbows softly bent.|ثبّت الشرائط خلفك وأبقِ المرفقين مثنيين قليلاً.
`,
);
group(
  "Back",
  "Vertical Pull",
  "Compound",
  `
Lat Pulldown|سحب علوي للظهر|CB|Lats|Set the thigh pad firmly and pull the bar toward your upper chest.|ثبّت وسادة الفخذ واسحب البار نحو أعلى الصدر.|Wide Grip Lat Pulldown
Neutral Grip Lat Pulldown|سحب علوي بقبضة محايدة|CB|Lats|Use parallel handles with palms facing each other.|استخدم مقابض متوازية وراحتا اليدين متقابلتان.
Close Grip Lat Pulldown|سحب علوي بقبضة ضيقة|CB|Lats|Use a close parallel handle and avoid leaning excessively backward.|استخدم مقبضاً ضيقاً متوازياً وتجنب الميل للخلف كثيراً.
Underhand Lat Pulldown|سحب علوي بقبضة معكوسة|CB|Lats|Use a shoulder-width supinated grip without forcing the wrists.|استخدم قبضة معكوسة بعرض الكتفين دون إجبار الرسغين.
Single Arm Lat Pulldown|سحب علوي بذراع واحدة|CB|Lats|Use one handle and keep both hips planted on the seat.|استخدم مقبضاً واحداً وأبقِ الحوض ثابتاً على المقعد.
Half Kneeling Cable Pulldown|سحب علوي كابل بنصف ركوع|CB|Lats|Kneel on one knee beneath a high pulley and keep ribs stacked over hips.|اركع على ركبة تحت بكرة عالية واجعل الأضلاع فوق الحوض.
Machine Pulldown|سحب علوي بالجهاز المحمل بالأقراص|PL|Lats|Adjust the seat and pull the independent handles down toward your ribs.|اضبط المقعد واسحب المقبضين المستقلين نحو الأضلاع.
Pull-ups|عقلة بقبضة علوية|PU|Lats|Start from a comfortable hang and pull the upper chest toward the bar.|ابدأ من تعليق مريح واسحب أعلى الصدر نحو البار.|Pull-up,Overhand Pull-up
Chin-up|عقلة بقبضة معكوسة|PU|Lats|Use a shoulder-width underhand grip and avoid craning the neck.|استخدم قبضة معكوسة بعرض الكتفين وتجنب مد الرقبة للأمام.
Neutral Grip Pull-up|عقلة بقبضة محايدة|PU|Lats|Use parallel bars and keep the descent controlled.|استخدم قضباناً متوازية وتحكم في النزول.
Assisted Pull-up|عقلة بمساعدة الجهاز|MA|Lats|Choose enough counterweight to complete controlled repetitions.|اختر وزناً مساعداً يكفي لإتمام تكرارات متحكم بها.
Band Assisted Pull-up|عقلة بمساعدة شريط|RB|Lats|Check the band and secure it around the bar before stepping into it.|افحص الشريط وثبّته حول البار قبل استخدامه.
Weighted Pull-up|عقلة بوزن إضافي|PU|Lats|Use a secured dip belt after you can perform controlled bodyweight reps.|استخدم حزام أوزان مثبتاً بعد إتقان العقلة بوزن الجسم.
Ring Pull-up|عقلة على الحلقات|OT|Lats|Use secure rings and let your hands rotate naturally.|استخدم حلقات ثابتة واترك اليدين تدوران بشكل طبيعي.
Resistance Band Lat Pulldown|سحب علوي بشريط مقاومة|RB|Lats|Anchor the band overhead on a secure fixed point.|ثبّت الشريط فوق الرأس في نقطة ثابتة وآمنة.
`,
);
group(
  "Back",
  "Horizontal Pull",
  "Compound",
  `
Hammer Strength D.Y. Row|تجديف جهاز دي واي|PL|Lats,Mid back|Support the chest and pull the underhand handles toward the hips.|اسند الصدر واسحب المقابض السفلية نحو الوركين.
Seated Cable Row|تجديف كابل جالس|CB|Mid back|Sit tall with a slight knee bend and pull toward the lower ribs.|اجلس باستقامة واثنِ الركبتين قليلاً واسحب نحو أسفل الأضلاع.
Wide Grip Seated Cable Row|تجديف كابل بقبضة واسعة|CB|Upper back|Use a wide handle and pull toward the upper abdomen without shrugging.|استخدم مقبضاً واسعاً واسحب نحو أعلى البطن دون رفع الكتفين.
Single Arm Cable Row|تجديف كابل بذراع واحدة|CB|Mid back|Keep the pelvis square while drawing one elbow back.|أبقِ الحوض مستقيماً أثناء سحب مرفق واحد للخلف.
Standing Cable Row|تجديف كابل واقف|CB|Mid back|Use a stable split stance and brace against being pulled forward.|اتخذ وقفة ثابتة وشد الجذع كي لا يسحبك الكابل للأمام.
Barbell Bent Over Row|تجديف بار بانحناء|BB|Mid back|Hinge at the hips with a braced trunk and keep the torso angle steady.|انحنِ من الوركين مع شد الجذع وثبّت زاوية الظهر.
Underhand Barbell Row|تجديف بار بقبضة معكوسة|BB|Lats|Use a moderate underhand grip and pull toward the lower abdomen.|استخدم قبضة معكوسة معتدلة واسحب نحو أسفل البطن.
Pendlay Row|تجديف بندلاي|BB|Mid back|Reset the bar on the floor between reps while maintaining a braced torso.|أعد البار للأرض بين التكرارات مع شد الجذع.
T-Bar Row|تجديف تي بار|PL|Mid back|Use the machine's chest pad if present and pull elbows behind the torso.|استخدم وسادة الصدر إن وجدت واسحب المرفقين خلف الجذع.
Landmine Row|تجديف لاندماين|BB|Mid back|Secure one bar end in a landmine attachment and hinge over the handle.|ثبّت طرف البار في قاعدة لاندماين وانحنِ فوق المقبض.
Meadows Row|تجديف ميدوز|BB|Upper back|Stand across a secured landmine bar and row the sleeve with one arm.|قف بجانب بار لاندماين مثبت واسحب طرفه بذراع واحدة.
One Arm Dumbbell Row|تجديف دمبل بذراع واحدة|DB|Lats|Support one hand on a stable bench and keep the trunk square.|اسند يداً على مقعد ثابت وأبقِ الجذع مستقيماً.
Chest Supported Dumbbell Row|تجديف دمبل مسنود الصدر|DB|Mid back|Lie face down on an incline bench with the chest supported.|استلقِ على الصدر على مقعد مائل مع إسناد الصدر.|Chest Supported Row
Dumbbell Bent Over Row|تجديف دمبل بانحناء|DB|Mid back|Hold two dumbbells and maintain a steady hip hinge.|امسك دمبلين وحافظ على انحناء ثابت من الوركين.
Seal Row|تجديف سيل|BB|Mid back|Use a purpose-built high bench with clear space for the bar underneath.|استخدم مقعد سيل مرتفعاً مخصصاً مع مساحة للبار تحته.
Machine High Row|تجديف علوي بالجهاز|PL|Upper back|Adjust the chest support and pull high handles down toward the ribs.|اضبط مسند الصدر واسحب المقابض العالية نحو الأضلاع.
Selectorized Seated Row|تجديف جهاز بأوزان مدمجة|MA|Mid back|Set the chest pad so the handles are reachable without rounding.|اضبط وسادة الصدر لتصل إلى المقابض دون تقويس الظهر.
Smith Machine Row|تجديف بالسميث|SM|Mid back|Hinge beneath a comfortable fixed bar path and brace your trunk.|انحنِ تحت مسار بار مريح وثبّت الجذع.
Inverted Row|تجديف مقلوب بوزن الجسم|BW|Mid back|Use a securely racked bar and keep your body straight.|استخدم باراً مثبتاً جيداً وحافظ على استقامة الجسم.|Australian Pull-up
Ring Row|تجديف بحلقات الجمباز|OT|Mid back|Lean back on secure rings; change foot position to adjust difficulty.|مل للخلف على حلقات ثابتة وعدّل موضع القدمين لتغيير الصعوبة.
Resistance Band Row|تجديف بشريط مقاومة|RB|Mid back|Anchor the band near waist height and row without leaning back.|ثبّت الشريط قرب مستوى الخصر واسحب دون الميل للخلف.
Kettlebell Row|تجديف كيتلبيل|KB|Lats|Support the free hand and keep the bell below your shoulder at the start.|اسند اليد الحرة وابدأ والكيتلبيل تحت الكتف.
Renegade Row|تجديف رينيغيد|DB|Mid back|Use stable hex dumbbells and a wide foot stance to limit rotation.|استخدم دمبل سداسياً ثابتاً ووسّع القدمين لتقليل الدوران.
`,
);
group(
  "Back",
  "Vertical Pull",
  "Isolation",
  `
Straight Arm Cable Pulldown|سحب كابل بذراعين مستقيمتين|CB|Lats|Keep a small fixed elbow bend and pull the handle toward your thighs.|ثبّت انثناء خفيفاً بالمرفقين واسحب المقبض نحو الفخذين.
Dumbbell Pullover|بول أوفر بالدمبل|DB|Lats|Support your head and trunk on a bench and limit shoulder range to comfort.|اسند الرأس والجذع على المقعد وحدد مدى الكتف بما يريحك.
Machine Pullover|بول أوفر بالجهاز|MA|Lats|Align the seat and elbow pads according to the machine instructions.|اضبط المقعد ووسائد المرفقين حسب تعليمات الجهاز.
Resistance Band Straight Arm Pulldown|سحب شريط بذراعين مستقيمتين|RB|Lats|Anchor overhead and keep the ribs down while drawing arms toward the hips.|ثبّت الشريط عالياً وأبقِ الأضلاع منخفضة أثناء السحب للوركين.
`,
);
group(
  "Front deltoids",
  "Vertical Push",
  "Compound",
  `
Shoulder Press|ضغط كتف بالجهاز|MA|Anterior deltoids|Set the seat so handles start around chin height.|اضبط المقعد ليبدأ المقبضان قرب مستوى الذقن.
Dumbbell Shoulder Press|ضغط كتف بالدمبل|DB|Anterior deltoids|Use a supported upright bench and start with forearms vertical.|استخدم مقعداً مسنوداً شبه عمودي وابدأ بساعدين عموديين.
Standing Barbell Overhead Press|ضغط كتف بالبار واقفاً|BB|Anterior deltoids|Brace the trunk and move your head slightly back to clear the bar.|شد الجذع وأرجع الرأس قليلاً ليمر البار.|Military Press,Overhead Press
Seated Barbell Shoulder Press|ضغط كتف بار جالس|BB|Anterior deltoids|Use a supported bench inside a rack with safeties set.|استخدم مقعداً مسنوداً داخل حامل واضبط الأمان.
Standing Dumbbell Shoulder Press|ضغط كتف دمبل واقفاً|DB|Anterior deltoids|Keep ribs stacked above the pelvis without leaning back.|أبقِ الأضلاع فوق الحوض دون الميل للخلف.
Arnold Press|ضغط أرنولد|DB|Anterior deltoids|Rotate the palms smoothly as you press within a comfortable range.|أدر راحتي اليدين بسلاسة أثناء الضغط ضمن مدى مريح.
Single Arm Dumbbell Shoulder Press|ضغط كتف دمبل بذراع واحدة|DB|Anterior deltoids|Press one side while resisting sideways trunk lean.|اضغط بجانب واحد مع مقاومة ميل الجذع جانبياً.
Smith Machine Shoulder Press|ضغط كتف بالسميث|SM|Anterior deltoids|Position the bench so the bar passes in front of the face.|ضع المقعد بحيث يمر البار أمام الوجه.
Landmine Press|ضغط كتف لاندماين|BB|Anterior deltoids|Use a secure landmine and press the bar diagonally upward.|استخدم قاعدة ثابتة واضغط البار قطرياً للأعلى.
Half Kneeling Landmine Press|ضغط لاندماين بنصف ركوع|BB|Anterior deltoids|Kneel on one knee and keep the pelvis level as you press.|اركع على ركبة وأبقِ الحوض مستوياً أثناء الضغط.
Kettlebell Overhead Press|ضغط كتف كيتلبيل|KB|Anterior deltoids|Start from a stable rack position with wrist neutral.|ابدأ بوضع حمل ثابت والرسغ مستقيم.
Z Press|ضغط زد جالساً على الأرض|BB|Anterior deltoids|Sit on the floor with legs extended; use a rack and a light initial load.|اجلس على الأرض والساقان ممدودتان واستخدم حاملاً ووزناً خفيفاً.
Pike Push-up|ضغط بايك|BW|Anterior deltoids|Raise the hips and lower the head between the hands under control.|ارفع الحوض وأنزل الرأس بين اليدين بتحكم.
Wall Handstand Push-up|ضغط وقوف على اليدين عند الجدار|BW|Anterior deltoids|Use wall support, head clearance and a spotter; this is an advanced drill.|استخدم دعماً من الجدار ومساحة للرأس ومراقباً؛ هذه حركة متقدمة.
Resistance Band Overhead Press|ضغط كتف بشريط مقاومة|RB|Anterior deltoids|Stand on the band securely and press without arching your back.|ثبّت الشريط تحت القدمين واضغط دون تقويس الظهر.
`,
);
group(
  "Front deltoids",
  "Shoulder Isolation",
  "Isolation",
  `
Dumbbell Front Raise|رفع أمامي بالدمبل|DB|Anterior deltoids|Raise the dumbbells to about shoulder height with a soft elbow bend.|ارفع الدمبل إلى قرب مستوى الكتف مع انثناء خفيف بالمرفقين.
Cable Front Raise|رفع أمامي بالكابل|CB|Anterior deltoids|Use a low pulley and lift the handle forward without swinging.|استخدم بكرة منخفضة وارفع المقبض للأمام دون تأرجح.
Plate Front Raise|رفع أمامي بقرص وزن|OT|Anterior deltoids|Hold the plate securely at its sides and lift to shoulder level.|أمسك القرص بأمان من جانبيه وارفعه إلى مستوى الكتف.
Resistance Band Front Raise|رفع أمامي بشريط مقاومة|RB|Anterior deltoids|Stand on the band and keep the trunk still while lifting forward.|ثبّت الشريط بالقدمين وأبقِ الجذع ثابتاً أثناء الرفع.
`,
);
group(
  "Side deltoids",
  "Shoulder Isolation",
  "Isolation",
  `
Lateral Raises|رفرفة جانبية بالدمبل|DB|Lateral deltoids|Lift with elbows slightly bent to around shoulder height.|ارفع مع انثناء خفيف بالمرفقين إلى قرب مستوى الكتف.|Dumbbell Lateral Raise
Cable Lateral Raises|رفرفة جانبية بالكابل|CB|Lateral deltoids|Set a low pulley and move the arm out to the side without twisting.|اضبط بكرة منخفضة وحرّك الذراع جانبياً دون لف الجذع.|Cable Lateral Raise
Seated Dumbbell Lateral Raise|رفرفة جانبية دمبل جالساً|DB|Lateral deltoids|Sit upright and lift out to the sides without using the legs.|اجلس باستقامة وارفع جانبياً دون الاستعانة بالساقين.
Machine Lateral Raise|رفرفة جانبية بالجهاز|MA|Lateral deltoids|Align the shoulder joint with the machine pivot and set the pads comfortably.|حاذِ مفصل الكتف مع محور الجهاز واضبط الوسائد براحة.
Lean Away Cable Lateral Raise|رفرفة كابل بميل جانبي|CB|Lateral deltoids|Hold a fixed support and lean away slightly while raising the free arm.|أمسك دعامة ثابتة ومل قليلاً للخارج أثناء رفع الذراع الحرة.
Side Lying Dumbbell Lateral Raise|رفرفة دمبل بالاستلقاء الجانبي|DB|Lateral deltoids|Lie on your side and raise the upper arm within a comfortable arc.|استلقِ على جانبك وارفع الذراع العليا ضمن قوس مريح.
Resistance Band Lateral Raise|رفرفة جانبية بشريط مقاومة|RB|Lateral deltoids|Stand on the band and raise the arms out to the sides slowly.|ثبّت الشريط تحت القدمين وارفع الذراعين جانبياً ببطء.
`,
);
group(
  "Rear deltoids",
  "Shoulder Isolation",
  "Isolation",
  `
Reverse Pec Deck|رفرفة خلفية بالجهاز|MA|Posterior deltoids|Face the chest pad and keep shoulders down as you open the arms.|واجه وسادة الصدر وأبقِ الكتفين منخفضين أثناء فتح الذراعين.
Bent Over Dumbbell Reverse Fly|رفرفة خلفية دمبل بانحناء|DB|Posterior deltoids|Hinge forward and open arms out with a slight fixed elbow bend.|انحنِ للأمام وافتح الذراعين بانثناء خفيف ثابت بالمرفقين.
Chest Supported Reverse Fly|رفرفة خلفية مسنودة الصدر|DB|Posterior deltoids|Lie face down on an incline bench and raise the arms out sideways.|استلقِ على الصدر على مقعد مائل وارفع الذراعين جانبياً.
Cable Reverse Fly|رفرفة خلفية بالكابل|CB|Posterior deltoids|Cross the handles from high pulleys and open the arms without shrugging.|امسك المقابض المتقاطعة من بكرات عالية وافتح الذراعين دون رفع الكتفين.
Face Pull|سحب كابل نحو الوجه|CB|Posterior deltoids|Pull a rope toward the forehead with elbows high and wrists controlled.|اسحب الحبل نحو الجبهة بمرفقين مرتفعين ورسغين متحكم بهما.
Resistance Band Face Pull|سحب شريط نحو الوجه|RB|Posterior deltoids|Anchor near face height and pull toward your forehead gently.|ثبّت الشريط قرب مستوى الوجه واسحب بلطف نحو الجبهة.
Band Pull Apart|فتح شريط المقاومة أمام الصدر|RB|Posterior deltoids|Hold a light band at chest height and spread the hands apart.|أمسك شريطاً خفيفاً عند الصدر وافصل اليدين.
Single Arm Cable Rear Delt Fly|رفرفة كابل خلفية بذراع واحدة|CB|Posterior deltoids|Pull across the body and out to the side while keeping the chest still.|اسحب عبر الجسم ثم جانبياً مع تثبيت الصدر.
`,
);
group(
  "Traps",
  "Shoulder Isolation",
  "Isolation",
  `
Dumbbell/Machine Shrugs|هز كتف دمبل أو جهاز|DB|Upper traps|Lift shoulders straight upward without rolling them.|ارفع الكتفين للأعلى دون تدويرهما.|Dumbbell Shrugs
Barbell Shrug|هز كتف بالبار|BB|Upper traps|Hold the bar in front and lift the shoulders vertically.|أمسك البار أمامك وارفع الكتفين عمودياً.
Smith Machine Shrug|هز كتف بالسميث|SM|Upper traps|Set the bar near thigh height and keep the arms straight.|اضبط البار قرب الفخذين وأبقِ الذراعين مستقيمتين.
Cable Shrug|هز كتف بالكابل|CB|Upper traps|Use low pulleys and shrug without bending the elbows.|استخدم بكرات منخفضة وارفع الكتفين دون ثني المرفقين.
Trap Bar Shrug|هز كتف ببار التراب|TB|Upper traps|Stand centered inside the trap bar and raise both shoulders evenly.|قف في وسط البار وارفع الكتفين بالتساوي.
Machine Shrug|هز كتف بالجهاز|PL|Upper traps|Adjust the handles to thigh height and avoid head movement.|اضبط المقابض عند الفخذين وتجنب تحريك الرأس.
Prone Y Raise|رفع واي بالاستلقاء|DB|Lower traps|Use a light load and lift arms in a Y shape with thumbs upward.|استخدم وزناً خفيفاً وارفع الذراعين بشكل واي والإبهامان للأعلى.
Cable Y Raise|رفع واي بالكابل|CB|Lower traps|Use low crossed cables and raise arms diagonally overhead without arching.|استخدم كابلات متقاطعة منخفضة وارفع قطرياً دون تقويس الظهر.
Prone T Raise|رفع تي بالاستلقاء|DB|Middle traps|Lie chest-supported and lift arms into a T while gently drawing shoulder blades together.|اسند الصدر وارفع الذراعين بشكل تي مع تقريب لوحي الكتف بلطف.
Scapular Pull-up|عقلة بتحريك لوح الكتف|PU|Lower traps|From a comfortable hang, draw the shoulders down without bending the elbows.|من تعليق مريح اخفض الكتفين دون ثني المرفقين.
`,
);
group(
  "Biceps",
  "Elbow Flexion",
  "Isolation",
  `
Biceps Curl|ثني بايسبس بالدمبل|DB|Biceps|Keep elbows near the sides and curl with palms turning upward.|أبقِ المرفقين قرب الجانبين واثنِ مع تدوير الراحتين للأعلى.|Dumbbell Curl
Hammer Curl|ثني مطرقة بالدمبل|DB|Brachialis,Brachioradialis|Keep palms facing each other and wrists neutral.|أبقِ راحتي اليدين متقابلتين والرسغين مستقيمين.
Biceps Curl Machine|بايسبس بالجهاز|MA|Biceps|Align elbows with the machine pivot and keep upper arms on the pad.|حاذِ المرفقين مع محور الجهاز وثبّت العضدين على الوسادة.
Incline Dumbbell Curl|بايسبس دمبل على مقعد مائل|DB|Biceps|Lean against an incline backrest and let the arms hang without forcing the shoulder backward.|اسند ظهرك على مقعد مائل ودع الذراعين تتدليان دون إجبار الكتف للخلف.
Barbell Curl|بايسبس بالبار المستقيم|BB|Biceps|Use a comfortable underhand grip and avoid driving with the hips.|استخدم قبضة معكوسة مريحة وتجنب الدفع بالوركين.
EZ Bar Curl|بايسبس ببار إي زد|EZ|Biceps|Choose a grip on the angled sections that keeps wrists comfortable.|اختر قبضة على الأجزاء المائلة تريح الرسغين.
Dumbbell Preacher Curl|بايسبس بريتشر بالدمبل|DB|Biceps|Support the upper arm on the pad and avoid snapping the elbow straight.|اسند العضد على الوسادة وتجنب فرد المرفق بعنف.|Preacher Curl
EZ Bar Preacher Curl|بايسبس بريتشر ببار إي زد|EZ|Biceps|Keep both upper arms against the pad throughout the curl.|أبقِ العضدين على الوسادة طوال الحركة.
Cable Preacher Curl|بايسبس بريتشر بالكابل|CB|Biceps|Position the preacher bench in line with a low pulley.|ضع مقعد بريتشر بمحاذاة بكرة منخفضة.
Standing Cable Curl|بايسبس كابل واقف|CB|Biceps|Use a low pulley and keep the upper arms beside your ribs.|استخدم بكرة منخفضة وأبقِ العضدين بجانب الأضلاع.
Bayesian Cable Curl|بايسبس كابل بايزيان|CB|Biceps|Face away from a low pulley with the upper arm slightly behind your torso.|ابتعد بوجهك عن بكرة منخفضة والعضد خلف الجذع قليلاً.
High Cable Curl|بايسبس كابل علوي|CB|Biceps|Set pulleys near shoulder height and keep elbows in a comfortable fixed position.|اضبط البكرات قرب الكتفين وثبّت المرفقين بوضع مريح.
Concentration Curl|بايسبس تركيز|DB|Biceps|Sit with the upper arm braced against the inner thigh.|اجلس واسند العضد إلى داخل الفخذ.
Spider Curl|بايسبس سبايدر|DB|Biceps|Lie chest-down on an incline bench with arms hanging forward.|استلقِ على الصدر على مقعد مائل والذراعان متدليتان للأمام.
Seated Alternating Dumbbell Curl|بايسبس دمبل تبادلي جالس|DB|Biceps|Sit upright and curl one arm at a time without shifting your trunk.|اجلس باستقامة واثنِ ذراعاً كل مرة دون تحريك الجذع.
Cross Body Hammer Curl|ثني مطرقة عبر الجسم|DB|Brachialis,Brachioradialis|Curl a neutral-grip dumbbell toward the opposite upper chest.|اثنِ الدمبل بقبضة محايدة نحو أعلى الصدر المقابل.
Rope Hammer Curl|بايسبس مطرقة بالحبل|CB|Brachialis,Brachioradialis|Use a rope on a low pulley with palms facing inward.|استخدم حبلاً على بكرة منخفضة والراحتان للداخل.
Zottman Curl|ثني زوتمان|DB|Biceps,Brachioradialis|Curl palms up, rotate at the top, then lower palms down with a light load.|اثنِ براحتين للأعلى ثم أدرهما وانزل براحتين للأسفل بوزن خفيف.
Resistance Band Curl|بايسبس بشريط مقاومة|RB|Biceps|Stand securely on the band and keep the elbows close to the torso.|ثبّت الشريط بالقدمين وأبقِ المرفقين قريبين من الجذع.
Single Arm Cable Curl|بايسبس كابل بذراع واحدة|CB|Biceps|Use one low handle and avoid turning the shoulder forward.|استخدم مقبضاً منخفضاً واحداً وتجنب دفع الكتف للأمام.
`,
);
group(
  "Forearms",
  "Elbow Flexion",
  "Isolation",
  `
Reverse Barbell Curl|ثني بار بقبضة علوية|BB|Brachioradialis|Use an overhand grip and a light load while keeping wrists straight.|استخدم قبضة علوية ووزناً خفيفاً مع استقامة الرسغين.
Reverse EZ Bar Curl|ثني إي زد بقبضة علوية|EZ|Brachioradialis|Choose a comfortable overhand grip on the angled bar.|اختر قبضة علوية مريحة على البار المائل.
Reverse Cable Curl|ثني كابل بقبضة علوية|CB|Brachioradialis|Use a low straight handle and keep the upper arms still.|استخدم مقبضاً مستقيماً منخفضاً وثبّت العضدين.
`,
);
group(
  "Triceps",
  "Elbow Extension",
  "Isolation",
  `
Triceps Pushdown|دفع ترايسبس بالكابل|CB|Triceps|Keep upper arms near the ribs and extend the elbows without leaning over the handle.|أبقِ العضدين قرب الأضلاع ومد المرفقين دون الانحناء فوق المقبض.|Straight Bar Pushdown
Rope Pushdown|ترايسبس دفع بالحبل|CB|Triceps|Use a rope and extend elbows while keeping shoulders quiet.|استخدم حبلاً ومد المرفقين مع تثبيت الكتفين.
V Bar Pushdown|ترايسبس دفع بمقبض في|CB|Triceps|Use the angled handle and avoid rolling the shoulders forward.|استخدم المقبض المائل وتجنب تدوير الكتفين للأمام.
Single Arm Cable Pushdown|ترايسبس كابل بذراع واحدة|CB|Triceps|Use one high handle and keep the elbow beside your torso.|استخدم مقبضاً عالياً واحداً وأبقِ المرفق بجانب الجذع.
Reverse Grip Pushdown|ترايسبس دفع بقبضة معكوسة|CB|Triceps|Use a comfortable underhand grip and a lighter load.|استخدم قبضة معكوسة مريحة ووزناً أخف.
Overhead Triceps Extension|ترايسبس كابل فوق الرأس|CB|Triceps long head|Face away from the pulley and bend elbows behind the head only as far as comfortable.|ابتعد بوجهك عن البكرة واثنِ المرفقين خلف الرأس بمدى مريح.|Overhead Cable Triceps Extension
Single Arm Overhead Cable Extension|ترايسبس كابل فوق الرأس بذراع واحدة|CB|Triceps long head|Use one handle and stabilize the upper arm without forcing shoulder position.|استخدم مقبضاً واحداً وثبّت العضد دون إجبار وضع الكتف.
Seated Dumbbell Triceps Extension|ترايسبس دمبل فوق الرأس جالساً|DB|Triceps long head|Hold one dumbbell securely with both hands and use a supported seat.|أمسك دمبلاً واحداً بكلتا اليدين واستخدم مقعداً مسنوداً.
Single Arm Dumbbell Triceps Extension|ترايسبس دمبل فوق الرأس بذراع واحدة|DB|Triceps long head|Use a light dumbbell and keep the upper arm in a comfortable overhead position.|استخدم دمبلاً خفيفاً وضع العضد فوق الرأس براحة.
EZ Bar Skull Crusher|ترايسبس استلقاء ببار إي زد|EZ|Triceps|Lower the bar near or behind the head with controlled elbows and use a spotter.|أنزل البار قرب الرأس أو خلفه بتحكم واستعن بمراقب.
Dumbbell Lying Triceps Extension|ترايسبس دمبل بالاستلقاء|DB|Triceps|Lie on a bench and lower dumbbells beside the head without flaring excessively.|استلقِ على مقعد وأنزل الدمبل بجانبي الرأس دون فتح مفرط.
Cable Lying Triceps Extension|ترايسبس كابل بالاستلقاء|CB|Triceps|Place a bench in line with a low pulley behind your head.|ضع مقعداً بمحاذاة بكرة منخفضة خلف الرأس.
Dumbbell Triceps Kickback|ترايسبس كيك باك بالدمبل|DB|Triceps|Hinge forward and hold the upper arm still while extending the elbow.|انحنِ للأمام وثبّت العضد أثناء مد المرفق.
Cable Triceps Kickback|ترايسبس كيك باك بالكابل|CB|Triceps|Use a low handle and keep the upper arm aligned with the torso.|استخدم مقبضاً منخفضاً وأبقِ العضد بمحاذاة الجذع.
Triceps Extension Machine|تمديد ترايسبس بالجهاز|MA|Triceps|Align elbows with the machine pivot and adjust the arm pad.|حاذِ المرفقين بمحور الجهاز واضبط وسادة الذراعين.
Resistance Band Pushdown|دفع ترايسبس بشريط مقاومة|RB|Triceps|Anchor the band overhead and extend elbows beside the torso.|ثبّت الشريط فوق الرأس ومد المرفقين بجانب الجذع.
Resistance Band Overhead Triceps Extension|ترايسبس شريط فوق الرأس|RB|Triceps long head|Secure the band below or behind you and check it cannot slip.|ثبّت الشريط أسفلك أو خلفك وتأكد من عدم انزلاقه.
`,
);
group(
  "Triceps",
  "Horizontal Push",
  "Compound",
  `
Close Grip Bench Press|ضغط صدر بقبضة ضيقة|BB|Triceps|Use a roughly shoulder-width grip, not hands touching, and keep wrists stacked.|استخدم قبضة بعرض الكتفين تقريباً دون تلاصق اليدين وثبّت الرسغين.
Parallel Bar Dip|متوازي بوزن الجسم|OT|Triceps|Use stable parallel bars and lower only to a comfortable shoulder position.|استخدم قضيبين ثابتين وانزل إلى وضع كتف مريح فقط.|Dips
Assisted Dip|متوازي بمساعدة الجهاز|MA|Triceps|Set enough assistance to control the descent and keep shoulders comfortable.|اضبط مساعدة تكفي للتحكم بالنزول وراحة الكتفين.
Machine Triceps Dip|ترايسبس ضغط متوازي بالجهاز|MA|Triceps|Adjust the seat and press the handles downward without lifting the shoulders.|اضبط المقعد واضغط المقابض للأسفل دون رفع الكتفين.
Close Grip Push-up|ضغط بقبضة ضيقة|BW|Triceps|Place hands near shoulder width and keep elbows comfortably close.|ضع اليدين قرب عرض الكتفين وأبقِ المرفقين قريبين براحة.
`,
);
group(
  "Forearms",
  "Shoulder Isolation",
  "Isolation",
  `
Seated Dumbbell Wrist Curl|ثني رسغ بالدمبل جالساً|DB|Wrist flexors|Rest forearms on your thighs with palms up and move only at the wrists.|اسند الساعدين للفخذين والراحتان للأعلى وحرّك الرسغين فقط.
Barbell Wrist Curl|ثني رسغ بالبار|BB|Wrist flexors|Support the forearms on a bench with palms facing upward.|اسند الساعدين على مقعد والراحتان للأعلى.
Reverse Dumbbell Wrist Curl|مد رسغ بالدمبل|DB|Wrist extensors|Support the forearms palms down and raise the knuckles gently.|اسند الساعدين والراحتان للأسفل وارفع مفاصل الأصابع بلطف.
Cable Wrist Curl|ثني رسغ بالكابل|CB|Wrist flexors|Support the forearms and curl a low cable handle using the wrists.|اسند الساعدين واثنِ مقبض كابل منخفضاً بالرسغين.
Dumbbell Pronation and Supination|تدوير الساعد بالدمبل|DB|Forearm rotators|Use a very light lever and rotate the forearm slowly with elbow supported.|استخدم حملاً خفيفاً جداً وأدر الساعد ببطء مع إسناد المرفق.
Plate Pinch Hold|مسك أقراص بالأصابع|OT|Grip|Pinch smooth plates securely and keep feet clear of the drop area.|امسك الأقراص بالأصابع بأمان وأبعد القدمين عن مكان سقوطها.
`,
);
group(
  "Quadriceps",
  "Squat",
  "Compound",
  `
Squat|سكوات بالبار|BB|Quadriceps|Set rack safeties, brace and squat with knees tracking the toes.|اضبط أمان الحامل وشد الجذع واجعل الركبتين باتجاه الأصابع.|Back Squat,Barbell Back Squat
Front Squat|سكوات أمامي بالبار|BB|Quadriceps|Use a secure front rack and keep elbows high enough to support the bar.|استخدم وضعاً أمامياً ثابتاً وارفع المرفقين لدعم البار.
Goblet Squat|سكوات غوبلت|DB|Quadriceps|Hold one dumbbell at chest height and sit between the hips.|أمسك دمبلاً عند الصدر وانزل بين الوركين.
Kettlebell Goblet Squat|سكوات غوبلت كيتلبيل|KB|Quadriceps|Hold the bell by the horns near your chest.|أمسك الكيتلبيل من جانبي المقبض قرب الصدر.
Hack Squat|هاك سكوات|PL|Quadriceps|Keep back on the pad and set the safety stops before loading.|أبقِ الظهر على الوسادة واضبط الأمان قبل إضافة الوزن.
Pendulum Squat|سكوات بندول|PL|Quadriceps|Set the shoulder pads comfortably and stay in contact with the back pad.|اضبط وسائد الكتفين براحة وأبقِ الظهر ملاصقاً للمسند.
Leg Press|ضغط أرجل|PL|Quadriceps|Keep pelvis against the pad and stop before your lower back rounds.|ثبّت الحوض على الوسادة وتوقف قبل تقوس أسفل الظهر.
Horizontal Leg Press|ضغط أرجل أفقي|MA|Quadriceps|Adjust the seat to a comfortable knee bend without lifting the hips.|اضبط المقعد لثني مريح للركبتين دون رفع الحوض.
Single Leg Press|ضغط أرجل بساق واحدة|PL|Quadriceps|Use a lighter load and keep the pelvis level against the pad.|استخدم وزناً أخف وأبقِ الحوض مستوياً على الوسادة.
Smith Machine Squat|سكوات بالسميث|SM|Quadriceps|Choose a foot position that fits the fixed bar path and set stops.|اختر موضع قدم يناسب مسار البار الثابت واضبط الأمان.
Belt Squat|سكوات بحزام أوزان|PL|Quadriceps|Attach the hip belt securely and hold the support handles lightly.|اربط حزام الحوض بأمان وأمسك مقابض الدعم بخفة.
Safety Bar Squat|سكوات ببار الأمان|OT|Quadriceps|Center the padded yoke on the upper back and use rack safeties.|ضع الوسادة وسط أعلى الظهر واستخدم أمان الحامل.
Dumbbell Squat|سكوات بدمبلين|DB|Quadriceps|Hold dumbbells at the sides while keeping your trunk braced.|أمسك الدمبلين بجانب الجسم مع شد الجذع.
Bodyweight Squat|سكوات بوزن الجسم|BW|Quadriceps|Stand in a comfortable stance and lower between your hips.|قف بوضع مريح وانزل بين الوركين.
Box Squat|سكوات على صندوق|BB|Quadriceps|Use a stable box and touch down under control without rocking backward.|استخدم صندوقاً ثابتاً والمسْه بتحكم دون التمايل للخلف.
Heel Elevated Goblet Squat|غوبلت مع رفع الكعبين|DB|Quadriceps|Use a stable squat wedge rather than loose stacked plates.|استخدم إسفين سكوات ثابتاً بدلاً من تكديس أقراص غير ثابتة.
Landmine Squat|سكوات لاندماين|BB|Quadriceps|Hold the secured bar end near the chest and follow its natural arc.|أمسك طرف البار المثبت قرب الصدر واتبع قوسه الطبيعي.
Assisted Pistol Squat|سكوات مسدس بمساعدة|BW|Quadriceps|Hold a fixed support and use only a controllable single-leg depth.|أمسك دعامة ثابتة واستخدم عمقاً تتحكم به على ساق واحدة.
Pistol Squat|سكوات مسدس|BW|Quadriceps|Use a controlled single-leg descent; this requires substantial strength and balance.|انزل بتحكم على ساق واحدة؛ تتطلب الحركة قوة وتوازناً كبيرين.
Wall Sit|جلوس ثابت على الجدار|BW|Quadriceps|Slide down a wall to a comfortable knee angle and hold without breath-holding.|انزلق على جدار لزاوية ركبة مريحة وثبّت دون حبس النفس.
`,
);
group(
  "Quadriceps",
  "Lunge",
  "Compound",
  `
Dumbbell Bulgarian Split Squat|سبليت سكوات بلغاري بالدمبل|DB|Quadriceps|Rest the rear foot on a low stable bench and lower mostly through the front leg.|اسند القدم الخلفية على مقعد منخفض ثابت وانزل عبر الساق الأمامية.|Bulgarian Split Squat
Bodyweight Split Squat|سبليت سكوات بوزن الجسم|BW|Quadriceps|Use a split stance with enough width for balance.|اتخذ وقفة أمامية خلفية بعرض يكفي للتوازن.
Dumbbell Split Squat|سبليت سكوات بالدمبل|DB|Quadriceps|Hold weights at the sides and lower straight down between the feet.|أمسك الأوزان بجانبك وانزل عمودياً بين القدمين.
Smith Machine Split Squat|سبليت سكوات بالسميث|SM|Quadriceps|Set the stance beneath the fixed bar and adjust the safety stops.|اضبط الوقفة تحت البار الثابت وعدّل مصدات الأمان.
Reverse Lunge|اندفاع خلفي بوزن الجسم|BW|Quadriceps|Step backward far enough to lower smoothly without losing balance.|اخطُ للخلف بمسافة تسمح بالنزول بسلاسة دون فقدان التوازن.
Dumbbell Reverse Lunge|اندفاع خلفي بالدمبل|DB|Quadriceps|Hold weights at the sides and step back under control.|أمسك الأوزان بجانبك واخْطُ للخلف بتحكم.
Dumbbell Walking Lunge|اندفاع مشي بالدمبل|DB|Quadriceps|Use clear space and take controlled steps without bouncing.|استخدم مساحة خالية وخطوات متحكم بها دون ارتداد.
Barbell Reverse Lunge|اندفاع خلفي بالبار|BB|Quadriceps|Use a rack to set the bar and keep steps stable.|استخدم حاملاً لوضع البار وحافظ على ثبات الخطوات.
Dumbbell Step-up|صعود صندوق بالدمبل|DB|Quadriceps|Use a stable low box and drive mainly through the leading leg.|استخدم صندوقاً منخفضاً ثابتاً وادفع أساساً بالساق الأمامية.
Bodyweight Step-up|صعود صندوق بوزن الجسم|BW|Quadriceps|Choose a stable step low enough to control the descent.|اختر درجة ثابتة منخفضة بما يسمح بالتحكم في النزول.
Lateral Lunge|اندفاع جانبي|BW|Quadriceps,Adductors|Step to the side and bend the stepping knee while keeping the other leg comfortable.|اخطُ جانبياً واثنِ ركبة الساق المتحركة ضمن مدى مريح.
Dumbbell Lateral Lunge|اندفاع جانبي بالدمبل|DB|Quadriceps,Adductors|Hold light weights and control the sideways weight shift.|أمسك أوزاناً خفيفة وتحكم بنقل الوزن جانبياً.
Front Foot Elevated Split Squat|سبليت سكوات والقدم الأمامية مرتفعة|DB|Quadriceps|Use a stable low platform under the front foot for a comfortable deeper range.|استخدم منصة منخفضة ثابتة تحت القدم الأمامية لمدى أعمق مريح.
`,
);
group(
  "Quadriceps",
  "Knee Extension",
  "Isolation",
  `
Leg Extension|تمديد أرجل بالجهاز|MA|Quadriceps|Align knees with the pivot and set the shin pad above the ankles.|حاذِ الركبتين مع المحور واضبط وسادة الساق فوق الكاحلين.
Single Leg Extension|تمديد أرجل بساق واحدة|MA|Quadriceps|Adjust the machine normally and work one leg without lifting the hip.|اضبط الجهاز كالمعتاد ودرّب ساقاً واحدة دون رفع الورك.
Reverse Nordic Curl|نوردك عكسي|BW|Quadriceps|Kneel on a pad and lean back a short distance while keeping hips extended.|اركع على وسادة ومل للخلف قليلاً مع إبقاء الوركين ممدودين.
Resistance Band Knee Extension|تمديد ركبة بشريط مقاومة|RB|Quadriceps|Anchor the band behind the ankle while seated and extend the knee slowly.|ثبّت الشريط خلف الكاحل وأنت جالس ومد الركبة ببطء.
`,
);
group(
  "Hamstrings",
  "Hip Hinge",
  "Compound",
  `
Romanian Deadlift|ديدلفت روماني بالبار|BB|Hamstrings|Soften the knees and push hips backward while keeping the bar close.|اثنِ الركبتين قليلاً وادفع الحوض للخلف مع إبقاء البار قريباً.
Dumbbell Romanian Deadlift|ديدلفت روماني بالدمبل|DB|Hamstrings|Keep dumbbells close to the thighs and stop when hamstrings limit the hinge.|أبقِ الدمبل قريباً من الفخذين وتوقف عند حد تمدد خلفية الفخذ.
Single Leg Romanian Deadlift|ديدلفت روماني بساق واحدة|DB|Hamstrings|Keep hips facing the floor and use a support if balance limits you.|أبقِ الحوض نحو الأرض واستخدم دعامة إن حدّك التوازن.
Smith Machine Romanian Deadlift|ديدلفت روماني بالسميث|SM|Hamstrings|Set feet to suit the fixed path and hinge with a slight knee bend.|اضبط القدمين لمسار البار الثابت وانحنِ بثني خفيف للركبتين.
Kettlebell Romanian Deadlift|ديدلفت روماني كيتلبيل|KB|Hamstrings|Hold the bell close and hinge backward with the trunk braced.|أبقِ الكيتلبيل قريباً وانحنِ للخلف مع شد الجذع.
Barbell Good Morning|غود مورنينغ بالبار|BB|Hamstrings,Spinal erectors|Start light with rack safeties and hinge at the hips without rounding.|ابدأ خفيفاً مع أمان الحامل وانحنِ من الوركين دون تقويس.
Resistance Band Good Morning|غود مورنينغ بشريط مقاومة|RB|Hamstrings|Secure the band under the feet and across the upper back, not the neck.|ثبّت الشريط تحت القدمين وعبر أعلى الظهر وليس الرقبة.
B Stance Dumbbell Romanian Deadlift|ديدلفت روماني بوقفة بي|DB|Hamstrings|Keep most weight on the front foot while the rear toes provide balance.|حمّل معظم الوزن على القدم الأمامية واجعل أصابع الخلفية للتوازن.
`,
);
group(
  "Hamstrings",
  "Knee Flexion",
  "Isolation",
  `
Seated Leg Curl|ثني أرجل جالس|MA|Hamstrings|Adjust the knee pivot and thigh restraint; keep the hips against the seat.|اضبط محور الركبة ومثبت الفخذ وأبقِ الحوض على المقعد.
Lying Leg Curl|ثني أرجل مستلقياً|MA|Hamstrings|Align knees with the machine pivot and keep hips down on the pad.|حاذِ الركبتين مع محور الجهاز وأبقِ الحوض على الوسادة.
Standing Leg Curl|ثني أرجل واقف|MA|Hamstrings|Align the working knee with the pivot and hold the support handles.|حاذِ الركبة العاملة مع المحور وأمسك مقابض الدعم.
Single Leg Seated Curl|ثني أرجل جالس بساق واحدة|MA|Hamstrings|Use the seated curl setup and work one leg without shifting the pelvis.|استخدم إعداد الثني الجالس ودرّب ساقاً دون تحريك الحوض.
Single Leg Lying Curl|ثني أرجل مستلقٍ بساق واحدة|MA|Hamstrings|Keep both hips on the pad as one leg curls.|أبقِ جانبي الحوض على الوسادة أثناء ثني ساق واحدة.
Nordic Hamstring Curl|ثني نوردك لخلفية الفخذ|BW|Hamstrings|Use a secure ankle anchor and pad under the knees; catch yourself with the hands.|ثبّت الكاحلين بأمان وضع وسادة تحت الركبتين واستند باليدين عند النزول.
Assisted Nordic Curl|ثني نوردك بمساعدة شريط|RB|Hamstrings|Use a secure ankle anchor and an overhead band to reduce the lowering load.|ثبّت الكاحلين واستخدم شريطاً علوياً لتخفيف حمل النزول.
Stability Ball Leg Curl|ثني خلفية الفخذ بكرة توازن|OT|Hamstrings|Lie supine with heels on a ball and curl it in while keeping hips controlled.|استلقِ والكعبان على الكرة واسحبها مع التحكم بالحوض.
Sliding Leg Curl|ثني خلفية الفخذ بالانزلاق|BW|Hamstrings|Use sliders on a clear non-slip area and move heels slowly.|استخدم أقراص انزلاق في مساحة آمنة وحرّك الكعبين ببطء.
Cable Leg Curl|ثني أرجل بالكابل|CB|Hamstrings|Attach an ankle cuff to a low pulley and stabilize the working thigh.|ثبّت رباط الكاحل ببكرة منخفضة وثبّت الفخذ العامل.
Resistance Band Leg Curl|ثني أرجل بشريط مقاومة|RB|Hamstrings|Secure the band to the ankle and a low anchor; avoid twisting the knee.|ثبّت الشريط بالكاحل ونقطة منخفضة وتجنب لف الركبة.
`,
);
group(
  "Spinal erectors",
  "Hip Hinge",
  "Compound",
  `
Conventional Deadlift|ديدلفت تقليدي|BB|Spinal erectors,Glutes,Hamstrings|Start with the bar over midfoot, brace and push the floor away.|ابدأ والبار فوق منتصف القدم وشد الجذع وادفع الأرض بعيداً.
Trap Bar Deadlift|ديدلفت ببار التراب|TB|Spinal erectors,Quadriceps|Stand centered inside the frame and use high handles initially if available.|قف وسط الإطار واستخدم المقابض العالية أولاً إن توفرت.
Sumo Deadlift|ديدلفت سومو|BB|Spinal erectors,Adductors|Use a wide comfortable stance with knees following the toes.|استخدم وقفة واسعة مريحة والركبتان باتجاه الأصابع.
Rack Pull|سحب بار من الحامل|BB|Spinal erectors|Set safeties below or around the knees and start each rep from the stops.|اضبط الأمان قرب الركبتين أو أسفلهما وابدأ كل تكرار من المصدات.
45 Degree Back Extension|تمديد ظهر بزاوية ٤٥ درجة|OT|Spinal erectors|Set the pad below the hip crease and hinge without hyperextending the lower back.|اضبط الوسادة تحت ثنية الورك وانحنِ دون فرط مد أسفل الظهر.
Back Extension Machine|تمديد ظهر بالجهاز|MA|Spinal erectors|Set the pad and range conservatively; do not force extension.|اضبط الوسادة والمدى بتحفظ ولا تجبر الظهر على المد.
Bird Dog|بيرد دوغ|BW|Spinal erectors,Deep core|From hands and knees reach opposite arm and leg without arching the back.|من وضع اليدين والركبتين مد الذراع والساق المقابلتين دون تقويس الظهر.
`,
);
group(
  "Glutes",
  "Hip Hinge",
  "Compound",
  `
Barbell Hip Thrust|دفع حوض بالبار|BB|Glutes|Pad the bar over the hips and support the upper back on a stable bench.|ضع وسادة للبار فوق الحوض واسند أعلى الظهر على مقعد ثابت.
Machine Hip Thrust|دفع حوض بالجهاز|PL|Glutes|Set the belt or pad securely over the hips and avoid lumbar overextension.|ثبّت الحزام أو الوسادة فوق الحوض وتجنب فرط مد أسفل الظهر.
Smith Machine Hip Thrust|دفع حوض بالسميث|SM|Glutes|Secure the bench and set the safeties before moving under the bar.|ثبّت المقعد واضبط الأمان قبل الدخول تحت البار.
Dumbbell Hip Thrust|دفع حوض بالدمبل|DB|Glutes|Hold a padded dumbbell across the hips and use a stable back support.|أمسك دمبلاً مبطناً فوق الحوض واستخدم دعامة ظهر ثابتة.
Glute Bridge|جسر الحوض|BW|Glutes|Lie on your back with feet planted and lift the hips without arching.|استلقِ وثبّت القدمين وارفع الحوض دون تقويس الظهر.
Single Leg Glute Bridge|جسر حوض بساق واحدة|BW|Glutes|Keep the pelvis level as one planted leg lifts the hips.|أبقِ الحوض مستوياً أثناء رفعه بساق واحدة ثابتة.
Cable Pull Through|سحب كابل بين الساقين|CB|Glutes,Hamstrings|Face away from a low pulley and hinge as the rope passes between the legs.|ابتعد بوجهك عن بكرة منخفضة وانحنِ والحبل بين الساقين.
Kettlebell Swing|تأرجح كيتلبيل|KB|Glutes,Hamstrings|Learn the hinge first; drive the bell with the hips rather than lifting with the arms.|أتقن انحناء الورك أولاً وادفع الكيتلبيل بالوركين لا بالذراعين.
Frog Pump|جسر فراشة للحوض|BW|Glutes|Place soles together in a comfortable range and lift the pelvis gently.|اجمع باطني القدمين بمدى مريح وارفع الحوض بلطف.
`,
);
group(
  "Glutes",
  "Hip Hinge",
  "Isolation",
  `
Cable Glute Kickback|ركل خلفي للحوض بالكابل|CB|Glutes|Use a low ankle cuff and extend the hip without twisting or arching.|استخدم رباط كاحل منخفضاً ومد الورك دون لف أو تقويس.
Machine Glute Kickback|ركل خلفي للحوض بالجهاز|MA|Glutes|Adjust the support pads and move the thigh back without lumbar extension.|اضبط وسائد الدعم وحرّك الفخذ للخلف دون مد أسفل الظهر.
Resistance Band Glute Kickback|ركل خلفي بشريط مقاومة|RB|Glutes|Secure the band and keep the pelvis square as you extend the hip.|ثبّت الشريط وأبقِ الحوض مستقيماً أثناء مد الورك.
`,
);
group(
  "Adductors",
  "Hip Adduction",
  "Isolation",
  `
Hip Adduction|تقريب الفخذين بالجهاز|MA|Adductors|Place the pads inside the knees and close the legs slowly.|ضع الوسائد داخل الركبتين وأغلق الساقين ببطء.|Hip Adduction Machine
Cable Hip Adduction|تقريب فخذ بالكابل|CB|Adductors|Attach a low ankle cuff and draw the leg inward while holding support.|ثبّت رباط كاحل منخفضاً واسحب الساق للداخل مع الإمساك بدعامة.
Side Lying Hip Adduction|تقريب فخذ بالاستلقاء الجانبي|BW|Adductors|Lift the lower leg while the top leg rests in front for support.|ارفع الساق السفلية مع إسناد العليا أمامك.
Copenhagen Plank|بلانك كوبنهاغن|BW|Adductors|Start with the upper knee supported on a stable bench and hold briefly.|ابدأ والركبة العليا مسنودة على مقعد ثابت وثبّت لفترة قصيرة.
Resistance Band Hip Adduction|تقريب فخذ بشريط مقاومة|RB|Adductors|Use a secure low anchor and draw the leg across the body gently.|استخدم نقطة تثبيت منخفضة واسحب الساق عبر الجسم بلطف.
`,
);
group(
  "Hip abductors",
  "Hip Abduction",
  "Isolation",
  `
Hip Abduction Machine|تبعيد الفخذين بالجهاز|MA|Hip abductors|Adjust the outer knee pads and open the legs without bouncing.|اضبط وسائد خارج الركبتين وافتح الساقين دون ارتداد.
Cable Hip Abduction|تبعيد فخذ بالكابل|CB|Hip abductors|Stand side-on to a low pulley and move the leg outward without leaning.|قف جانبياً لبكرة منخفضة وحرّك الساق للخارج دون ميل.
Side Lying Hip Abduction|تبعيد فخذ بالاستلقاء الجانبي|BW|Hip abductors|Keep hips stacked and raise the upper leg without rolling backward.|أبقِ الوركين فوق بعضهما وارفع الساق العليا دون التدحرج للخلف.
Banded Lateral Walk|مشي جانبي بشريط مقاومة|RB|Hip abductors|Place a loop above the knees or at the ankles and take small controlled steps.|ضع حلقة فوق الركبتين أو عند الكاحلين وخذ خطوات صغيرة متحكماً بها.
Banded Clamshell|محارة بشريط مقاومة|RB|Hip abductors|Lie on your side with knees bent and open the top knee without rolling the pelvis.|استلقِ جانبياً والركبتان مثنيتان وافتح العليا دون لف الحوض.
Standing Band Hip Abduction|تبعيد فخذ واقف بشريط|RB|Hip abductors|Hold a fixed support and move one leg out against the loop.|أمسك دعامة ثابتة وحرّك ساقاً للخارج ضد الحلقة.
`,
);
group(
  "Calves",
  "Calf Raise",
  "Isolation",
  `
Standing Calf Raises|رفع سمانة واقف|MA|Gastrocnemius|Keep knees softly extended and rise through the balls of the feet.|أبقِ الركبتين ممدودتين قليلاً وارتفع على مقدمة القدمين.
Seated Calf Raises|رفع سمانة جالس|PL|Soleus|Place the pads over the thighs and lift the heels without bouncing.|ضع الوسائد فوق الفخذين وارفع الكعبين دون ارتداد.
Dumbbell Standing Calf Raise|رفع سمانة واقف بالدمبل|DB|Gastrocnemius|Hold a support with one hand and a dumbbell in the other.|أمسك دعامة بيد ودمبلاً بالأخرى.
Single Leg Bodyweight Calf Raise|رفع سمانة بساق واحدة|BW|Gastrocnemius|Hold a railing and raise one heel slowly.|أمسك حاجزاً وارفع كعب ساق واحدة ببطء.
Smith Machine Calf Raise|رفع سمانة بالسميث|SM|Gastrocnemius|Use a stable calf block and set the safety stops.|استخدم منصة سمانة ثابتة واضبط مصدات الأمان.
Leg Press Calf Raise|رفع سمانة على جهاز ضغط الأرجل|PL|Gastrocnemius|Keep the sled secured and the balls of the feet firmly on the plate edge.|ثبّت الزلاجة وضع مقدمة القدمين بأمان على حافة المنصة.
Seated Dumbbell Calf Raise|رفع سمانة جالس بالدمبل|DB|Soleus|Place a padded dumbbell above each knee and lift the heels.|ضع دمبلاً مبطناً فوق كل ركبة وارفع الكعبين.
Bodyweight Standing Calf Raise|رفع سمانة بوزن الجسم|BW|Gastrocnemius|Use a stable surface and lift both heels together under control.|استخدم سطحاً ثابتاً وارفع الكعبين معاً بتحكم.
Donkey Calf Raise Machine|رفع سمانة دونكي بالجهاز|PL|Gastrocnemius|Set the hip pad comfortably and keep the torso supported.|اضبط وسادة الحوض براحة وأبقِ الجذع مسنوداً.
Resistance Band Calf Press|دفع سمانة بشريط مقاومة|RB|Calves|Sit with a band around the forefoot and point the ankle away slowly.|اجلس والشريط حول مقدمة القدم ومد الكاحل ببطء.
`,
);
group(
  "Tibialis anterior",
  "Calf Raise",
  "Isolation",
  `
Wall Tibialis Raise|رفع مقدمة القدم عند الجدار|BW|Tibialis anterior|Lean against a wall with heels planted and lift the toes.|اسند ظهرك للجدار وثبّت الكعبين وارفع الأصابع.|Tibialis Raise
Tibialis Raise Machine|رفع تيبياليس بالجهاز|PL|Tibialis anterior|Secure the feet in the tibialis device and lift the forefeet slowly.|ثبّت القدمين في الجهاز وارفع مقدمتهما ببطء.
Resistance Band Dorsiflexion|ثني كاحل للأعلى بشريط|RB|Tibialis anterior|Anchor the band in front and pull the forefoot toward the shin.|ثبّت الشريط أمامك واسحب مقدمة القدم نحو الساق.
`,
);
group(
  "Abdominals",
  "Core Flexion",
  "Isolation",
  `
Machine Abdominal Crunch|كرنش بطن بالجهاز|MA|Rectus abdominis|Adjust the pads and curl the ribs toward the pelvis without pulling with the neck.|اضبط الوسائد وقرّب الأضلاع للحوض دون سحب بالرقبة.
Hanging Knee Raises|رفع ركبتين بالتعليق|PU|Rectus abdominis|Control the hang and tilt the pelvis upward instead of swinging.|تحكم بالتعليق ومل بالحوض للأعلى بدلاً من التأرجح.
Hanging Leg Raise|رفع ساقين بالتعليق|PU|Rectus abdominis|Lift straight or softly bent legs only as far as you can avoid swinging.|ارفع الساقين مستقيمتين أو بثني خفيف دون تأرجح.
Captain Chair Knee Raise|رفع ركبتين على كرسي البطن|OT|Rectus abdominis|Keep forearms on the pads and curl the pelvis gently upward.|أبقِ الساعدين على الوسائد ولف الحوض للأعلى بلطف.
Cable Crunch|كرنش بطن بالكابل|CB|Rectus abdominis|Kneel under a high rope and curl the ribs toward the pelvis.|اركع تحت حبل عالٍ وقرّب الأضلاع نحو الحوض.
Floor Crunch|كرنش على الأرض|BW|Rectus abdominis|Lift the shoulder blades slightly while leaving the lower back comfortable.|ارفع لوحي الكتف قليلاً مع إبقاء أسفل الظهر مريحاً.
Reverse Crunch|كرنش عكسي|BW|Rectus abdominis|Lie supine and roll the pelvis gently upward without throwing the legs.|استلقِ ولف الحوض بلطف للأعلى دون رمي الساقين.
Decline Crunch|كرنش على مقعد منحدر|BW|Rectus abdominis|Secure the feet and use a small controlled spinal curl.|ثبّت القدمين واستخدم لفاً صغيراً متحكماً به للجذع.
Stability Ball Crunch|كرنش على كرة توازن|OT|Rectus abdominis|Support the lower back on the ball and keep the feet wide for stability.|اسند أسفل الظهر على الكرة ووسّع القدمين للثبات.
Seated Knee Tuck|ضم الركبتين جالساً|BW|Rectus abdominis|Sit on a stable bench and draw knees inward without rounding excessively.|اجلس على مقعد ثابت وضم الركبتين دون تقوس مفرط.
Lying Leg Raise|رفع ساقين بالاستلقاء|BW|Rectus abdominis|Lower the legs only as far as the lower back stays controlled.|أنزل الساقين فقط بالقدر الذي يسمح بثبات أسفل الظهر.
Dumbbell Weighted Crunch|كرنش بدمبل|DB|Rectus abdominis|Hold a light dumbbell against the chest rather than behind the head.|أمسك دمبلاً خفيفاً عند الصدر لا خلف الرأس.
`,
);
group(
  "Obliques",
  "Core Rotation",
  "Isolation",
  `
Cable Wood Chop|قطع خشب بالكابل|CB|Obliques|Rotate through a comfortable range with feet allowed to pivot.|دُر ضمن مدى مريح واترك القدمين تدوران مع الحركة.
Low to High Cable Chop|قطع كابل من أسفل لأعلى|CB|Obliques|Move a low handle diagonally upward without yanking the lower back.|حرّك المقبض المنخفض قطرياً للأعلى دون جذب أسفل الظهر.
Half Kneeling Cable Chop|قطع كابل بنصف ركوع|CB|Obliques|Kneel on one knee and move the handle diagonally with the pelvis stable.|اركع على ركبة وحرّك المقبض قطرياً مع ثبات الحوض.
Russian Twist|لف روسي|BW|Obliques|Keep heels down initially and rotate the rib cage without forcing the spine.|ثبّت الكعبين أولاً ولف القفص الصدري دون إجبار العمود الفقري.
Bicycle Crunch|كرنش دراجة|BW|Obliques|Alternate knee and opposite shoulder without pulling on the head.|بدّل الركبة والكتف المقابل دون السحب بالرأس.
Dumbbell Side Bend|ميل جانبي بالدمبل|DB|Obliques|Hold a single dumbbell and bend gently sideways without twisting.|أمسك دمبلاً واحداً ومل جانبياً بلطف دون دوران.
Resistance Band Wood Chop|قطع خشب بشريط|RB|Obliques|Use a secure diagonal anchor and rotate smoothly through a small range.|استخدم تثبيتاً قطرياً آمناً ودُر بسلاسة ضمن مدى صغير.
`,
);
group(
  "Abdominals",
  "Core Stabilization",
  "Compound",
  `
Forearm Plank|بلانك على الساعدين|BW|Deep core|Place elbows under shoulders and keep ribs and pelvis aligned.|ضع المرفقين تحت الكتفين وأبقِ الأضلاع والحوض بمحاذاة واحدة.|Plank
High Plank|بلانك على اليدين|BW|Deep core|Stack shoulders over hands and keep the hips from sagging.|اجعل الكتفين فوق اليدين وامنع هبوط الحوض.
Dead Bug|ديد باغ|BW|Deep core|Lie supine and extend opposite arm and leg while controlling the lower back.|استلقِ ومد الذراع والساق المقابلتين مع التحكم بأسفل الظهر.
Pallof Press|ضغط بالوف|CB|Deep core,Obliques|Stand sideways to a chest-height pulley and resist rotation as you press out.|قف جانبياً لبكرة عند الصدر وقاوم الدوران أثناء مد اليدين.
Band Pallof Press|ضغط بالوف بشريط|RB|Deep core,Obliques|Secure the band at chest height and keep the trunk facing forward.|ثبّت الشريط عند الصدر وأبقِ الجذع للأمام.
Ab Wheel Rollout|تمديد بعجلة البطن|OT|Deep core|Start from the knees and roll only as far as you can avoid lumbar sag.|ابدأ من الركبتين وتقدم فقط دون هبوط أسفل الظهر.
Stability Ball Rollout|تمديد على كرة توازن|OT|Deep core|Kneel with forearms on the ball and roll forward a short controlled distance.|اركع والساعدان على الكرة وتقدم مسافة قصيرة متحكماً بها.
Hollow Body Hold|تثبيت هولو بودي|BW|Deep core|Start with knees tucked and extend limbs only while keeping trunk control.|ابدأ بالركبتين مثنيتين ومد الأطراف فقط مع ثبات الجذع.
Bear Plank|بلانك الدب|BW|Deep core|From hands and knees lift the knees slightly while keeping the back still.|من وضع اليدين والركبتين ارفع الركبتين قليلاً مع ثبات الظهر.
Plank Shoulder Tap|بلانك مع لمس الكتف|BW|Deep core|Widen the feet and alternate touching the opposite shoulder without rocking.|وسّع القدمين والمس الكتف المقابل بالتبادل دون تمايل.
`,
);
group(
  "Obliques",
  "Core Stabilization",
  "Compound",
  `
Side Plank|بلانك جانبي|BW|Obliques|Stack the elbow under the shoulder and lift the hips without rolling.|ضع المرفق تحت الكتف وارفع الحوض دون دوران.
Knee Side Plank|بلانك جانبي على الركبتين|BW|Obliques|Support bent knees and forearm, keeping hips aligned with shoulders.|اسند الركبتين المثنيتين والساعد وحاذِ الحوض مع الكتفين.
`,
);
group(
  "Full body",
  "Carry",
  "Compound",
  `
Dumbbell Farmer Carry|مشي المزارع بالدمبل|DB|Grip,Deep core|Walk through clear space with weights at the sides and shoulders relaxed.|امشِ في مساحة خالية والأوزان بجانبك والكتفان مرتاحان.
Kettlebell Farmer Carry|مشي المزارع كيتلبيل|KB|Grip,Deep core|Hold a bell in each hand and walk with short stable steps.|أمسك كيتلبيل بكل يد وامشِ بخطوات قصيرة ثابتة.
Suitcase Carry|مشي حقيبة بدمبل واحد|DB|Obliques,Grip|Carry one dumbbell and keep the trunk upright without leaning.|احمل دمبلاً واحداً وأبقِ الجذع قائماً دون ميل.
Kettlebell Front Rack Carry|مشي كيتلبيل بوضع أمامي|KB|Deep core|Hold the bells in a comfortable rack and walk without leaning back.|أمسك الأوزان بوضع أمامي مريح وامشِ دون ميل للخلف.
Trap Bar Farmer Carry|مشي المزارع ببار التراب|TB|Grip,Deep core|Use a clear route and keep the bar level as you walk.|استخدم مساراً خالياً وأبقِ البار مستوياً أثناء المشي.
Sandbag Bear Hug Carry|مشي بحمل كيس رمل أمام الصدر|OT|Deep core|Hug a manageable sandbag close to the chest and keep breathing.|ضم كيس رمل مناسباً قرب الصدر واستمر بالتنفس.
`,
);
group(
  "Full body",
  "Conditioning",
  "Conditioning",
  `
Treadmill Walking|مشي على السير|CE|Cardio|Begin at a comfortable pace and use the safety clip.|ابدأ بسرعة مريحة واستخدم مشبك الأمان.
Treadmill Running|جري على السير|CE|Cardio|Increase speed gradually and avoid stepping onto a fast-moving belt.|زد السرعة تدريجياً ولا تصعد على حزام سريع الحركة.
Incline Treadmill Walking|مشي مائل على السير|CE|Cardio|Choose a manageable incline and walk without hanging from the rails.|اختر ميلاً مناسباً وامشِ دون التعلق بالمقابض.
Stationary Bike|دراجة ثابتة|CE|Cardio|Adjust the seat so the knee remains slightly bent at the bottom.|اضبط المقعد لتبقى الركبة مثنية قليلاً في أسفل الدواسة.
Recumbent Bike|دراجة ثابتة بمسند|CE|Cardio|Set the seat distance to a comfortable knee bend.|اضبط بُعد المقعد لثني مريح للركبة.
Rowing Ergometer|جهاز التجديف الهوائي|CE|Cardio|Drive legs first, then hinge and pull; reverse the sequence to return.|ادفع بالساقين أولاً ثم انحنِ واسحب واعكس الترتيب للعودة.
Elliptical Trainer|جهاز إليبتيكال|CE|Cardio|Stand tall and choose a resistance that allows smooth continuous movement.|قف باستقامة واختر مقاومة تسمح بحركة مستمرة سلسة.
Stair Climber|جهاز صعود الدرج|CE|Cardio|Use a steady pace and avoid supporting your body weight on the rails.|استخدم إيقاعاً ثابتاً ولا تسند وزن الجسم كله على المقابض.
Air Bike|دراجة هوائية بالمروحة|CE|Cardio|Adjust the seat and begin with an easy effort before intervals.|اضبط المقعد وابدأ بجهد سهل قبل الفترات السريعة.
Ski Ergometer|جهاز سكي إرج|CE|Cardio|Keep knees soft and pull handles down using the trunk and arms smoothly.|اثنِ الركبتين قليلاً واسحب المقابض للأسفل بالجذع والذراعين بسلاسة.
Jump Rope|نط الحبل|OT|Cardio|Use a clear space and low relaxed jumps with soft landings.|استخدم مساحة خالية وقفزات منخفضة مريحة وهبوطاً ليناً.
Jumping Jack|قفز جاك|BW|Cardio|Start at a comfortable pace and land softly with knees following toes.|ابدأ بإيقاع مريح واهبط بلطف والركبتان باتجاه الأصابع.
Step Jack|جاك دون قفز|BW|Cardio|Step one foot out at a time rather than jumping.|حرّك قدماً للخارج كل مرة بدلاً من القفز.
High Knees March|مشي برفع الركبتين|BW|Cardio|March in place with controlled knee lifts and upright posture.|امشِ مكانك برفع متحكم به للركبتين وجذع قائم.
Mountain Climber|متسلق الجبل|BW|Cardio,Deep core|Keep hands under shoulders and bring knees forward without sagging the hips.|ضع اليدين تحت الكتفين وقرّب الركبتين دون هبوط الحوض.
Burpee|بيربي|BW|Cardio|Step or jump back to a stable plank and return without rushing the landing.|اخطُ أو اقفز للخلف إلى بلانك ثابت وعد دون استعجال الهبوط.
Battle Rope Waves|تموجات حبال التدريب|OT|Cardio|Use a secure rope anchor and small alternating waves with knees soft.|استخدم تثبيتاً آمناً للحبل وتموجات صغيرة متبادلة مع ثني خفيف للركبتين.
Sled Push|دفع الزلاجة|OT|Cardio,Quadriceps|Choose a clear lane and drive with short stable steps.|اختر مساراً خالياً وادفع بخطوات قصيرة ثابتة.
Sled Drag|سحب الزلاجة|OT|Cardio,Quadriceps|Secure the straps and walk backward slowly in a clear lane.|ثبّت الأحزمة وامشِ للخلف ببطء في مسار خالٍ.
Bear Crawl|مشي الدب|BW|Cardio,Deep core|Keep knees just above the floor and take small opposite-limb steps.|أبقِ الركبتين فوق الأرض قليلاً وخذ خطوات صغيرة بأطراف متقابلة.
Kettlebell Clean|كلين كيتلبيل|KB|Cardio,Glutes|Guide the bell around the wrist smoothly instead of letting it strike the forearm.|وجّه الكيتلبيل حول الرسغ بسلاسة دون ضرب الساعد.
Dumbbell Thruster|ثراستر بالدمبل|DB|Cardio,Quadriceps|Rise from a controlled front squat before pressing the dumbbells overhead.|اصعد من سكوات أمامي متحكم به قبل ضغط الدمبل فوق الرأس.
Box Step Over|تجاوز صندوق بالمشي|BW|Cardio|Use a low stable box and step down under control on the other side.|استخدم صندوقاً منخفضاً ثابتاً وانزل بتحكم للجانب الآخر.
Shuttle Run|جري ذهاباً وإياباً|BW|Cardio|Use a non-slip clear area and decelerate before changing direction.|استخدم مساحة خالية غير زلقة وخفف السرعة قبل تغيير الاتجاه.
`,
);
group(
  "Mobility",
  "Mobility",
  "Mobility",
  `
Cat Cow|تقويس وتمديد الظهر بلطف|BW|Spinal mobility|From hands and knees move the spine gently between comfortable flexion and extension.|من وضع اليدين والركبتين حرّك العمود بلطف بين الثني والمد المريحين.
Thoracic Open Book|فتح الصدر بالاستلقاء الجانبي|BW|Thoracic mobility|Lie on your side with knees bent and open the upper arm without forcing the spine.|استلقِ جانبياً والركبتان مثنيتان وافتح الذراع العليا دون إجبار الظهر.
Quadruped Thoracic Rotation|دوران صدري على أربع|BW|Thoracic mobility|Place one hand behind the head and rotate the upper back gently.|ضع يداً خلف الرأس وأدر أعلى الظهر بلطف.
Hip Flexor Stretch|إطالة مثنيات الورك|BW|Hip mobility|Half kneel, gently tuck the pelvis and move forward a small amount.|اركع نصف ركوع ومل الحوض قليلاً وتقدم مسافة صغيرة.
90 90 Hip Switch|تبديل الوركين ٩٠ ٩٠|BW|Hip mobility|Sit with both knees bent and rotate between sides without forcing the knees.|اجلس والركبتان مثنيتان وبدّل الجانبين دون إجبار الركبتين.
Adductor Rockback|إطالة المقربات بالتأرجح للخلف|BW|Adductor mobility|From hands and one knee, extend the other leg sideways and shift hips back gently.|من اليدين وركبة مد الساق الأخرى جانبياً وانقل الحوض للخلف بلطف.
Ankle Knee to Wall|تحريك الركبة للجدار للكاحل|BW|Ankle mobility|Keep the heel down and move the knee toward the wall along the toe line.|ثبّت الكعب وحرّك الركبة نحو الجدار باتجاه الأصابع.
Calf Wall Stretch|إطالة السمانة عند الجدار|BW|Ankle mobility|Keep the rear heel planted and lean toward the wall gently.|ثبّت الكعب الخلفي ومل نحو الجدار بلطف.
Hamstring Strap Stretch|إطالة خلفية الفخذ بحزام|OT|Hamstring mobility|Lie supine and use a strap to raise one leg without pulling into pain.|استلقِ واستخدم حزاماً لرفع ساق دون شد مؤلم.
Doorway Chest Stretch|إطالة الصدر عند الباب|BW|Shoulder mobility|Rest the forearm on a doorway and turn away a small comfortable amount.|اسند الساعد على إطار باب ولف الجسم قليلاً براحة.
Shoulder Wall Slide|انزلاق كتفين على الجدار|BW|Shoulder mobility|Slide the arms upward only as far as the ribs stay controlled.|حرّك الذراعين للأعلى فقط مع ثبات الأضلاع.
Band Shoulder Pass Through|تمرير شريط فوق الرأس|RB|Shoulder mobility|Use a wide light band grip and do not force the arms behind the body.|استخدم قبضة واسعة لشريط خفيف ولا تجبر الذراعين خلف الجسم.
Worlds Greatest Stretch|اندفاع مع دوران صدري|BW|Full body mobility|From a supported lunge rotate the upper back gently toward the front leg.|من اندفاع مسنود أدر أعلى الظهر بلطف نحو الساق الأمامية.
Deep Squat Hold|تثبيت سكوات عميق مسنود|BW|Hip mobility|Hold a support and use a squat depth that is comfortable for your joints.|أمسك دعامة واستخدم عمق سكوات مريحاً لمفاصلك.
Wrist Rockback|تحريك الرسغ على أربع|BW|Wrist mobility|Place palms on the floor and shift weight gently without painful wrist extension.|ضع الراحتين على الأرض وانقل الوزن بلطف دون مد مؤلم للرسغ.
Arm Circles|دوائر الذراعين|BW|Shoulder warm-up|Start with small slow circles and gradually increase the comfortable arc.|ابدأ بدوائر صغيرة بطيئة وزد القوس المريح تدريجياً.
Leg Swing Front to Back|مرجحة ساق أماماً وخلفاً|BW|Hip warm-up|Hold a support and swing one leg gently without arching the back.|أمسك دعامة وأرجح ساقاً بلطف دون تقويس الظهر.
Leg Swing Side to Side|مرجحة ساق جانبياً|BW|Hip warm-up|Hold a support and use a controlled small sideways swing.|أمسك دعامة واستخدم مرجحة جانبية صغيرة متحكماً بها.
Scapular Push-up|ضغط بتحريك لوح الكتف|BW|Shoulder warm-up|Keep elbows straight and gently move the shoulder blades around the rib cage.|أبقِ المرفقين مستقيمين وحرّك لوحي الكتف بلطف حول الأضلاع.
Glute Bridge March|جسر حوض مع مشي|BW|Hip warm-up|Hold a low bridge and lift one foot at a time without dropping the pelvis.|ثبّت جسراً منخفضاً وارفع قدماً كل مرة دون هبوط الحوض.
`,
);
group(
  "Back",
  "Shoulder Isolation",
  "Isolation",
  `
Prone W Raise|رفع دبليو بالاستلقاء على البطن|BW|Upper back,Lower traps|Lie face down, bend elbows into a W and lift the hands slightly while keeping your neck comfortable.|استلقِ على البطن واثنِ المرفقين بشكل دبليو وارفع اليدين قليلاً مع راحة الرقبة.
Reverse Snow Angel|ملاك ثلج عكسي على البطن|BW|Upper back|Lie face down and sweep arms through a comfortable arc without forcing the shoulders.|استلقِ على البطن وحرّك الذراعين بقوس مريح دون إجبار الكتفين.
`,
);
group(
  "Hamstrings",
  "Hip Hinge",
  "Compound",
  `
Hamstring Walkout|مشي الكعبين من جسر الحوض|BW|Hamstrings|Start in a low bridge, take small heel steps away and return without losing pelvic control.|ابدأ بجسر منخفض واخْطُ بالكعبين بعيداً ثم عد دون فقدان التحكم بالحوض.
`,
);

// Mobility has its own training function, but retains an anatomical target.
const mobilityTargets: Record<string, string> = {
  "Cat Cow": "Spinal erectors",
  "Thoracic Open Book": "Back",
  "Quadruped Thoracic Rotation": "Back",
  "Hip Flexor Stretch": "Quadriceps",
  "90 90 Hip Switch": "Glutes",
  "Adductor Rockback": "Adductors",
  "Ankle Knee to Wall": "Calves",
  "Calf Wall Stretch": "Calves",
  "Hamstring Strap Stretch": "Hamstrings",
  "Doorway Chest Stretch": "Chest",
  "Shoulder Wall Slide": "Front deltoids",
  "Band Shoulder Pass Through": "Front deltoids",
  "Worlds Greatest Stretch": "Full body",
  "Deep Squat Hold": "Quadriceps",
  "Wrist Rockback": "Forearms",
  "Arm Circles": "Front deltoids",
  "Leg Swing Front to Back": "Hamstrings",
  "Leg Swing Side to Side": "Adductors",
  "Scapular Push-up": "Chest",
  "Glute Bridge March": "Glutes",
};
for (const row of catalogRows)
  if (mobilityTargets[row.name]) row.muscle = mobilityTargets[row.name];
