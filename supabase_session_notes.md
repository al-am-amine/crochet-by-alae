# ملاحظات جلسة Supabase

بتاريخ 13 أغسطس 2026، فُتحت لوحة مشروع Crochet by Alae على الرابط:
https://supabase.com/dashboard/project/ikgxaxanhxgnsadkawuz/auth/users

الجلسة المالكة متاحة، وظهرت صفحة Authentication → Users. أظهرت الصفحة الحساب `admin.crochetbyalae@gmail.com` ضمن المستخدمين، مع تقدير إجمالي 10 مستخدمين. تم فتح محرر SQL داخل الصفحة، ولم تُنفذ أي عملية قاعدة بيانات في هذه الملاحظة.

## متابعة التنفيذ

تم فتح SQL Editor في المسار `/dashboard/project/ikgxaxanhxgnsadkawuz/editor`، ثم أُعيد تشغيل المخطط المصحح بنجاح بعد معالجة خطأ صياغة `is_super_admin_user()`. تم فتح جدول `admin_users` للتحقق، ثم عادت الجلسة إلى Authentication → Users. ظهر الحساب القديم ضمن Authentication؛ إنشاء الحساب الإداري الجديد ما زال في نموذج Supabase المفتوح. لا تحتوي هذه الملاحظات على كلمات مرور أو مفاتيح سرية.

تم إنشاء المستخدم `m.amine.amttout@gmail.com` بنجاح من نموذج Supabase Authentication مع تفعيل التأكيد التلقائي. أظهرت الصفحة رسالة نجاح، وظهر الحساب الجديد بجانب الحساب القديم في قائمة Authentication. لم تُحفظ كلمة المرور في المشروع أو في هذه الملاحظات.

تم تشغيل استعلام قراءة على `public.admin_users`، وكانت النتيجة صفاً واحداً فقط: الحساب الجديد بدور `super_admin` وحالة `is_active = true`، مع صلاحيات الإدارة الكاملة. لم يظهر الحساب القديم في جدول صلاحيات الأدمن. هذا يؤكد عزل صلاحيات لوحة الأدمن، مع بقاء هوية الحساب القديم في Authentication فقط.

عند الانتقال لاحقاً إلى صفحة Edge Functions أعادت Supabase توجيه الجلسة إلى صفحة تسجيل الدخول، لذلك لم تُنشر الدالة الخادمية بعد. يلزم تسجيل الدخول مجدداً داخل الجلسة المتصلة قبل متابعة النشر.

تم اختيار Continue with GitHub بناءً على طلب المستخدمة، لكن Supabase أعاد الصفحة إلى تسجيل الدخول وظهر تحقق hCaptcha؛ لم تكتمل جلسة Edge Functions ولم تُنفذ أي عملية نشر للدالة.

عادت الجلسة للعمل في 13 أغسطس 2026، وظهرت صفحة Edge Functions على الرابط:
https://supabase.com/dashboard/project/ikgxaxanhxgnsadkawuz/functions
وتوفر Supabase النشر عبر Via Editor أو Via CLI أو AI Assistant. سيتم استخدام Via Editor لأن مصدر الدالة موجود محلياً ولا توجد جلسة CLI معتمدة.

فتح محرر الدالة عبر:
https://supabase.com/dashboard/project/ikgxaxanhxgnsadkawuz/functions/new
وتم تثبيت اسم الدالة `admin-user-management` في حقل Function name. الكود المحلي الجاهز للرفع موجود في `supabase/functions/admin-user-management/index.ts`.

تم إدخال الكود الكامل في نموذج Monaco داخل محرر Supabase بنجاح، بطول 6180 حرفاً، مع بقاء Service Role Key معتمداً على أسرار Edge Function فقط.

ظهر اسم الدالة `admin-user-management` في النموذج، وتم تشغيل زر Deploy function مباشرة من الواجهة بعد التحقق من أن الزر غير معطل. يلزم فحص رسالة النتيجة أو نافذة التأكيد التالية.

تم نشر الدالة بنجاح وظهرت صفحة التفاصيل:
https://supabase.com/dashboard/project/ikgxaxanhxgnsadkawuz/functions/admin-user-management/details
Endpoint:
https://ikgxaxanhxgnsadkawuz.supabase.co/functions/v1/admin-user-management
صفحة التفاصيل تعرض خيار Verify JWT with legacy secret، مع توصية Supabase بإيقافه عند استخدام تحقق مخصص داخل الدالة؛ الدالة الحالية تتحقق من Bearer token عبر `auth.getUser()` ومن دور Super Admin داخل `admin_users`.

فحص DOM أظهر أن Verify JWT مضبوط على `checked=true`. محاولة النقر البرمجي لم تغيّر الحالة وبقي زر Save changes معطلاً، لذلك ستتم محاولة التبديل عبر عنصر الواجهة المرئي قبل اختبار endpoint.

بعد النقر المرئي بقيت الحالة `checked=true` وزر Save changes معطلاً؛ لم يتم تغيير إعداد Verify JWT. الدالة منشورة ويمكن الانتقال إلى اختبارها، مع ملاحظة أن كودها يطبق تحقق `auth.getUser()` وصلاحية Super Admin بنفسه.
