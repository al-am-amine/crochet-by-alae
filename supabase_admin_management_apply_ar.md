# تفعيل إدارة مستخدمي الأدمن وSuper Admin

هذه الإضافة تجعل صفحة `/admin/super-admin` مخصصة للحساب ذي الدور `super_admin`. الحساب `m.amine.amttout@gmail.com` يُهيأ كـSuper Admin وحيد، ويزيل المخطط الحساب الإداري القديم من جدول صلاحيات الأدمن. لا يحتوي هذا الملف أو الكود على كلمات مرور، ولا يحذف هوية Authentication القديمة نفسها.

## خطوات التفعيل

أولاً شغّلي محتوى `supabase_admin_management.sql` في SQL Editor بعد مخطط `supabase_admin_audit.sql`. هذا ينشئ جدول الأدوار ويقيد قراءة القائمة على Super Admin ويحدّث دوال التحقق المستخدمة في سجل الأمان.

بعد ذلك انشري الدالة `supabase/functions/admin-user-management/index.ts` باسم `admin-user-management` كـSupabase Edge Function. يجب أن تبقى `SUPABASE_SERVICE_ROLE_KEY` و`SUPABASE_ANON_KEY` داخل Secrets الخاصة بالـEdge Function فقط، ولا يجوز وضعهما في متغير يبدأ بـ`VITE_` أو داخل الواجهة.

يستخدم النموذج دعوة بالبريد الإلكتروني بدلاً من إدخال كلمة مرور في لوحة الموقع. بعد إنشاء المستخدم في Authentication، سيظهر صفه في قائمة الحسابات ويمكن لـSuper Admin تفعيل الحساب أو إيقافه. منع الأدمن العادي من فتح الصفحة يجب أن يُفرض مرتين: في الواجهة للوضوح، وفي دالة Supabase للتحقق الفعلي.

## الوضع الحالي

تم تجهيز الواجهة والمسار والطبقة الخادمية والمخطط في نسخة العمل، لكن إنشاء حساب Authentication الفعلي ونشر Edge Function يحتاجان جلسة مالك المشروع في Supabase. جلسة لوحة Supabase السابقة انتهت، ولذلك لم يتم تنفيذ هذه الخطوة الحساسة أونلاين بعد.
